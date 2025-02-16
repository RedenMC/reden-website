<script lang="ts" setup>
import MinecraftFarmCard from '~/components/litematica/MinecraftFarmCard.vue';
import { useDisplay, useGoTo } from 'vuetify';
import SidebarAd from '~/components/ads/SidebarAd.vue';
import BottomBarAd from '~/components/ads/BottomBarAd.vue';
import { useElementHover } from '@vueuse/core';
import { useAppStore } from '~/store/app';

export type Tag = {
  tag: string;
  name: string;
  description: string;
};

enum PostType {
  LitematicaGen = 'LitematicaGen',
  LitematicaShare = 'LitematicaShare',
}

enum PostStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Deleted = 'Deleted',
  TakenDown = 'TakenDown',
}

export type MachineDef = {
  type: PostType;
  name: string;
  key: string;
  downloads?: number;
  hasX?: boolean;
  hasY?: boolean;
  hasZ?: boolean;
  description?: string;
  summary?: string;
  link?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  images?: string[];
  updatedAt?: number;
  author?: Partial<Profile>;
  categoryTag?: Tag;
  featureTags?: Tag[];
  attachments?: {
    name: string;
    size: number;
    url: string;
  }[];
  original?: boolean;
  status?: PostStatus;
  upVotes?: number;
  /**
   * User-oriented data
   */
  ud?: {
    owner: boolean;
    /**
     * upvote | down-vote | not voted yet
     */
    vote?: boolean;
    /**
     * @deprecated
     */
    bookmark: boolean;
    favorite: boolean;
  };
  versions?: string[];
};

const appStore = useAppStore();
const { t } = useI18n();
useSeoMeta({
  title: t('litematica_generator.title') + ' - Reden',
  ogTitle: t('litematica_generator.title') + ' - Reden',
  description: t('litematica_generator.og_description'),
  ogDescription: t('litematica_generator.og_description'),
  ogImage: 'https://redenmc.com/reden_256.png',
});
const goto = useGoTo({});
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();
const router = useRouter();
if (router.currentRoute.value.query.m) {
  router.push(localePath(`/litematica/${router.currentRoute.value.query.m}`));
}
const page = ref(Number(router.currentRoute.value.query.page) || 1);
const pageSize = ref(18);
const search = computed(() => router.currentRoute.value.query.q);
const totalPages = computed(() =>
  Math.ceil((serverResponse.value?.count ?? 2006) / pageSize.value),
);
const uploadDialog = ref(router.currentRoute.value.hash === '#upload');
watch(router.currentRoute, () => {
  page.value = Number(router.currentRoute.value.query.page) || 1;
  uploadDialog.value = router.currentRoute.value.hash === '#upload';
});
watch([page, pageSize, search, uploadDialog], () => {
  goto(0);
  router.replace({
    query: {
      page: String(page.value),
      q: search.value,
    },
    hash: uploadDialog.value ? '#upload' : undefined,
  });
});

export type Machine = MachineDef & {
  conditions: { [key: string]: ((v: number) => any)[] };
};
export type ListLitematicaResponse = {
  d: (MachineDef & {
    conditions?: {
      x: string[];
      y: string[];
      z: string[];
    };
  })[];
  readonly downloads: number;
  readonly count: number;
};
export type LitematicaAuthorProfile = {
  author: Profile;
  totalDownloads: number;
  totalVoteUps: number;
  totalBookmarks: number;
  top3posts: MachineDef[];
};
const { locale } = useI18n();

const { data: serverResponse, error } = await useFetch<ListLitematicaResponse>(
  () =>
    search.value
      ? `/api/mc-services/litematica/search?q=${search.value}&lang=${locale.value}&page=${Math.round(page.value)}&pageSize=${pageSize.value}`
      : `/api/mc-services/yisibite/?lang=${locale.value}&page=${Math.round(page.value)}&pageSize=${pageSize.value}`,
  {
    dedupe: 'defer',
    key: `generators${locale.value}`,
    headers: {},
    transform: (input: any): ListLitematicaResponse => {
      if (input.d) {
        return input;
      } else {
        input = input as {
          hits: Record<string, MachineDef>;
          estimatedTotalHits: number;
          downloads: number;
        };
        return {
          d: input.hits,
          count: input.estimatedTotalHits,
          downloads: input.downloads,
        };
      }
    },
  },
);

if (error.value?.statusCode) {
  throw error.value;
}

