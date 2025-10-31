<script lang="ts" setup>
import type {
  ListLitematicaResponse,
  MachineDef,
} from '~/pages/litematica/index.vue';
import RedenPostStatusChip from '~/components/litematica/RedenPostStatusChip.vue';

const page = useRouteQuery<number>('page', 1);
const totalItems = ref(100);
const { data, status } = useFetch<ListLitematicaResponse>(
  () => `/api/mc-services/yisibite/me?page=${page.value}&pageSize=10`,
);
watch(data, (value) => {
  if (value) {
    totalItems.value = value.count;
  }
});

const localizedData = ref<Record<string, MachineDef>>();
const currentLoadedData = ref<string>();
</script>

<template>
  <h1>投稿管理</h1>
  <p>在这里可以查看您的所有投稿</p>
  <v-data-table-server
    v-model:page="page"
    :headers="[
      // { title: 'ID', key: 'key' },
      { title: '名称', key: 'name' },
      { title: '类型', key: 'type' },
      { title: '描述', key: 'description' },
      { title: '更新时间', key: 'updatedAt' },
      { title: '编辑', key: 'edit' },
      { title: '状态', key: 'status' },
    ]"
    :items="data?.d"
    :items-length="totalItems"
    :items-per-page-options="[10]"
    :loading="status === 'pending'"
  >
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
    </template>
    <template #[`item.updatedAt`]="{ value }">
      {{ new Date(value).toLocaleString() }}
    </template>
    <template #[`item.status`]="{ value }">
      <reden-post-status-chip :value="value" />
    </template>
  </v-data-table-server>
</template>

<style scoped></style>
