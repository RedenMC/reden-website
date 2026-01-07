<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Machine } from '~/pages/litematica/index.vue';
import { size2text, timeSince } from '~/utils/constants';
import { useAppStore } from '~/store/app';
import { toast } from 'vuetify-sonner';
import * as localforage from 'localforage';
import { useRouter } from 'vue-router';
import QuarkVerificationDialog from '~/components/litematica/QuarkVerificationDialog.vue';

const props = defineProps<{
  selected: Machine;
}>();

const router = useRouter();
const { t } = useI18n();
const appStore = useAppStore();
const previewing = ref(-1);
const blob = ref<Blob[]>([]);
const localeRoute = useLocaleRoute();
const showVerificationDialog = ref(false);
const showReminderDialog = ref(false);

const hasNoQuarkRole = computed(() => {
  return appStore.userCache?.roles?.includes('no-quark') ?? false;
});

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

function checkQuarkPermission() {
  if (!hasNoQuarkRole.value) {
    const reminded = localStorage.getItem('quark-download-reminded');
    if (!reminded) {
      showReminderDialog.value = true;
      return false;
    }
  }
  return true;
}

function handleDownloadClick(event: Event) {
  if (!checkQuarkPermission()) {
    event.preventDefault();
  }
}

function closeReminderDialog() {
  localStorage.setItem('quark-download-reminded', 'true');
  showReminderDialog.value = false;
}

function openVerificationDialog() {
  showReminderDialog.value = false;
  showVerificationDialog.value = true;
}

function closeVerificationDialog() {
  showVerificationDialog.value = false;
}

function onVerified() {
  // Verification completed, user now has no-quark role
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
            @click="handleDownloadClick"
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

    <!-- Quark Verification Button -->
    <v-card border class="mt-4">
      <v-card-text>
        <v-btn
          block
          class="text-none"
          color="cyan-darken-1"
          prepend-icon="custom:QuarkCloud"
          variant="tonal"
          @click="showVerificationDialog = true"
        >
          完成夸克验证一次，终身免夸克直接下载！（该功能测试中，可能不稳定）
        </v-btn>
        <div class="text-caption text-center text-medium-emphasis mt-2">
          我们的网站通过夸克获得收益并维护网站，下载收益由本站和投影作者五五分成，感谢支持。
        </div>
      </v-card-text>
    </v-card>

    <!-- Reminder Dialog -->
    <v-dialog v-model="showReminderDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">提示</v-card-title>
        <v-card-text class="text-body-1">
          进行一次夸克验证码验证可获得免夸克直接下载特权，是否认证？
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="closeReminderDialog">
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn color="primary" @click="openVerificationDialog">
            {{ t('common.ok') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Quark Verification Dialog -->
    <QuarkVerificationDialog
      v-if="showVerificationDialog"
      :machine-key="selected.key"
      @close="closeVerificationDialog"
      @verified="onVerified"
    />
  </v-no-ssr>
</template>
