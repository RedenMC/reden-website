<script lang="ts" setup>
import { ref } from 'vue';
import { useAppStore } from '~/store/app';
import { type SubmitEventPromise, useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import SizeInput from '~/components/litematica/SizeInput.vue';
import 'assets/main.css';
import type {
  ListLitematicaResponse,
  Machine,
  MachineDef,
} from '~/pages/litematica/index.vue';
import {
  number2text,
  parseBVID,
  size2text,
  timeSince,
} from '~/utils/constants';
import BottomBarAd from '~/components/ads/BottomBarAd.vue';
import { parseCondition } from '~/utils/conditionParser';
import RedenRouter from '~/components/RedenRouter.vue';
import type { VForm } from 'vuetify/components';
import { toast } from 'vuetify-sonner';

const route = useRoute();
const router = useRouter();
const xSize = ref(0);
const ySize = ref(0);
const zSize = ref(0);
const loading = ref(false);
const machineId = route.params.name as string;
const { t, locale } = useI18n();
const localePath = useLocalePath();
const appStore = useAppStore();
const openEditDialog = ref(false);
const backUrl = route.query.backUrl as string;
const { data: localizedData } = useNuxtData<Record<string, MachineDef>>(
  `edit-${machineId}`,
);

const { data: serverResponse } = useNuxtData<ListLitematicaResponse>(
  `generators-${machineId}-${locale.value}`,
);

if (!serverResponse.value) {
  const { data, status, error } = await useFetch<ListLitematicaResponse>(
    `/api/mc-services/yisibite/${machineId}/info/${locale.value}`,
    {
      key: `generators-${machineId}-${locale.value}`,
    },
  );
  serverResponse.value = data.value;
  if (status.value === 'error') {
    console.error(serverResponse.value, status.value, error.value);
    throw createError({
      status: error.value?.statusCode ?? 500,
      message: JSON.stringify(error.value),
    });
  }
}
const { mobile } = useDisplay();

async function submit(e: SubmitEventPromise) {
  if ((await e).valid) {
    // open a new window to download
    if (selected.value.type == 'LitematicaGen') {
      window.open(
        `/api/mc-services/yisibite/${machineId}?xSize=${xSize.value}&ySize=${ySize.value}&zSize=${zSize.value}`,
      );
    } else if (
      selected.value.type == 'LitematicaShare' &&
      selected.value.attachments?.length
    ) {
      // unused
      window.open(`/api/mc-services/yisibite/${machineId}/download/1`);
    }
    setTimeout(() => {
      refreshNuxtData();
    }, 1000);
  }
}

const formRef = useTemplateRef<VForm>('form');

function openMaterials() {
  formRef.value?.validate().then((result) => {
    if (result.valid) {
      window.open(
        `/api/mc-services/yisibite/${machineId}/materials?xSize=${xSize.value}&ySize=${ySize.value}&zSize=${zSize.value}`,
      );
    }
  });
}

const selected = computed<Machine>(() => ({
  ...serverResponse.value!.d[0],
  conditions: {
    x:
      serverResponse.value!.d[0].conditions?.x?.map((it) =>
        parseCondition(it, t),
      ) ?? [],
    y:
      serverResponse.value!.d[0].conditions?.y?.map((it) =>
        parseCondition(it, t),
      ) ?? [],
    z:
      serverResponse.value!.d[0].conditions?.z?.map((it) =>
        parseCondition(it, t),
      ) ?? [],
  },
}));

useSeoMeta({
  title: t('litematica_generator.web_title', {
    name: selected.value.name,
  }),
  ogTitle: t('litematica_generator.web_title', {
    name: selected.value.name,
  }),
  description:
    selected.value.description + t('litematica_generator.og_description'),
  ogDescription:
    selected.value.description + t('litematica_generator.og_description'),
  ogImage: 'https://redenmc.com/reden_256.png',
});
definePageMeta({
  name: 'litematica-name',
});
const biliPlayer = useTemplateRef<HTMLIFrameElement>('biliPlayer');
const bvid = computed(() => parseBVID(selected.value?.link));
const youtube = computed(() =>
  selected.value?.link?.startsWith('https://www.youtube.com/watch')
    ? new URL(selected.value.link).searchParams.get('v')
    : selected.value?.link?.startsWith('https://youtu.be/')
      ? new URL(selected.value.link).pathname.slice(1)
      : undefined,
);

const tabs = computed(() => {
  const ret: string[] = [];
  if (bvid.value) {
    ret.push('bilibili:');
  }
  if (youtube.value) {
    ret.push('youtube:');
  }
  if (selected.value.link) {
    console.log('selected.value.link', selected.value.link);
    console.log('bvid.value', bvid.value);
    console.log('youtube.value', youtube.value);
  }
  ret.push(...(selected.value.images ?? []));
  return ret;
});
let blob = ref<Blob[]>([]);

async function loadBlob(index: number) {
  if (blob.value[index]) {
    return;
  }
  const url = selected.value.attachments?.[index]?.url;
  if (!url) {
    toast.error(`No url for index #${index}.`);
    return;
  }
  blob.value[index] = await (
    await fetch(
      url.startsWith('https://reden.oss-cn-shanghai.aliyuncs.com/')
        ? url
        : `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    )
  ).blob();
  if (blob.value[index].size === 0) {
    toast.error(`Blob size is 0 for index #${index}.`);
    debugger;
    return;
  }
  console.log('blob.value[index]', blob.value[index]);
}

const removeReason = ref('');

async function cancelApproval() {
  const response = await doFetchPost(
    `/api/mc-services/yisibite/${machineId}/reject`,
    {
      reason: `${removeReason.value} by ${appStore.userCache?.username}`,
    },
  );
  if (response.ok) {
    toast.success('下架成功');
    router.back();
  } else {
    toast.error('出现错误');
  }
}

async function vote(vote: 'up' | 'down' | 'cancel') {
  const response = await doFetchPost(
    `/api/mc-services/yisibite/${machineId}/vote`,
    { vote },
  );
  if (!response.ok) {
    return toastError(response);
  } else {
    await useFetch<ListLitematicaResponse>(
      `/api/mc-services/yisibite/${machineId}/info/${locale.value}`,
      {
        key: `generators-${machineId}-${locale.value}`,
      },
    );
  }
}

const selectedImage = ref(
  tabs.value?.[0] ? tabs.value[0] : selected.value.imageUrl,
);
</script>

<template>
  <v-form ref="form" class="lm-main-content" fast-fail @submit.prevent="submit">
    <div class="ma-4">
      <v-btn
        :to="backUrl ?? localePath('/litematica')"
        class="text-capitalize mr-3"
        prepend-icon="mdi-arrow-left"
        variant="tonal"
      >
        {{ t('litematica_generator.view_all_designs') }}
      </v-btn>
      <v-btn
        :to="appStore.logined ? undefined : localePath('/login')"
        class="text-capitalize mr-3"
        color="primary"
        variant="outlined"
        @click="
          () => {
            if (!localizedData && appStore.logined) {
              useFetch(`/api/mc-services/yisibite/${machineId}/info`, {
                key: `edit-${machineId}`,
              });
            }
          }
        "
      >
        {{ t('litematica_generator.upload.edit_or_improve_translation') }}
        <v-dialog
          v-model="openEditDialog"
          activator="parent"
          close-on-back
          max-width="900"
          persistent
        >
          <v-card variant="flat">
            <LazyLitematicaUpload v-model:machine="localizedData" edit-mode />
            <div class="position-absolute top-0 right-0">
              <v-btn
                icon="mdi-close"
                variant="plain"
                @click="openEditDialog = false"
              />
            </div>
          </v-card>
        </v-dialog>
      </v-btn>
      <v-btn v-if="appStore.userCache?.roles?.includes('archiver')" color="red">
        下架
        <v-dialog :max-width="900" activator="parent">
          <v-card>
            <v-card-title>下架原因</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="removeReason"
                color="red"
                label="下架原因"
                required
              />
            </v-card-text>
            <v-card-actions>
              <v-btn color="red" @click="cancelApproval"> 确认</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-btn>
    </div>

    <div class="ma-4">
      <v-row v-if="selected">
        <v-col cols="12" md="8" style="height: min-content">
          <!-- 预览 -->
          <h1 class="text-h5 text-sm-h4 font-weight-bold">
            {{ selected.name }}
          </h1>
          <div v-if="tabs.length">
            <v-divider style="margin: 12px 0" />
            <div style="max-width: 840px; margin: 0 auto">
              <div
                v-if="selectedImage === 'bilibili:'"
                class="bili-player-wrapper"
              >
                <iframe
                  ref="biliPlayer"
                  :src="`https://player.bilibili.com/player.html?isOutside=true&bvid=${bvid}`"
                  allowfullscreen
                  class="bili-player"
                  title="Bilibili video player"
                />
              </div>
              <div
                v-else-if="selectedImage === 'youtube:'"
                ref="wrapper-for-ytb"
                class="bili-player-wrapper"
              >
                <iframe
                  :height="
                    (($refs['wrapper-for-ytb']?.clientWidth ?? 0) * 9) / 16
                  "
                  :src="`https://www.youtube-nocookie.com/embed/${youtube}`"
                  :width="$refs['wrapper-for-ytb']?.clientWidth"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  class="bili-player"
                  referrerpolicy="strict-origin-when-cross-origin"
                  title="YouTube video player"
                />
              </div>
              <template v-else>
                <v-img :aspect-ratio="16 / 9" :src="selectedImage" />
              </template>
            </div>
            <!-- 图片组容器 -->
            <v-row justify="center">
              <v-slide-group
                v-model="selectedImage"
                center-active
                class="pa-4"
                mandatory
                show-arrows
                style="max-height: 100px"
              >
                <v-slide-group-item
                  v-for="(image, index) in tabs"
                  :key="index"
                  v-slot="{ isSelected, toggle }"
                  :value="image"
                >
                  <div
                    :class="{
                      'slide-selected': isSelected,
                      'mr-2': true,
                    }"
                    @click="toggle"
                  >
                    <v-icon v-if="image === 'bilibili:'" :size="80">
                      custom:Bilibili
                    </v-icon>
                    <v-icon v-else-if="image === 'youtube:'" :size="64">
                      custom:YouTube_Logo_2017
                    </v-icon>
                    <v-img v-else :src="image" min-width="100px" />
                  </div>
                </v-slide-group-item>
              </v-slide-group>
            </v-row>
          </div>
          <!-- 描述 -->
          <div class="mt-4">
            <div class="text-h5 font-weight-bold">
              {{ t('common.description') }}
            </div>
            <v-divider style="margin: 12px 0" />
            <MDC
              :value="selected.description || ''"
              class="lm-description text-pre-wrap overflow-hidden"
            />
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <!-- 摘要 -->
          <div>
            <!-- 摘要头部 -->
            <div>
              <div class="d-flex flex-row align-center justify-space-between">
                <div class="text-h5 text-sm-h4 font-weight-bold">
                  {{ t('common.details') }}
                </div>
                <v-btn
                  class="details-title-btn"
                  icon="mdi-dots-horizontal"
                  size="32"
                  variant="text"
                />
              </div>
              <v-divider style="margin: 12px 0" />
            </div>
            <!-- 摘要内容 -->
            <div>
              <div class="d-flex mt-3">
                <div class="w-33 align-content-center">
                  {{
                    selected.original
                      ? t('litematica_generator.by.author')
                      : t('litematica_generator.by.uploader')
                  }}
                </div>
                <router-link
                  v-if="selected.author"
                  :to="localePath(`/@${selected.author.username}`)"
                  class="d-flex flex-row router"
                  style="line-height: 32px"
                >
                  <v-avatar v-if="selected.author.avatarUrl" size="32">
                    <v-img :src="selected.author.avatarUrl" />
                  </v-avatar>
                  {{ selected.author.username }}
                </router-link>
              </div>
              <div class="d-flex mt-3">
                <div class="w-33 align-content-center">更新时间：</div>
                <div>
                  {{ new Date(selected.updatedAt || 0).toLocaleString() }}
                </div>
              </div>
              <div class="d-flex mt-3">
                <div class="w-33 align-content-center">版本：</div>
                <div class="w-66">
                  <v-chip
                    v-for="(version, index) in selected.versions"
                    :key="index"
                    size="small"
                    style="margin-right: 8px"
                  >
                    {{ version }}
                  </v-chip>
                </div>
              </div>
              <div class="d-flex mt-3">
                <div class="w-33 align-content-center">设计标签：</div>
                <v-chip v-if="selected.categoryTag" style="margin-right: 8px">
                  {{ selected.categoryTag.name }}
                </v-chip>
              </div>
              <div class="d-flex mt-3">
                <div class="w-33 align-content-center">特性标签：</div>
                <v-chip
                  v-for="(tag, index) in selected.featureTags"
                  :key="index"
                  style="margin-right: 8px"
                >
                  {{ tag.name }}
                </v-chip>
              </div>
              <div
                v-if="!selected.original"
                class="opacity-60 text-body-2 mx-auto mt-3"
              >
                <span class="text-amber-darken-1">
                  {{
                    t('litematica_generator.by.uploader_not_original_author')
                  }}
                </span>
                {{ t('litematica_generator.by.reason_uploaded') }}<br />
                {{ t('litematica_generator.by.reason_uploaded_a') }}<br />
                {{ t('litematica_generator.by.reason_uploaded_b') }}<br />
                {{ t('litematica_generator.by.reason_uploaded_c') }}<br />
                {{ t('litematica_generator.by.complaint') }}
                <a class="router" href="mailto:info@redenmc.com">contact us.</a>
              </div>
            </div>
            <!-- 摘要底部 -->
            <v-divider style="margin: 12px 0" />
            <div>
              <v-btn
                :variant="selected.ud?.vote === true ? 'elevated' : 'outlined'"
                color="primary"
                prepend-icon="mdi-thumb-up-outline"
                rounded="xl"
                @click="vote(selected.ud?.vote === true ? 'cancel' : 'up')"
              >
                {{ selected.upVotes ?? 0 }}
              </v-btn>
              <v-btn
                :size="36"
                :variant="selected.ud?.vote === false ? 'elevated' : 'outlined'"
                color="primary"
                icon="mdi-thumb-down-outline"
                rounded="xl"
                style="margin-left: 8px"
                @click="vote(selected.ud?.vote === false ? 'cancel' : 'down')"
              />
              <v-btn
                prepend-icon="mdi-bookmark-outline"
                rounded="xl"
                style="margin-left: 8px"
                variant="outlined"
              >
                收藏
              </v-btn>
              <v-btn
                prepend-icon="mdi-share-variant-outline"
                rounded="xl"
                style="margin-left: 8px"
                variant="outlined"
              >
                分享
              </v-btn>
            </div>
          </div>
          <!-- 下载 -->
          <div class="mt-4">
            <!-- 下载头部 -->
            <div>
              <div class="d-flex flex-row align-center justify-space-between">
                <div class="text-h5 font-weight-bold">
                  {{ t('litematica_generator.download') }}
                </div>
                <div
                  style="
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                  "
                >
                  <v-icon icon="mdi-download" size="20" />
                  <div>
                    {{
                      t('litematica_generator.download_count', {
                        count: number2text(selected.downloads),
                      })
                    }}
                  </div>
                </div>
              </div>
              <v-divider style="margin: 12px 0" />
            </div>
            <!-- 下载内容 -->
            <template v-if="selected.type === 'LitematicaGen'">
              <v-row>
                <v-col>
                  <v-card
                    v-if="selected?.hasX || selected?.hasY || selected?.hasZ"
                    border
                  >
                    <v-card-subtitle class="text-wrap pa-3">
                      {{ t('litematica_generator.size_description') }}
                    </v-card-subtitle>
                    <v-card-text>
                      <SizeInput
                        v-if="selected.hasX"
                        v-model="xSize"
                        :def="selected"
                        xyz="x"
                      />
                      <SizeInput
                        v-if="selected.hasY"
                        v-model="ySize"
                        :def="selected"
                        xyz="y"
                      />
                      <SizeInput
                        v-if="selected.hasZ"
                        v-model="zSize"
                        :def="selected"
                        xyz="z"
                      />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-row>
                <v-spacer />
                <v-btn
                  :loading="loading"
                  class="ma-3"
                  color="primary"
                  type="button"
                  variant="outlined"
                  @click="openMaterials"
                >
                  材料列表
                </v-btn>
                <v-btn
                  :loading="loading"
                  class="ma-3"
                  color="primary"
                  type="submit"
                >
                  {{ t('litematica_generator.download') }}
                </v-btn>
              </v-row>
              <!--FAQ-->
              <v-row>
                <v-col>
                  <h3>FAQ</h3>
                  <h4>17x17的空置域应该输入多少？</h4>
                  <p>17x16=272，272的大小包含了两边各一格的铁砧墙宽度。</p>
                  <h4>没有找到你想要的机器？</h4>
                  <p>
                    {{ t('litematica_generator.contribute') }}
                    <a class="router" href="mailto:me@redenmc.com"
                      >me@redenmc.com</a
                    >
                  </p>
                  <br />
                </v-col>
              </v-row>
            </template>
            <v-no-ssr v-if="selected.type === 'LitematicaShare'">
              <v-list class="pa-0">
                <!-- 整体容器 -->
                <v-list-item
                  v-for="(attachment, index) in selected.attachments"
                  :href="`/api/mc-services/yisibite/${machineId}/download/${index + 1}`"
                  border
                  class="d-flex"
                  target="_blank"
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
                    <a
                      v-if="attachment.name.endsWith('.litematic')"
                      class="router"
                      @click.prevent="loadBlob(index)"
                    >
                      <v-icon size="sm">mdi-eye</v-icon>
                      {{ t('post.preview') }}
                      <v-dialog
                        #default="{ isActive }"
                        activator="parent"
                        close-on-back
                        height="100%"
                      >
                        <v-card :loading="!blob[index]">
                          <v-card-text class="overflow-hidden">
                            <LitematicaPreview
                              v-if="blob[index]"
                              :blob="blob[index]"
                            />
                            <div v-else>
                              <v-progress-circular
                                color="primary"
                                indeterminate
                              />
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
                                  Credit to misode, Ending Credits &
                                  Undecentions
                                  <br />
                                  This Vue component is made by zly2006 and
                                  licensed under AGPL v3
                                </div>

                                <v-btn
                                  color="red"
                                  icon="mdi-close"
                                  variant="outlined"
                                  @click="isActive.value = false"
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
                    </a>
                    <span>
                      {{ attachment.name }}
                    </span>
                  </v-list-item-title>
                  <!-- 右侧内容区域 -->
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
                </v-list-item>
              </v-list>
            </v-no-ssr>
            <div class="text-center v-card-subtitle w-100">
              {{
                t('litematica_generator.total_downloads', [
                  serverResponse?.downloads,
                ])
              }}
            </div>
            <v-row v-if="!useAppStore().logined" class="text-sm-body-1">
              <v-col>
                <reden-router :to="localePath('/login')">
                  {{ t('litematica_generator.not_logged_in') }}
                </reden-router>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>

    <bottom-bar-ad />
    <bottom-bar-ad v-if="mobile" />
  </v-form>
</template>

<style scoped>
p {
  font-size: 1em;
}

.bili-player-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
}

.bili-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-width: 0;
}

.slide-selected {
  border: #66ccff 2px solid;
}

:deep(.v-list-item__content) {
  width: 100%;
}

:deep(.v-list-item__spacer) {
  width: 16px !important;
}

.lm-main-content {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
