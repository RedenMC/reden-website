<script lang="ts" setup>
import MinecraftFarmCard from '~/components/litematica/MinecraftFarmCard.vue';
import { useDisplay, useGoTo } from 'vuetify';
import SidebarAd from '~/components/ads/SidebarAd.vue';
import BottomBarAd from '~/components/ads/BottomBarAd.vue';
import { useAppStore } from '~/store/app';
import { toast } from 'vuetify-sonner';

export type Tag = {
  tag: string;
  name: string;
  description: string;
};

type SortType = 'downloads' | 'createdAt' | 'random' | 'random-extra';
const sortTypes: SortType[] = [
  'downloads',
  'createdAt',
  // 'random',
  'random-extra',
];

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
  source: 'self' | 'minemev';
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

const router = useRouter();
if (router.currentRoute.value.query.m) {
  router.push(localePath(`/litematica/${router.currentRoute.value.query.m}`));
}
const page = useRouteQuery('page', 1, { transform: Number });
const pageSize = ref(18);
const search = useRouteQuery<string>('q', '');
const sortType = useRouteQuery<SortType>('sort', 'downloads');
const versionFilter = useRouteQuery<string>('version', '');
// const totalPages = computed(() =>
//   Math.ceil((serverResponse.value?.count ?? 2006) / pageSize.value),
// );
const uploadDialog = ref(router.currentRoute.value.hash === '#upload');
watch(page, () => {
  return goto(0);
});
watch(sortType, () => {
  return (page.value = 1);
});
watch(versionFilter, () => {
  return (page.value = 1);
});

