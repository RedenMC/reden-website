<script lang="ts" setup>
import type {
  ListLitematicaResponse,
  MachineDef,
} from '~/pages/litematica/index.vue';
import { toast } from 'vuetify-sonner';
import { useI18n } from 'vue-i18n';
import RedenRouter from '~/components/RedenRouter.vue';
import RedenPostStatusChip from '~/components/litematica/RedenPostStatusChip.vue';

definePageMeta({
  needLogin: true,
});
const { t } = useI18n();
useHead({
  title: 'Review Litematica',
  titleTemplate: '%s - Reden',
});

const page = useRouteQuery<number>('page', 1);
const status = useRouteQuery<PostStatus>('status', PostStatus.Pending);
const {
  data,
  status: queryStatus,
  error,
  refresh,
} = useFetch<ListLitematicaResponse>(
  () =>
    `/api/mc-services/litematica/archiver-review?page=${page.value}&status=${status.value}`,
);
if (import.meta.client && queryStatus.value !== 'pending' && !data.value) {
  // load failure, refresh
  refresh();
}

watch(error, (value) => {
  if (value) {
    toast.error(value.message);
    if (value.statusCode === 403) {
      throw value;
    }
  }
});

const localizedData = ref<Record<string, MachineDef>>();
const currentLoadedData = ref<string>();
const rejectReason = ref<string>();
</script>

<template>
  <div>
    <v-col>
      Filter:
      <v-select
        class="d-inline-block"
        v-model="status"
        :items="allPostTypes"
        hide-details
      >
        <template #selection>
          <reden-post-status-chip :value="status" />
        </template>
      </v-select>
    </v-col>
    <v-data-table-server
      v-model:page="page"
      :headers="[
        { title: 'Name', key: 'name' },
        { title: 'Author', key: 'author' },
        { title: 'Type', key: 'type' },
        { title: 'Tags', key: 'featureTags' },
        { title: t('common.description'), key: 'description' },
        { title: t('litematica_generator.updated_at'), key: 'updatedAt' },
        { title: 'Actions', key: 'edit', minWidth: '180px' },
        { title: 'Status', key: 'status' },
      ]"
      :items="data?.d"
      :items-length="data?.count ?? 10000"
      :items-per-page-options="[10]"
      :loading="queryStatus === 'pending'"
    >
      <template #[`item.featureTags`]="{ value }">
        <div v-if="value?.length" class="d-flex align-center">
          <v-chip size="small">
            {{ value[0].name }}
          </v-chip>
          <span v-if="value.length > 1" class="ml-1">...</span>
        </div>
      </template>
      <template #[`item.description`]="{ value }">
        <div
          style="
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          "
        >
          {{ value }}
        </div>
      </template>
      <template #[`item.name`]="{ item, value }">
        <reden-router :to="`/litematica/${item.key}`">
          <div
            style="
              max-width: 200px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            "
          >
            {{ value }}
          </div>
        </reden-router>
      </template>
      <template #[`item.author`]="{ value }">
        <reden-router :to="`/@${value.username}`">
          <div
            style="
              max-width: 100px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            "
          >
            {{ value.username }}
          </div>
        </reden-router>
      </template>
      <template #[`item.edit`]="{ item }">
        <v-btn
          color="primary"
          icon
          @click="
            async () => {
              localizedData = await (
                await doFetchGet(`/api/mc-services/yisibite/${item.key}/info`)
              ).json();
              currentLoadedData = item.key;
            }
          "
        >
          <v-icon>mdi-pencil</v-icon>
          <v-dialog
            :model-value="currentLoadedData === item.key"
            activator="parent"
            close-on-back
            max-width="900"
            persistent
          >
            <v-card variant="flat">
              <LitematicaUpload v-model:machine="localizedData" edit-mode />
              <div class="position-absolute top-0 right-0">
                <v-btn
                  icon="mdi-close"
                  variant="plain"
                  @click="currentLoadedData = undefined"
                />
              </div>
            </v-card>
          </v-dialog>
        </v-btn>
        <v-btn
          color="success"
          icon
          @click="
            async () => {
              await doFetchPost(
                `/api/mc-services/yisibite/${item.key}/approve`,
                {},
              );
              toast.success('已通过');
            }
          "
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn color="error" icon>
          <v-icon>mdi-close</v-icon>
          <v-dialog activator="parent" close-on-back max-width="900">
            <v-form
              @submit.prevent="
                async (e) => {
                  if (!(await e).valid) {
                    return;
                  }
                  await doFetchPost(
                    `/api/mc-services/yisibite/${item.key}/reject`,
                    { reason: rejectReason },
                  );
                  toast.success('已拒绝');
                }
              "
            >
              <v-card variant="flat">
                <v-card-text>
                  <v-text-field
                    v-model="rejectReason"
                    label="拒绝理由"
                    outlined
                  />
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="error" type="submit">拒绝</v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </v-btn>
      </template>
      <template #[`item.updatedAt`]="{ value }">
        {{ new Date(value).toLocaleString() }}
      </template>
      <template #[`item.status`]="{ value }">
        <reden-post-status-chip :value="value" />
      </template>
    </v-data-table-server>
  </div>
</template>

<style scoped></style>