const isClient = import.meta.client;
const notification = ref<boolean>(false);
const maintaining = false;
const { mdAndUp, width } = useDisplay({
  mobileBreakpoint: 600,
});
const itemsPerRow = computed(() => (mdAndUp.value ? 3 : 2));
const itemDisplayCols = computed(() => {
  const cols: { def?: MachineDef[] }[] = [];
  for (let i = 0; i < itemsPerRow.value; i++) {
    cols[i] = { def: [] };
  }
  console.log('itemsPerRow', itemsPerRow.value);
  let i = 0;
  for (const def of serverResponse.value?.d ?? []) {
    cols[i % itemsPerRow.value].def?.push(def);
    i++;
  }
  return cols;
});
const ad = useTemplateRef<HTMLParagraphElement>('ad');
const isHovering = useElementHover(ad);
</script>
<template>
  <p ref="ad" class="w-100 text-center opacity-60">
    <template v-if="isHovering">
      广告位招租！<br />
      如果您想借助本站的流量推广您的服务器、VPS出租或任何其他服务，请在微信
      Scanmenge 或 QQ 1284588550 联系我，注明来意。
      <p style="font-weight: bold">为什么我要在这里放广告？</p>
      所有广告收入将用于支付服务器费用，剩余利润将会对半分给网站协作开发者，以及机器设计者。<br />
      投影生成器和夸克网盘下载是因为我和机器作者有另外的合作和分成关系(这是我个人从此网站获利的主要方式)。<br />
      所以希望你禁用自己的广告屏蔽器！
    </template>
    <template v-else>广告位招租！</template>
  </p>
  <v-btn
    class="position-fixed z-10 right-0"
    color="primary"
    icon="mdi-arrow-up"
    style="top: 150px"
    variant="elevated"
    @click="goto(0)"
  >
    <v-icon> mdi-arrow-up</v-icon>
    <v-tooltip
      activator="parent"
      location="start"
      location-strategy="connected"
      text="Back to Top"
    >
    </v-tooltip>
  </v-btn>
  <v-alert
    v-if="maintaining && isClient && notification"
    class="mb-3"
    type="warning"
  >
    <template #title>
      <v-alert-title> 本生成器正在维护！</v-alert-title>
    </template>
    <template #text>
      投影生成器服务正在进行维护，进行数据和服务器迁移，以及代码重构。
      期间可能会有不稳定的情况，如果你遇到问题，请稍后重试。
      <br />
      如果你觉得这个服务对你有帮助，请在B站关注我，以及
      <router-link class="router" style="color: red" to="/sponsors">
        给我打钱！
      </router-link>
      <br />
      若您不想被强制使用夸克下载，可以打钱之后加群708842363联系我，我会给你的账户开通权限。多少随意，大于5元即可。
      <v-row justify="center">
        <v-col style="max-width: 400px">
          <v-btn
            :icon="undefined"
            block
            variant="outlined"
            @click="notification = false"
          >
            我知道了
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-alert>
  <v-alert
    v-if="!maintaining && isClient && notification"
    class="mb-3"
    type="info"
  >
    <template #title>
      <v-alert-title> 暂停服务通知</v-alert-title>
    </template>
    <template #text>
      投影生成器服务将在2025年1月8日起暂停服务，进行数据和服务器迁移，以及代码重构。
      本次维护预计持续2-3天，敬请谅解。
      <br />
      如果你觉得这个服务对你有帮助，请在B站关注我，以及
      <router-link class="router" style="color: red" to="/sponsors">
        给我打钱！
      </router-link>
      <br />
      若您不想被强制使用夸克下载，可以打钱之后加群708842363联系我，我会给你的账户开通权限。多少随意，大于5元即可。
      <v-row justify="center">
        <v-col style="max-width: 400px">
          <v-btn
            :icon="undefined"
            block
            variant="outlined"
            @click="notification = false"
          >
            我知道了
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-alert>
  <div class="w-100 d-flex flex-row justify-center">
    <div v-if="mdAndUp" class="my-ads">
      <div data-some-item="aaa" />
      <sidebar-ad style="position: sticky; top: 80px; right: 10px" />
    </div>
    <v-container>
      <div class="d-flex flex-wrap flex-row mb-4" style="gap: 16px">
        <v-btn
          v-if="locale === 'zh_cn'"
          color="primary"
          href="https://space.bilibili.com/1545239761"
          prepend-icon="custom:Bilibili"
          rounded="lg"
          variant="outlined"
        >
          请在B站关注我，有故障请私信
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-upload"
          rounded="lg"
          variant="outlined"
        >
          {{ t('litematica_generator.upload.button_msg') }}
          <v-dialog
            v-model="uploadDialog"
            activator="parent"
            close-on-back
            max-width="900"
            persistent
          >
            <v-card variant="flat">
              <LazyLitematicaUpload />
              <div class="position-absolute top-0 right-0">
                <v-btn
                  icon="mdi-close"
                  variant="plain"
                  @click="uploadDialog = false"
                />
              </div>
            </v-card>
          </v-dialog>
        </v-btn>
        <v-btn
          v-if="appStore.userCache?.roles?.includes('archiver')"
          :to="localePath('/litematica/review')"
          variant="outlined"
        >
          Archiver Review Panel
        </v-btn>
      </div>

      <v-row justify="center">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="Math.min(8, width / 80 - 2)"
          rounded="xl"
          size="32"
        />
      </v-row>
      <v-row>
        <v-col
          v-for="col in itemDisplayCols"
          :cols="6"
          :md="4"
          justify="center"
        >
          <MinecraftFarmCard
            v-for="item in col.def"
            :key="item.key"
            :back-url="switchLocalePath(locale)"
            :item="item"
            class="mt-4"
          >
          </MinecraftFarmCard>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="Math.min(8, width / 80 - 2)"
          rounded="xl"
          size="32"
        />
      </v-row>
      <div class="text-center opacity-60 w-100 pt-2">
        {{
          t('litematica_generator.total_downloads', [serverResponse?.downloads])
        }}
      </div>
    </v-container>
    <div v-if="mdAndUp" class="my-ads">
      <div data-some-item="aaa" />
      <sidebar-ad style="position: sticky; top: 80px; right: 10px" />
    </div>
  </div>
  <BottomBarAd :height="300" />
</template>

<style scoped>
@media (max-width: 400px) {
  .v-col-md-4,
  .v-col-6,
  .v-col {
    padding: 0 !important;
  }
}

.my-ads {
  width: 150px;
  max-width: 8% !important;
}
</style>
