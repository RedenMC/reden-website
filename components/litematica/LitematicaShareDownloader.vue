<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Machine } from '~/pages/litematica/index.vue';
import { size2text, timeSince } from '~/utils/constants';
import { useAppStore } from '~/store/app';
import { toast } from 'vuetify-sonner';
import * as localforage from 'localforage';
import { useRouter } from 'vue-router';

const props = defineProps<{
  selected: Machine;
}>();

const router = useRouter();
const { t } = useI18n();
const appStore = useAppStore();
const previewing = ref(-1);
const blob = ref<Blob[]>([]);
const localeRoute = useLocaleRoute();

async function loadBlob(index: number, bypassLimit: boolean = false) {
  if (blob.value[index]) {
    previewing.value = index;
    return;
  }
  const url = props.selected.attachments?.[index]?.url;
  if (!url) {
    toast.error(`No url for index #${index}.`);
    return;
  }
  if (!bypassLimit && props.selected!.attachments![index].size > 30 * 1024) {
    toast.error(t('这个投影太大了 (30 KB)，不支持预览，请下载后在本地查看。'));
    previewing.value = -1;
    return;
  }
  try {
    previewing.value = index;
    blob.value[index] = await (
      await fetch(
        url.startsWith('https://static.redenmc.com/')
          ? url
          : `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      )
    ).blob();
    if (blob.value[index].size === 0) {
      throw new Error('Blob size is 0.');
    }
    blob.value = [...blob.value];
    console.log('blob.value[index]', blob.value[index]);
  } catch (e) {
    toast.error(
      t('litematica_generator.toast.failed_to_load_litematica_preview') +
        (e as Error).message,
    );
    console.error(`Failed to load blob for index #${index}`, e);
    previewing.value = -1;
  }
}

async function editLitematica(index: number) {
  await loadBlob(index, true);
  await doFetchPost(
    `/api/mc-services/yisibite/${props.selected.key}/add-edit-stat`,
    {},
  );

  if (blob.value[index]) {
    try {
      await localforage.removeItem('litematica-studio');
    } catch (e) {}
    await localforage.setItem('litematica-studio', blob.value[index]);
    await router.push(
      localeRoute({
        name: 'studio',
      })!,
    );
  }
}
</script>

<template>
  <v-no-ssr>
    <v-list class="pa-0">
      <v-list-item
        v-for="(attachment, index) in selected.attachments"
        border
        class="d-flex"
      >
        <template #prepend>
          <v-icon
            :icon="
              attachment.name.endsWith('litematic')
                ? 'custom:CubeScan'
                : 'custom:ZipArchive'
            "
            :size="40"
          />
        </template>
        <v-list-item-title>
          {{ attachment.name }}
        </v-list-item-title>
        <v-list-item-subtitle
          class="text-caption opacity-60 justify-space-between d-flex"
        >
          <span>
            {{ size2text(attachment.size) }}
          </span>
          <span>
            {{ timeSince(selected.updatedAt || 0) }}
          </span>
        </v-list-item-subtitle>
        <v-list-item-action class="flex-wrap mt-1" style="gap: 4px">
          <v-btn
            :href="`/api/mc-services/yisibite/${selected.key}/download/${index + 1}`"
            color="primary"
            density="comfortable"
            prepend-icon="mdi-download"
            rounded
            target="_blank"
            variant="elevated"
          >
            {{ t('litematica_generator.download') }}
          </v-btn>
          <template v-if="attachment.name.endsWith('.litematic')">
            <v-btn
              color="primary"
              density="comfortable"
              prepend-icon="mdi-eye"
              rounded
              variant="outlined"
              @click="loadBlob(index)"
            >
              {{ t('post.preview') }}
              <v-dialog
                :model-value="previewing === index"
                close-on-back
                height="100%"
              >
                <v-card :loading="!blob[index]">
                  <v-card-text class="overflow-hidden">
                    <LazyMinecraftLitematicaPreview
                      v-if="blob[index]"
                      id="Preview"
                      :blob="blob[index]"
                    />
                    <div v-else>
                      <v-progress-circular color="primary" indeterminate />
                      <span style="font-size: 1.25rem">
                        {{ t('common.loading___') }}
                      </span>
                    </div>

                    <div
                      class="top-0 right-0 position-absolute mr-6 mt-4 text-white text-caption text-right"
                      style="user-select: none; line-height: 0.75rem"
                    >
                      <div class="flex-row d-flex">
                        <div class="opacity-60">
                          Credit to misode, Ending Credits & Undecentions
                          <br />
                          This Vue component is made by zly2006 and licensed
                          under AGPL v3
                        </div>

                        <v-btn
                          color="red"
                          icon="mdi-close"
                          variant="outlined"
                          @click="previewing = -1"
                        />
                      </div>
                      <v-switch
                        v-model="appStore.invertPreview"
                        class="right-0 position-absolute"
                        color="primary"
                        hide-details
                        label="Invert"
                        @click="appStore.toggleInvertPreview()"
                      />
                    </div>
                  </v-card-text>
                </v-card>
              </v-dialog>
            </v-btn>
            <v-btn
              color="primary"
              density="comfortable"
              prepend-icon="mdi-pencil"
              rounded
              variant="outlined"
              @click="editLitematica(index)"
            >
              <v-tooltip
                :text="t('post.litematica_online_edit_desc')"
                activator="parent"
              />
              {{ t('post.litematica_online_edit') }}
            </v-btn>
          </template>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-no-ssr>
</template>
