<script lang="ts" setup>
import { ref } from 'vue';
import { useAppStore } from '~/store/app';
import { type SubmitEventPromise } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import 'assets/main.css';
import type {
  ListLitematicaResponse,
  Machine,
  MachineDef,
} from '~/pages/litematica/index.vue';
import {
  doFetchDelete,
  doFetchGet,
  doFetchPut,
  number2text,
  parseBVID,
  type Profile,
  toastError,
} from '~/utils/constants';
import BottomBarAd from '~/components/ads/BottomBarAd.vue';
import { parseCondition } from '~/utils/conditionParser';
import RedenRouter from '~/components/RedenRouter.vue';
import { toast } from 'vuetify-sonner';
import RedenPostStatusChip from '~/components/litematica/RedenPostStatusChip.vue';
import TransferOwnershipDialog from '~/components/litematica/TransferOwnershipDialog.vue';
import CommentsSection from '~/components/litematica/CommentsSection.vue';

const route = useRoute();
const router = useRouter();
const machineId = route.params.name as string;
const { t, locale } = useI18n();
const localePath = useLocalePath();
const appStore = useAppStore();
const openEditDialog = ref(false);
const openTransferDialog = ref(false);
const authorFollowProfile = ref<Partial<Profile> | null>(null);
const authorFollowLoading = ref(false);
const { referrer } = useReferrer();
const { data: localizedData } = useNuxtData<Record<string, MachineDef>>(
  `edit-${machineId}`,
);

const {
  data: serverResponse,
  refresh,
  status,
  error,
} = await useFetch<ListLitematicaResponse>(
  `/api/mc-services/yisibite/${machineId}/info/${locale.value}`,
  {
    onResponseError: (error) => {
      if (error.response.status === 404) {
        console.error('error', error);
        throw createError({
          status: 404,
          message: t('litematica_generator.toast.not_found'),
        });
        router.push(localePath('/litematica'));
      }
    },
  },
);

async function submit(e: SubmitEventPromise) {
  if ((await e).valid) {
    if (
      selected.value?.type == 'LitematicaShare' &&
      selected.value.attachments?.length
    ) {
      window.open(`/api/mc-services/yisibite/${machineId}/download/1`);
    }
    setTimeout(() => {
      refresh();
    }, 1000);
  }
}