export type Machine = MachineDef & {
  conditions: { [key: string]: ((v: number) => any)[] };
};
type AdvertisementFormat = 'image';
type AdvertisementImagePayload = {
  url: string;
  clickUrl?: string | null;
};
type AdvertisementDto = {
  id: string;
  title: string;
  format: AdvertisementFormat;
  payload: AdvertisementImagePayload;
  isActive: boolean;
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
const isDev = import.meta.dev;
const url = computed(() => {
  let v = versionFilter.value;
  // Convert "1.20" → "1.20.x" for API filter
  if (v && v.split('.').length === 2 && !v.endsWith('.x')) {
    v = v + '.x';
  }
  const versionParam = v ? `&version=${encodeURIComponent(v)}` : '';
  return search.value
    ? `/api/mc-services/litematica/search?q=${search.value}&lang=${locale.value}&page=${Math.round(page.value)}&pageSize=${pageSize.value}${versionParam}`
    : `/api/mc-services/yisibite/?lang=${locale.value}&page=${Math.round(page.value)}&pageSize=${pageSize.value}&order=${sortType.value}${versionParam}`;
});
const {
  data: serverResponse,
  status,
  error,
  refresh,
} = useFetch<ListLitematicaResponse>(url, {
  dedupe: 'defer',
  headers: {},
  onRequestError: (context) => {
    if (context) {
      toast.error(
        t('litematica_generator.toast.failed_to_load_litematica_list') +
          (context.error as Error).message,
      );
      if (context.error) {
        console.error(
          'Failed to load litematica list',
          context.error,
          context.request,
          context.response,
          context,
        );
      }
    }
  },
});
const totalPages = ref(
  serverResponse.value
    ? Math.ceil(serverResponse.value.count / pageSize.value)
    : 10,
);
const totalDownloads = ref(serverResponse.value?.downloads ?? 0);
watch(serverResponse, (data) => {
  if (data && data.d) {
    totalPages.value = Math.ceil(data.count / pageSize.value);
    totalDownloads.value = data.downloads;
  }
});

const { data: allVersions } = useFetch<string[]>('/api/mc-services/litematica/all-versions');
const versionChips = computed(() => {
  if (!allVersions.value) return [];
  const groups = new Map<string, number>();
  for (const v of allVersions.value) {
    const parts = v.split('.');
    if (parts.length >= 2) {
      const major = parts[0] + '.' + parts[1];
      groups.set(major, (groups.get(major) ?? 0) + 1);
    }
  }
  return Array.from(groups.entries())
    .map(([major]) => major)
    .reverse();
});
const versionChipsExpanded = ref(false);
const visibleVersionChips = computed(() =>
  versionChipsExpanded.value ? versionChips.value : versionChips.value.slice(0, 3),
);

// if (error.value?.statusCode) {
//   throw error.value;
// }
if (import.meta.client) {
  if (!serverResponse.value || !serverResponse.value.d) {
    console.error('投影信息加载失败，需要刷新');
    refresh().finally(() => {
      if (error.value?.statusCode) {
        throw error.value;
      }
    });
  }
}

const { data: featuredAd } = useFetch<AdvertisementDto>('/api/ads/featured', {
  dedupe: 'defer',
});
const featuredAdImage = computed(() => {
  const ad = featuredAd.value;
  if (!ad || ad.format !== 'image') return null;
  return ad.payload?.url ?? null;
});
const featuredAdTitle = computed(() => featuredAd.value?.title ?? '');
const featuredAdClickUrl = computed(() => {
  const ad = featuredAd.value;
  if (!ad || ad.format !== 'image') return null;
  return ad.payload?.clickUrl ?? null;
});
const isAdVisible = ref(true);
const handleAdClick = () => {
  if (!featuredAd.value) return;
  fetch(`/api/ads/${featuredAd.value.id}/click`, { method: 'POST' }).catch(() => {});
};

const isClient = import.meta.client;
const notification = ref<boolean>(false);
const maintaining = false;
const { mdAndUp, lgAndUp, width } = useDisplay({
  mobileBreakpoint: 600,
});
const itemsPerRow = computed(() => {
  if (!width.value) {
    return 2;
  }
  if (width.value < 750) {
    return 2;
  }
  if (width.value < 1300) {
    return 3;
  }
  return 4;
});
const itemDisplayCols = computed(() => {
  const cols: { def?: MachineDef[] }[] = [];
  for (let i = 0; i < itemsPerRow.value; i++) {
    cols[i] = { def: [] };
  }
  console.log('itemsPerRow=', itemsPerRow.value, 'width=', width.value);
  let i = 0;
  for (const def of serverResponse.value?.d ?? []) {
    cols[i % itemsPerRow.value].def?.push(def);
    i++;
  }
  return cols;
});
</script>
<template>
  <div>
    <div v-if="isAdVisible" class="advertisement-banner w-100 text-center">
      <button class="ad-close" type="button" @click="isAdVisible = false">
        广告 ×
      </button>
      <div v-if="featuredAdImage" class="advertisement-content">
        <a
          v-if="featuredAdClickUrl"
          :href="featuredAdClickUrl"
          target="_blank"
          rel="noopener"
          @click="handleAdClick"
        >
          <img
            :src="featuredAdImage"
            :alt="featuredAdTitle || '广告'"
            class="advertisement-image"
            loading="lazy"
          />
        </a>
        <img
          v-else
          :src="featuredAdImage"
          :alt="featuredAdTitle || '广告'"
          class="advertisement-image"
          loading="lazy"
        />
      </div>
      <div v-else class="ad-placeholder">
        广告位招租！如需推广请联系微信 Scanmenge 或 QQ 1284588550（请注明来意）
      </div>
    </div>
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
      <div v-if="lgAndUp" class="my-ads">
        <div data-some-item="aaa" />
        <sidebar-ad style="position: sticky; top: 80px; right: 10px" />
      </div>
      <v-container>
        <div class="d-flex flex-wrap flex-row mb-4" style="gap: 16px">
          <v-btn
            v-if="locale === 'zh_cn'"
            :to="localePath('/litematica/earning')"
            variant="outlined"
            color="green"
          >
            上传投影得收益！
          </v-btn>
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
        <div v-if="!search" class="d-flex flex-wrap flex-row mb-4">
          <span style="line-height: 36px">
            {{ t('litematica_generator.sort.sort_by') }}
          </span>
          <v-btn
            v-for="sort in sortTypes"
            :key="sort"
            :active="sortType === sort"
            class="text-none"
            color="secondary"
            variant="text"
            @click="sortType = sort"
          >
            {{ t(`litematica_generator.sort.${sort}`) }}
          </v-btn>
        </div>
        <div class="d-flex flex-wrap flex-row mb-4 align-center" style="gap: 8px">
          <span style="line-height: 36px" class="text-grey-lighten-1">
            {{ t('litematica_generator.version_filter') }}
          </span>
          <v-btn
            :active="!versionFilter"
            class="text-none"
            color="secondary"
            size="small"
            variant="tonal"
            @click="versionFilter = ''"
          >
            All
          </v-btn>
          <v-btn
            v-for="ver in visibleVersionChips"
            :key="ver"
            :active="versionFilter === ver || `${ver}.x` === versionFilter"
            class="text-none"
            color="secondary"
            size="small"
            variant="tonal"
            @click="versionFilter = ver"
          >
            {{ ver }}
          </v-btn>
          <v-btn
            v-if="!versionChipsExpanded && versionChips.length > 3"
            class="text-none"
            color="secondary"
            size="small"
            variant="tonal"
            @click="versionChipsExpanded = true"
          >
            …
          </v-btn>
          <v-btn
            v-if="versionFilter && !versionChips.includes(versionFilter)"
            :active="true"
            class="text-none"
            color="primary"
            size="small"
            variant="tonal"
          >
            {{ versionFilter }}
            <v-icon
              end
              size="small"
              @click.stop="versionFilter = ''"
            >
              mdi-close
            </v-icon>
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
        <div v-if="isDev">
          [Dev] Request Status:
          {{ status }}
        </div>
        <template
          v-if="
            !itemDisplayCols.length ||
            status === 'pending' ||
            status === 'error'
          "
        >
          <v-row v-for="key in [1, 2, 3]" :key="key">
            <v-col
              v-for="col in Array.from({ length: itemsPerRow }, (_, i) => i)"
              :cols="12 / itemsPerRow"
              :key="col"
              justify="center"
            >
              <v-skeleton-loader type="card"></v-skeleton-loader>
            </v-col>
          </v-row>
        </template>
        <template v-else>
          <v-row>
            <v-col
              v-for="col in itemDisplayCols"
              :cols="12 / itemsPerRow"
              justify="center"
            >
              <MinecraftFarmCard
                v-for="item in col.def"
                :key="item.key"
                :item="item"
                class="mt-4"
              >
              </MinecraftFarmCard>
            </v-col>
          </v-row>

          <v-row v-if="serverResponse?.d && serverResponse.d.length === 0">
            <v-col cols="12" class="text-center">
              <v-alert type="info" variant="outlined">
                {{ t('litematica_generator.no_results') }}
              </v-alert>
            </v-col>
          </v-row>
        </template>
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
          {{ t('litematica_generator.total_downloads', [totalDownloads]) }}
        </div>
      </v-container>
      <div v-if="mdAndUp" class="my-ads">
        <div data-some-item="aaa" />
        <sidebar-ad style="position: sticky; top: 80px; right: 10px" />
      </div>
    </div>
    <BottomBarAd :height="300" />
  </div>
</template>

<style scoped>
@media (max-width: 400px) {
  .v-col-md-4,
  .v-col-6,
  .v-col {
    padding: 0 !important;
  }
}

.advertisement-banner {
  position: relative;
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.ad-close {
  position: absolute;
  top: 4px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.advertisement-image :hover {
  transform: scale(1.02);
  transition: transform 0.3s;
}

.advertisement-image {
  max-height: 150px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}


.ad-placeholder {
  font-size: 0.85rem;
  opacity: 0.7;
  line-height: 1.5;
}

.my-ads {
  position: absolute;
  width: 150px;
  max-width: 8% !important;
}
</style>