const selected = computed<Machine | null>(() =>
  serverResponse.value
    ? {
        ...serverResponse.value.d[0],
        conditions: {
          x:
            serverResponse.value.d[0].conditions?.x?.map((it) =>
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
      }
    : (console.log('加载失败，serverResponse.value is null, err=', error.value),
      null),
);
const authorFollowUser = computed<Partial<Profile> | null>(
  () => authorFollowProfile.value ?? selected.value?.author ?? null,
);
const canToggleAuthorFollow = computed(
  () =>
    selected.value?.source !== 'minemev' &&
    !!selected.value?.author?.username &&
    selected.value.author.id !== appStore.uid,
);

async function loadAuthorFollowProfile() {
  authorFollowProfile.value = selected.value?.author ?? null;
  if (
    !import.meta.client ||
    !appStore.logined ||
    selected.value?.source === 'minemev' ||
    !selected.value?.author?.username
  ) {
    return;
  }

  const requestedUsername = selected.value.author.username;
  authorFollowLoading.value = true;
  try {
    const response = await doFetchGet(
      `/api/users/${encodeURIComponent(selected.value.author.username)}`,
    );
    if (!response.ok) {
      await Promise.reject(response);
    }
    const profile: Profile = await response.json();
    if (selected.value?.author?.username === requestedUsername) {
      authorFollowProfile.value = profile;
    }
  } catch (e) {
    await toastError(e, t('profile.follow_list_failed'));
  } finally {
    authorFollowLoading.value = false;
  }
}

async function toggleAuthorFollow() {
  if (!selected.value?.author?.username || authorFollowLoading.value) return;
  if (!appStore.logined) {
    await router.push(localePath('/login'));
    return;
  }

  authorFollowLoading.value = true;
  const target = encodeURIComponent(selected.value.author.username);
  const request = authorFollowUser.value?.followedByMe
    ? doFetchDelete(`/api/account/following/${target}`)
    : doFetchPut(`/api/account/following/${target}`, {});
  try {
    const response = await request;
    if (!response.ok) {
      await Promise.reject(response);
    }
    const updated: Profile = await response.json();
    authorFollowProfile.value = updated;
    toast.success(
      updated.followedByMe ? t('profile.followed') : t('profile.unfollowed'),
      { duration: 1800 },
    );
  } catch (e) {
    await toastError(e, t('profile.follow_failed'));
  } finally {
    authorFollowLoading.value = false;
  }
}

watch(
  () => [
    selected.value?.author?.username,
    selected.value?.source,
    appStore.logined,
    appStore.uid,
  ],
  () => {
    loadAuthorFollowProfile();
  },
  { immediate: true },
);

// workaround
onMounted(() => {
  if (import.meta.client && status.value !== 'pending' && !selected.value) {
    refresh().then(() => {
      useHead({
        title: () =>
          t('litematica_generator.web_title', {
            name: selected.value?.name,
          }),
      });
      if (selected.value == null) {
        console.error('加载失败，selected.value is null, err=', error.value);
      }
      if (error.value) {
        console.error('加载失败，, err=', error.value);
      }
    });
  }
});

useSeoMeta({
  title: t('litematica_generator.web_title', {
    name: selected.value?.name,
  }),
  ogTitle: t('litematica_generator.web_title', {
    name: selected.value?.name,
  }),
  description:
    selected.value?.description + t('litematica_generator.og_description'),
  ogDescription:
    selected.value?.description + t('litematica_generator.og_description'),
  ogImage: 'https://redenmc.com/reden_256.png',
});
definePageMeta({
  name: 'litematica-name',
});
useHead({
  title: () =>
    t('litematica_generator.web_title', {
      name: selected.value?.name,
    }),
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
  if (selected.value?.link) {
    console.log('selected.value.link', selected.value.link);
    console.log('bvid.value', bvid.value);
    console.log('youtube.value', youtube.value);
  }
  ret.push(...(selected.value?.images ?? []));
  return ret;
});

const removeReason = ref('');

async function approve() {
  if (selected.value?.status !== 'Pending') {
    return toast.error('错误： 此设计已经通过审核或被拒绝');
  }
  const response = await doFetchPost(
    `/api/mc-services/yisibite/${machineId}/approve`,
    {},
  );
  if (response.ok) {
    toast.success('审核通过');
  } else {
    return toastError(response);
  }
}

async function cancelApproval() {
  const isAdmin =
    appStore.userCache?.id !== selected.value?.author?.id &&
    (!!appStore.userCache?.roles?.includes('archiver') ||
      !!appStore.userCache?.roles?.includes('staff'));
  const response = isAdmin
    ? await doFetchPost(`/api/mc-services/yisibite/${machineId}/reject`, {
        reason: `${removeReason.value} by ${appStore.userCache?.username}`,
      })
    : await doFetchDelete(`/api/mc-services/yisibite/${machineId}`);
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
  if (response.ok) {
    await refresh();
  } else {
    return toastError(response);
  }
}

function copyLink() {
  navigator.clipboard.writeText(
    `【${selected.value?.name}】 \nhttps://redenmc.com/${locale.value}/litematica/${machineId}`,
  );
  toast.success(t('litematica_generator.share_link_copied_to_clipboard'));
}

const selectedImage = ref(
  tabs.value?.[0] ? tabs.value[0] : selected.value?.imageUrl,
);
watch(tabs, (newTabs) => {
  if (!selectedImage.value || !newTabs.includes(selectedImage.value)) {
    selectedImage.value = newTabs[0] || '';
  }
});
</script>

<template>
  <v-form ref="form" class="lm-main-content" fast-fail @submit.prevent="submit">
    <div v-if="selected?.source === 'minemev'" class="w-100">
      <div class="rounded-lg border pa-2" style="width: fit-content">
        <v-icon> mdi-information-outline </v-icon>
        本稿件来自 Minemev
        <a :href="`https://minemev.com/p/${selected.key}`">Minemev</a>。
      </div>
    </div>
    <div class="ma-4 d-flex flex-wrap" style="gap: 12px">
      <v-btn
        :to="referrer ?? localePath('/litematica')"
        class="text-capitalize"
        prepend-icon="mdi-arrow-left"
        variant="tonal"
      >
        {{ t('litematica_generator.view_all_designs') }}
      </v-btn>
      <v-btn
        v-if="selected?.author?.id === appStore.userCache?.id"
        :to="localePath('/litematica/earning')"
        class="text-capitalize"
        color="amber-darken-2"
        prepend-icon="mdi-cash-multiple"
        variant="tonal"
      >
        上传投影激励计划
      </v-btn>
      <v-btn
        :to="appStore.logined ? undefined : localePath('/login')"
        class="text-capitalize"
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
      <div
        v-if="
          appStore.userCache &&
          (appStore.userCache?.roles?.includes('archiver') ||
            appStore.userCache?.id === selected?.author?.id)
        "
        class="d-flex align-center"
        style="gap: 12px"
      >
        {{ t('post.management_op') }}
        <v-btn class="text-capitalize" color="red">
          {{ t('post.delete') }}
          <v-dialog :max-width="900" activator="parent">
            <v-card>
              <v-card-title>{{ t('post.delete_reason') }}</v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="removeReason"
                  :label="t('post.delete_reason')"
                  color="red"
                  required
                />
                <div>
                  默认理由：
                  <v-btn
                    color="primary"
                    @click="
                      removeReason =
                        '投影太大了，请清空箱子、杀死所有实体并重新保存投影。'
                    "
                  >
                    投影太大
                  </v-btn>
                  <v-btn
                    color="primary"
                    @click="
                      removeReason =
                        '投影被标注为转载，请标明原作者，如果未知，请填写原作者未知。'
                    "
                  >
                    标明原作者
                  </v-btn>
                  <v-btn color="primary" @click="removeReason = '重复。'">
                    重复
                  </v-btn>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn color="red" @click="cancelApproval">
                  {{ t('common.confirm') }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-btn>
        <v-btn class="text-capitalize" color="red">
          {{ t('post.transfer_ownership') }}
          <v-dialog
            v-model="openTransferDialog"
            activator="parent"
            max-width="500"
            persistent
          >
            <TransferOwnershipDialog
              :machine-id="machineId"
              @close="openTransferDialog = false"
              @transferred="refresh"
            />
          </v-dialog>
        </v-btn>
      </div>
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
                    (($refs['wrapper-for-ytb'] as Element)?.clientWidth ?? 0) *
                    (9 / 16)
                  "
                  :src="`https://www.youtube-nocookie.com/embed/${youtube}`"
                  :width="($refs['wrapper-for-ytb'] as Element)?.clientWidth"
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
          <div class="mt-4" id="description">
            <div class="text-h5 font-weight-bold">
              {{ t('common.description') }}
            </div>
            <v-divider style="margin: 12px 0" />
            <MDC
              :value="selected.description || ''"
              class="lm-description text-pre-wrap overflow-hidden"
            />
            <div v-if="selected?.source === 'minemev'" class="w-100">
              <div class="rounded-lg border pa-2" style="width: fit-content">
                <v-icon> mdi-information-outline </v-icon>
                本稿件来自 Minemev，如果想要了解更多信息，请访问
                <a :href="`https://minemev.com/p/${selected.key}`">原始页面</a
                >。<br />
                Minemev 是注册并运营在阿根廷的网站，Reden 与其没有任何关联。<br />
                该网站的服务条款与隐私政策可能与 Reden 不同。<br />
                您在 Reden 的个人信息不会被跨境传输。
              </div>
            </div>
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
                <v-btn icon size="32" variant="text">
                  <v-icon>mdi-dots-horizontal</v-icon>
                  <v-menu activator="parent">
                    <v-list>
                      <v-list-item
                        v-if="selected.link"
                        v-ripple
                        @click="copyLink"
                      >
                        <v-list-item-title>
                          <v-icon>mdi-link</v-icon>
                          {{ t('litematica_generator.share') }}
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        v-ripple
                        @click="
                          vote(selected.ud?.vote === true ? 'cancel' : 'up')
                        "
                      >
                        <v-list-item-title>
                          <v-icon
                            :color="selected.ud?.vote === true ? 'primary' : ''"
                            >mdi-thumb-up-outline
                          </v-icon>
                          {{ t('litematica_generator.vote_up') }}
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        v-ripple
                        @click="
                          vote(selected.ud?.vote === false ? 'cancel' : 'down')
                        "
                      >
                        <v-list-item-title>
                          <v-icon
                            :color="
                              selected.ud?.vote === false ? 'primary' : ''
                            "
                          >
                            mdi-thumb-down-outline
                          </v-icon>
                          {{ t('litematica_generator.vote_down') }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-btn>
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
                <div v-if="selected.author" class="author-summary-content">
                  <reden-router
                    :to="
                      selected.source === 'minemev'
                        ? `https://minemev.com/u/${selected.author.username}`
                        : localePath(`/@${selected.author.username}`)
                    "
                    class="author-link d-flex flex-row router"
                  >
                    <v-avatar v-if="selected.author.avatarUrl" size="32">
                      <v-img :src="selected.author.avatarUrl" />
                    </v-avatar>
                    {{ selected.author.username }}
                  </reden-router>
                  <v-btn
                    v-if="canToggleAuthorFollow"
                    :color="
                      authorFollowUser?.followedByMe ? undefined : 'primary'
                    "
                    :loading="authorFollowLoading"
                    :prepend-icon="
                      authorFollowUser?.followedByMe
                        ? 'mdi-account-check'
                        : 'mdi-account-plus'
                    "
                    class="author-follow-action text-capitalize"
                    rounded="lg"
                    size="small"
                    variant="tonal"
                    @click="toggleAuthorFollow()"
                  >
                    {{
                      authorFollowUser?.followedByMe
                        ? $t('profile.unfollow')
                        : $t('profile.follow')
                    }}
                  </v-btn>
                </div>
              </div>
              <div class="d-flex mt-3">
                <div class="w-33 align-content-center">
                  {{ t('litematica_generator.updated_at') }}
                </div>
                <div>
                  {{ new Date(selected.updatedAt || 0).toLocaleString() }}
                </div>
              </div>
              <div class="d-flex mt-3">
                <div class="w-33 align-content-center">
                  {{ t('litematica_generator.status') }}:
                </div>
                <reden-post-status-chip :value="selected.status!" />
                <v-btn
                  class="ml-2 text-capitalize"
                  color="green"
                  @click="approve"
                  v-if="
                    selected.status === 'Pending' &&
                    appStore.userCache?.roles?.includes('archiver')
                  "
                >
                  Approve (Admin)
                </v-btn>
              </div>
              <div v-if="selected.versions?.length" class="d-flex mt-3">
                <div class="w-33 align-content-center">
                  {{ t('common.supported_version') }}:
                </div>
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
              <div v-if="selected.categoryTag" class="d-flex mt-3">
                <div class="w-33 align-content-center">分类：</div>
                <v-chip v-if="selected.categoryTag" style="margin-right: 8px">
                  {{ selected.categoryTag.name }}
                </v-chip>
              </div>
              <div v-if="selected.featureTags?.length" class="d-flex mt-3">
                <div class="w-33 align-content-center">标签：</div>
                <v-chip
                  v-for="(tag, index) in selected.featureTags"
                  :to="localePath(`/tag/${tag.tag}`)"
                  :key="index"
                  style="margin-right: 8px"
                >
                  {{ tag.name }}
                </v-chip>
              </div>
              <!-- 非原创提示 -->
              <div v-if="!selected.original" class="text-body-2 mx-auto mt-3">
                <span class="text-amber-darken-1">
                  {{
                    t('litematica_generator.by.uploader_not_original_author')
                  }}
                </span>
                <div class="opacity-60">
                  {{ t('litematica_generator.by.reason_uploaded') }}<br />
                  {{ t('litematica_generator.by.reason_uploaded_a') }}<br />
                  {{ t('litematica_generator.by.reason_uploaded_b') }}<br />
                  {{ t('litematica_generator.by.reason_uploaded_c') }}<br />
                  {{ t('litematica_generator.by.complaint') }}
                </div>
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
                @click="copyLink"
              >
                <v-dialog activator="parent" max-width="500">
                  <v-card>
                    <v-card-title>
                      {{ t('litematica_generator.share') }}
                    </v-card-title>
                    <v-card-item>
                      <v-icon color="green" size="64">
                        mdi-check-circle
                      </v-icon>
                      <div class="d-inline-block">
                        {{
                          t(
                            'litematica_generator.share_link_copied_to_clipboard',
                          )
                        }}
                      </div>
                    </v-card-item>
                  </v-card>
                </v-dialog>
                {{ t('litematica_generator.share') }}
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
            <LitematicaGenDownloader
              v-if="selected.type === 'LitematicaGen'"
              :selected="selected"
              @download="refresh"
            />
            <LitematicaShareDownloader
              v-else-if="selected.type === 'LitematicaShare'"
              :selected="selected"
            />
            <bottom-bar-ad />
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

    <!-- 评论区 -->
    <div v-if="selected" class="mt-8">
      <comments-section :machine-id="machineId" />
    </div>

    <bottom-bar-ad />
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

.author-summary-content {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.author-link {
  gap: 8px;
  align-items: center;
  min-width: 0;
  line-height: 32px;
}

.author-follow-action {
  flex: 0 0 auto;
}

#description p {
  margin: initial;
}
</style>
