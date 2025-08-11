<script lang="ts" setup>
import { ref } from 'vue';
import RedStoneSection from '@/components/RedStoneSection.vue';
import RedstoneSectionTitle from '@/components/RedstoneSectionTitle.vue';
import Feature from '@/pages/feature/index.vue';

import {
  discordInvite,
  doFetchGet,
  githubLink,
  toastError,
} from '@/utils/constants';
import '@/assets/main.css';
import { useBackendMeta } from '~/store/meta';
import { toast } from 'vuetify-sonner';
import { useAppStore } from '~/store/app';
import type { MachineDef } from '~/pages/litematica/index.vue';

const appStore = useAppStore();
const introContent = ref<HTMLElement | null>(null);
const localePath = useLocalePath();

const { t, locale } = useI18n();
useHead({
  title: t('reden.title.home_full'),
  titleTemplate: '%s - Reden',
});
useSeoMeta({
  description: t('reden.description'),
});

const backendInfo = useBackendMeta();

const {
  data: homepageData,
  refresh,
  status,
} = useFetch<{
  posts: MachineDef[];
  profiles: { author: Profile; totalDownloads: number; totalVoteUps: number }[];
  totalDownloads: number;
  totalPosts: number;
  totalUsers: number;
}>(`api/mc-services/litematica/homepage-profiles?lang=${locale.value}`, {
  dedupe: 'cancel',
});
if (import.meta.client && status.value !== 'pending' && !homepageData.value) {
  // load failure, refresh
  refresh();
}

// 排行榜相关方法
function getRankClass(index: number) {
  if (index === 0) return 'rank-first';
  if (index === 1) return 'rank-second';
  if (index === 2) return 'rank-third';
  return '';
}

function getRankBadgeClass(index: number) {
  if (index === 0) return 'badge-gold';
  if (index === 1) return 'badge-silver';
  if (index === 2) return 'badge-bronze';
  return '';
}

function getRankIcon(index: number) {
  if (index === 0) return 'mdi-crown';
  if (index === 1) return 'mdi-medal';
  if (index === 2) return 'mdi-trophy-variant';
  return '';
}

// Stats data for hero section
const stats = ref([
  { number: '900+', label: t('reden.home.stats.redstone_machines') },
  { number: '180.4K+', label: t('reden.home.stats.total_downloads') },
  { number: '9300+', label: t('reden.home.stats.users') },
  { number: '24/7', label: t('reden.home.stats.online_service') },
]);

// Dashboard metrics data
const dashboardMetrics = ref([
  {
    value: stats.value[0].number,
    label: t('reden.home.stats.redstone_machines'),
    icon: 'mdi-cube-outline',
    color: 'blue-lighten-4',
    iconColor: 'blue',
    change: `+15% ${t('reden.home.stats.change_this_month')}`,
    trendIcon: 'mdi-trending-up',
    trendColor: 'green',
  },
  {
    value: stats.value[1].number,
    label: t('reden.home.stats.total_downloads'),
    icon: 'mdi-download',
    color: 'green-lighten-4',
    iconColor: 'green',
    change: `+23% ${t('reden.home.stats.change_this_month')}`,
    trendIcon: 'mdi-trending-up',
    trendColor: 'green',
  },
  {
    value: stats.value[2].number,
    label: t('reden.home.stats.active_users'),
    icon: 'mdi-account-group',
    color: 'purple-lighten-4',
    iconColor: 'purple',
    change: `+8% ${t('reden.home.stats.change_this_month')}`,
    trendIcon: 'mdi-trending-up',
    trendColor: 'green',
  },
  {
    value: '99.9%',
    label: t('reden.home.stats.service_availability'),
    icon: 'mdi-server',
    color: 'orange-lighten-4',
    iconColor: 'orange',
    change: t('reden.home.stats.stable_running'),
    trendIcon: 'mdi-check-circle',
    trendColor: 'green',
  },
]);
watch(homepageData, (data) => {
  stats.value[0].number = `${data?.totalPosts ?? '500'}+`;
  dashboardMetrics.value[0].value = stats.value[0].number;
  stats.value[1].number = `${(data?.totalDownloads ?? 124000) / 1000}K+`;
  dashboardMetrics.value[1].value = stats.value[1].number;
  stats.value[2].number = `${data?.totalUsers ?? 8000}+`;
  dashboardMetrics.value[2].value = stats.value[2].number;
});
</script>

<template>
  <div>
    <div v-if="backendInfo.developmentMode">
      <v-alert closable :close-label="$t('$vuetify.close')" icon="mdi-alert">
        <v-alert-title>{{ t('reden.home.dev_mode.title') }}</v-alert-title>
        <v-btn
          color="primary"
          @click="
            doFetchGet('/api/account/login-test-account').then((res) => {
              if (res.ok) {
                appStore.login('test', 1);
                toast.success(t('reden.home.dev_mode.login_success'));
              } else {
                toastError(res);
              }
            })
          "
        >
          {{ t('reden.home.dev_mode.login_test_account') }}
        </v-btn>
      </v-alert>
    </div>
    <div class="main-page">
      <div>
        <div class="hero-section position-relative overflow-hidden">
          <div class="hero-background position-absolute w-100 h-100"></div>
          <v-container class="position-relative">
            <v-row no-gutters align="center" class="py-12 py-md-16">
              <v-col cols="12" md="9">
                <div class="pr-md-8">
                  <h1
                    class="text-h2 text-md-h1 font-weight-bold mb-2 hero-title"
                  >
                    <span class="text-gradient">RedenMC</span>
                    <span class="text-amber">.com</span>
                  </h1>
                  <div class="title-underline mb-4"></div>
                  <p
                    class="text-h6 text-md-h5 text-grey-lighten-1 mb-8 font-weight-regular"
                  >
                    {{ t('reden.description') }}
                  </p>
                  <!-- 实时数据展示 -->
                  <v-row class="mb-8">
                    <v-col
                      cols="6"
                      md="3"
                      v-for="(stat, index) in stats"
                      :key="index"
                    >
                      <v-card
                        class="stat-card text-center pa-4"
                        variant="outlined"
                      >
                        <div
                          class="text-h5 text-md-h4 font-weight-bold text-primary mb-1"
                        >
                          {{ stat.number }}
                        </div>
                        <div class="text-caption text-grey-lighten-1">
                          {{ stat.label }}
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                  <!-- 操作按钮 -->
                  <div class="d-flex flex-column flex-sm-row ga-4">
                    <v-btn
                      :to="localePath('/litematica')"
                      color="primary"
                      prepend-icon="mdi-download"
                      size="x-large"
                      variant="tonal"
                      class="text-none font-weight-semibold rounded-xl"
                    >
                      {{ t('reden.home.go_litematica') }}
                    </v-btn>
                    <v-btn
                      :href="githubLink"
                      prepend-icon="mdi-github"
                      size="x-large"
                      variant="outlined"
                      color="white"
                      class="text-none font-weight-semibold rounded-xl"
                    >
                      Github
                    </v-btn>
                  </div>
                </div>
              </v-col>
              <v-col
                cols="12"
                md="3"
                class="d-flex justify-center mt-8 mt-md-0"
              >
                <div
                  class="logo-container position-relative d-flex align-center justify-center"
                >
                  <div class="logo-glow position-absolute"></div>
                  <v-img
                    src="/reden_256.png"
                    width="120"
                    class="position-relative logo-main"
                    style="z-index: 2"
                  />
                  <div class="orbit-ring position-absolute"></div>
                  <div class="orbit-ring orbit-ring-2 position-absolute"></div>
                </div>
              </v-col>
            </v-row>
          </v-container>

          <!-- 上传投影活动横幅 -->
          <v-container class="my-8" v-if="false">
            <v-card class="activity-banner overflow-hidden" elevation="8">
              <div
                class="banner-background position-absolute w-100 h-100"
              ></div>
              <v-card-text class="pa-8 position-relative">
                <v-row no-gutters align="center">
                  <v-col cols="12" md="8">
                    <div class="mb-4">
                      <v-chip
                        color="red"
                        variant="elevated"
                        size="small"
                        class="mb-4"
                      >
                        <v-icon start size="small">mdi-fire</v-icon>
                        限时活动
                      </v-chip>
                    </div>
                    <h2
                      class="text-h4 text-md-h3 font-weight-bold mb-4 d-flex align-center text-white"
                    >
                      <v-icon class="mr-2" color="amber" size="large"
                        >mdi-trophy</v-icon
                      >
                      <span class="text-h5 text-md-h4"
                        >上传投影，赢积分好礼！</span
                      >
                    </h2>
                    <p
                      class="text-body-1 text-md-h6 text-grey-lighten-2 mb-6 font-weight-regular"
                    >
                      下载Reden模组，在游戏内上传你的红石机器投影到本网站，可获得定制纪念品、正版Minecraft等丰富奖励！
                    </p>
                    <div class="d-flex flex-wrap ga-3 mb-6">
                      <div class="reward-item">
                        <v-icon color="purple" size="small">mdi-gift</v-icon>
                        <span>定制纪念品</span>
                      </div>
                      <div class="reward-item">
                        <v-icon color="green" size="small"
                          >mdi-minecraft</v-icon
                        >
                        <span>正版Minecraft</span>
                      </div>
                      <div class="reward-item">
                        <v-icon color="orange" size="small">mdi-star</v-icon>
                        <span>等值奖励</span>
                      </div>
                    </div>
                    <div class="d-flex flex-column flex-sm-row ga-3">
                      <v-btn
                        :to="localePath('/download')"
                        color="primary"
                        size="large"
                        prepend-icon="mdi-download"
                        variant="elevated"
                        class="text-none font-weight-semibold"
                      >
                        下载模组
                      </v-btn>
                      <v-btn
                        :to="localePath('/litematica#upload')"
                        color="white"
                        size="large"
                        prepend-icon="mdi-upload"
                        variant="outlined"
                        class="text-none font-weight-semibold"
                      >
                        立即上传
                      </v-btn>
                    </div>
                  </v-col>
                  <v-col
                    cols="12"
                    md="4"
                    class="d-none d-md-flex justify-center align-center"
                  >
                    <div class="redstone-decoration position-relative">
                      <img
                        src="/image/homepage/section/redstone_lamp_on.png"
                        class="redstone-element redstone-lamp position-absolute"
                        alt="红石灯"
                      />
                      <img
                        src="/image/homepage/section/lever.png"
                        class="redstone-element lever position-absolute"
                        alt="拉杆"
                      />
                      <img
                        src="/image/homepage/section/piston_head.png"
                        class="redstone-element piston position-absolute"
                        alt="活塞"
                      />
                      <img
                        src="/image/homepage/section/redstone_dust_15.png"
                        class="redstone-element dust position-absolute"
                        alt="红石粉"
                      />
                      <img
                        src="/reden_256.png"
                        class="reden-logo position-absolute"
                        alt="Reden Logo"
                      />
                    </div>
                    <div class="floating-elements position-absolute">
                      <v-chip
                        class="floating-chip"
                        color="amber"
                        variant="elevated"
                        size="small"
                      >
                        <v-icon start size="small">mdi-lightning-bolt</v-icon>
                        赚积分
                      </v-chip>
                      <v-chip
                        class="floating-chip-2"
                        color="purple"
                        variant="elevated"
                        size="small"
                      >
                        <v-icon start size="small">mdi-gift-outline</v-icon>
                        领好礼
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-container>
        </div>
      </div>
    </div>

    <v-container class="my-12">
      <v-row class="mb-8">
        <!-- 热门红石机器 -->
        <v-col cols="12" lg="8">
          <div class="tech-card">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon class="mr-2" color="red">mdi-fire</v-icon>
                {{ t('reden.home.popular_machines.title') }}
              </h3>
              <v-btn
                :to="localePath('/litematica')"
                variant="outlined"
                size="small"
                prepend-icon="mdi-arrow-right"
              >
                {{ t('reden.home.popular_machines.view_all') }}
              </v-btn>
            </div>
            <div class="card-content">
              <div class="machine-grid">
                <v-skeleton-loader
                  v-for="i in [0, 1, 2, 3, 4, 5]"
                  v-if="status === 'pending'"
                  type="card"
                  class="machine-item"
                />
                <div
                  v-for="(post, index) in homepageData?.posts?.slice(0, 6)"
                  :key="index"
                  class="machine-item"
                >
                  <div class="machine-preview">
                    <v-img
                      :src="post.thumbnailUrl || '/image/default-preview.png'"
                      aspect-ratio="16/9"
                      cover
                      class="machine-image"
                    />
                    <div class="machine-overlay">
                      <v-btn
                        :to="localePath(`/litematica/${post.key}`)"
                        icon="mdi-eye"
                        size="small"
                        variant="elevated"
                        color="primary"
                      />
                    </div>
                  </div>
                  <div class="machine-info">
                    <h4 class="machine-title">{{ post.name }}</h4>
                    <div class="machine-stats">
                      <span class="stat">
                        <v-icon size="small" color="blue">mdi-download</v-icon>
                        {{ post.downloads }}
                      </span>
                      <span class="stat">
                        <v-icon size="small" color="red">mdi-heart</v-icon>
                        {{ post.upVotes }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- 顶级创作者排行 -->
        <v-col cols="12" lg="4">
          <div class="tech-card">
            <div class="card-header">
              <h3 class="card-title">
                <v-icon class="mr-2" color="amber">mdi-crown</v-icon>
                {{ t('reden.home.creator_ranking.title') }}
              </h3>
              <v-chip color="cyan" size="small" variant="outlined">{{
                t('reden.home.creator_ranking.real_time')
              }}</v-chip>
            </div>
            <div class="card-content">
              <div class="creators-list">
                <v-skeleton-loader
                  v-if="status === 'pending'"
                  v-for="i in [2, 0, 0, 6]"
                  type="list-item-avatar"
                />
                <div
                  v-for="(item, index) in homepageData?.profiles?.slice(0, 8)"
                  :key="index"
                  class="creator-item"
                  v-ripple
                  @click="
                    () => {
                      if (item && item.author) {
                        $router.push(localePath(`/@${item.author.username}`));
                      }
                    }
                  "
                >
                  <template v-if="item && item.author">
                    <div class="creator-rank">
                      <div class="rank-number" :class="getRankClass(index)">
                        {{ index + 1 }}
                      </div>
                    </div>
                    <div class="creator-avatar">
                      <v-avatar :image="item.author.avatarUrl" size="40" />
                      <div
                        v-if="index < 3"
                        class="rank-badge"
                        :class="getRankBadgeClass(index)"
                      >
                        <v-icon size="small">{{ getRankIcon(index) }}</v-icon>
                      </div>
                    </div>
                    <div class="creator-info">
                      <div class="creator-name">{{ item.author.username }}</div>
                      <div class="creator-stats">
                        <span class="stat-item">
                          <v-icon size="small" color="red">mdi-heart</v-icon>
                          {{ item.totalVoteUps }}
                        </span>
                        <span class="stat-item">
                          <v-icon size="small" color="blue"
                            >mdi-download</v-icon
                          >
                          {{ item.totalDownloads }}
                        </span>
                      </div>
                    </div>
                    <v-btn
                      :to="localePath(`/@${item.author.username}`)"
                      icon="mdi-arrow-right"
                      size="small"
                      variant="text"
                      class="creator-action"
                    />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <div class="mt-8">
        <h2
          class="text-h4 font-weight-bold text-center mb-8 d-flex align-center justify-center"
        >
          <v-icon class="mr-2" color="cyan" size="large">mdi-chart-line</v-icon>
          {{ t('reden.home.platform_overview.title') }}
        </h2>
        <v-row>
          <v-col
            cols="6"
            sm="6"
            md="3"
            v-for="(metric, index) in dashboardMetrics"
            :key="index"
          >
            <v-card class="metric-card h-100" variant="outlined" hover>
              <v-card-text class="pa-4 text-center">
                <v-avatar :color="metric.color" size="56" class="mb-3">
                  <v-icon :color="metric.iconColor" size="28">{{
                    metric.icon
                  }}</v-icon>
                </v-avatar>
                <div class="text-h6 text-md-h5 font-weight-bold mb-1">
                  {{ metric.value }}
                </div>
                <div class="text-caption text-grey-darken-1 mb-2">
                  {{ metric.label }}
                </div>
                <v-chip
                  :color="metric.trendColor"
                  variant="tonal"
                  size="x-small"
                >
                  <v-icon start size="x-small">{{ metric.trendIcon }}</v-icon>
                  {{ metric.change }}
                </v-chip>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>

    <div ref="introContent" class="intro-content">
      <div class="content-common d-none">
        <p>
          {{ t('reden.home.intro_description.intro_1') }}
        </p>
        <p>
          {{ t('reden.home.intro_description.intro_2') }}
        </p>
        <p>
          {{ t('reden.home.intro_description.intro_3') }}
        </p>
        <p>{{ t('reden.home.intro_description.intro_4') }}</p>
      </div>
      <Feature />
      <div class="content-common">
        <v-row v-if="false" class="community-intro">
          <v-col>
            <v-card color="light-blue">
              <v-card-title>
                {{ t('litematica_generator.title') }}
              </v-card-title>
              <v-card-text>
                {{ t('litematica_generator.description') }}
              </v-card-text>
              <v-card-actions>
                <v-btn :to="localePath('/litematica')" color="White">Go</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col>
            <v-card color="orange">
              <v-card-title>{{
                t('reden.home.sync_github.title')
              }}</v-card-title>
              <v-card-text>
                {{ t('reden.home.sync_github.description') }}
              </v-card-text>
              <v-card-actions>
                <v-btn :to="localePath('/home')" color="White">{{
                  t('reden.home.sync_github.go_to')
                }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <RedstoneSectionTitle :title="t('reden.home.community_intro.title')">
          <template #default="{ leverOn }">
            <RedStoneSection :lever-on="leverOn" :size="3">
              <template #title> Open Source</template>
              <template #text>
                <p>
                  {{ t('reden.home.community_intro.open_source') }}
                </p>
              </template>
              <template #action>
                <v-btn
                  :href="githubLink"
                  class="ma-2"
                  color="primary"
                  rounded="rounded"
                  variant="outlined"
                >
                  Github
                </v-btn>
              </template>
            </RedStoneSection>
            <RedStoneSection :lever-on="leverOn" :size="3">
              <template #title> Sponsors</template>
              <template #text>
                <p>
                  {{ t('reden.home.community_intro.sponsor') }}
                </p>
              </template>
              <template #action>
                <v-btn
                  :to="localePath('/sponsors')"
                  class="ma-2"
                  color="primary"
                  rounded="rounded"
                  variant="outlined"
                >
                  Sponsors
                </v-btn>
              </template>
            </RedStoneSection>
            <RedStoneSection :lever-on="leverOn" :size="3">
              <template #title> Wiki</template>
              <template #text>
                <p>
                  {{ t('reden.home.community_intro.wiki') }}
                </p>
              </template>
              <template #action>
                <v-btn
                  class="ma-2"
                  color="primary"
                  href="//wiki.redenmc.com"
                  rounded="rounded"
                  variant="outlined"
                >
                  Wiki
                </v-btn>
              </template>
            </RedStoneSection>
            <RedStoneSection :lever-on="leverOn" :size="3">
              <template #title> Discord</template>
              <template #text>
                <p>
                  {{ t('reden.home.community_intro.discord') }}
                </p>
              </template>
              <template #action>
                <v-btn
                  :href="discordInvite"
                  class="ma-2"
                  color="primary"
                  rounded="rounded"
                  variant="outlined"
                >
                  Discord
                </v-btn>
              </template>
            </RedStoneSection>
          </template>
        </RedstoneSectionTitle>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 英雄区域自定义样式 */
.hero-section {
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f4a 50%, #2a1b5a 100%);
  border: 1px solid rgba(129, 140, 248, 0.2);
  color: white;
}

.hero-background {
  background: radial-gradient(
      circle at 20% 50%,
      rgba(99, 102, 241, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 50%,
      rgba(168, 85, 247, 0.1) 0%,
      transparent 50%
    ),
    linear-gradient(
      45deg,
      transparent 40%,
      rgba(129, 140, 248, 0.05) 50%,
      transparent 60%
    );
}

.text-gradient {
  background: linear-gradient(135deg, #60a5fa, #a78bfa, #ec4899);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-underline {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  border-radius: 2px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(129, 140, 248, 0.2) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

/* Logo动画样式 */
.logo-container {
  height: 200px;
}

.logo-glow {
  width: 140px;
  height: 140px;
  background: radial-gradient(
    circle,
    rgba(96, 165, 250, 0.3) 0%,
    transparent 70%
  );
  border-radius: 50%;
  animation: pulse-glow 3s ease-in-out infinite;
}

.orbit-ring {
  border: 2px solid rgba(129, 140, 248, 0.3);
  border-radius: 50%;
  animation: orbit 15s linear infinite;
}

.orbit-ring {
  width: 160px;
  height: 160px;
}

.orbit-ring-2 {
  width: 200px;
  height: 200px;
  border-color: rgba(168, 85, 247, 0.2);
  animation-duration: 20s;
  animation-direction: reverse;
}

/* 活动横幅样式 */
.activity-banner {
  background: linear-gradient(135deg, #1e293b 0%, #3730a3 50%, #7c2d92 100%);
  border: 1px solid rgba(129, 140, 248, 0.3);
  color: white;
}

.banner-background {
  background: radial-gradient(
      circle at 30% 40%,
      rgba(99, 102, 241, 0.2) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 70% 60%,
      rgba(168, 85, 247, 0.2) 0%,
      transparent 50%
    );
}

/* 红石装饰元素 */
.redstone-decoration {
  width: 200px;
  height: 200px;
}

.redstone-element {
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.redstone-lamp {
  top: 20px;
  left: 20px;
  animation: glow 2s ease-in-out infinite alternate;
}

.lever {
  top: 20px;
  right: 20px;
  animation: float 3s ease-in-out infinite;
}

.piston {
  bottom: 60px;
  left: 30px;
  animation: float 2.5s ease-in-out infinite;
  animation-delay: 0.5s;
}

.dust {
  bottom: 20px;
  right: 40px;
  width: 32px;
  height: 32px;
  animation: pulse 2s ease-in-out infinite;
}

.reden-logo {
  width: 80px;
  height: 80px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 4s ease-in-out infinite;
  animation-delay: 1s;
}

.floating-elements {
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.floating-chip,
.floating-chip-2 {
  animation: float 3s ease-in-out infinite;
}

.floating-chip-2 {
  animation-delay: 1.5s;
}

/* 动画关键帧 */
@keyframes pulse-glow {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

@keyframes orbit {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes glow {
  0% {
    filter: drop-shadow(0 0 5px rgba(255, 200, 0, 0.8))
      drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  100% {
    filter: drop-shadow(0 0 15px rgba(255, 200, 0, 1))
      drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.main-logo {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.5));
}

.orbit-ring {
  position: absolute;
  border: 2px solid rgba(129, 140, 248, 0.3);
  border-radius: 50%;
  animation: orbit 15s linear infinite;
}

.orbit-ring {
  width: 160px;
  height: 160px;
}

.orbit-ring-2 {
  width: 200px;
  height: 200px;
  border-color: rgba(168, 85, 247, 0.2);
  animation-duration: 20s;
  animation-direction: reverse;
}

@keyframes pulse-glow {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

@keyframes orbit {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 仪表板样式 */
.dashboard-section {
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  border-radius: 16px;
  padding: 48px 0;
  margin: 48px 0;
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.data-overview {
  margin-bottom: 48px;
}

.metric-card {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1),
    rgba(99, 102, 241, 0.1)
  );
  border: 1px solid rgba(129, 140, 248, 0.2);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: rgba(129, 140, 248, 0.4);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.metric-icon {
  width: 64px;
  height: 64px;
  background: rgba(129, 140, 248, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: white;
  line-height: 1;
}

.metric-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 4px 0;
}

.metric-change {
  font-size: 0.75rem;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tech-card {
  background: linear-gradient(
    135deg,
    rgba(17, 24, 39, 0.8),
    rgba(31, 41, 55, 0.8)
  );
  border: 1px solid rgba(75, 85, 99, 0.3);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  height: 100%;
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid rgba(75, 85, 99, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-content {
  padding: 24px;
}

.machine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.machine-item {
  background: rgba(55, 65, 81, 0.5);
  border: 1px solid rgba(75, 85, 99, 0.3);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.machine-item:hover {
  transform: translateY(-2px);
  border-color: rgba(129, 140, 248, 0.4);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.machine-preview {
  position: relative;
  overflow: hidden;
}

.machine-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.machine-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.machine-item:hover .machine-overlay {
  opacity: 1;
}

.machine-info {
  padding: 12px;
}

.machine-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.machine-stats {
  display: flex;
  gap: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.creators-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.creator-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(55, 65, 81, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
  margin-bottom: 12px;
}

.creator-item:hover {
  background: rgba(55, 65, 81, 0.5);
  border-color: rgba(129, 140, 248, 0.3);
}

.creator-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-number {
  font-weight: bold;
  font-size: 0.875rem;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-first {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1f2937;
}

.rank-second {
  background: linear-gradient(135deg, #e5e7eb, #9ca3af);
  color: #1f2937;
}

.rank-third {
  background: linear-gradient(135deg, #d97706, #92400e);
  color: white;
}

.creator-avatar {
  position: relative;
}

.rank-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #1f2937;
}

.badge-gold {
  background: #fbbf24;
  color: #1f2937;
}

.badge-silver {
  background: #e5e7eb;
  color: #1f2937;
}

.badge-bronze {
  background: #d97706;
  color: white;
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.creator-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.creator-action {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.creator-item:hover .creator-action {
  opacity: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .hero-content {
    padding: 32px 16px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .hero-actions {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }

  .action-btn {
    width: 100%;
    max-width: none;
  }

  .dashboard-section {
    padding: 32px 0;
    margin: 32px 0;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .machine-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    padding: 16px;
  }

  .card-content {
    padding: 16px;
  }
}

.activity-banner-wrapper {
  margin: 48px 0 0 0;
  width: 100%;
}

.activity-banner {
  border-radius: 12px;
  overflow: hidden;
}

.banner-background {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  position: relative;
  padding: 24px;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.activity-badge {
  margin-bottom: 16px;
}

.activity-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
}

.activity-subtitle {
  margin: 8px 0 16px;
  font-size: 16px;
  opacity: 0.9;
}

.activity-rewards {
  display: flex;
  gap: 24px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.activity-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.banner-image {
  justify-content: center;
  align-items: center;
}

.image-container {
  position: relative;
  width: 100%;
  height: 200px;
}

.redstone-decoration {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
}

.redstone-element {
  position: absolute;
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.redstone-lamp {
  top: 20px;
  left: 20px;
  animation: glow 2s ease-in-out infinite alternate;
}

.lever {
  top: 20px;
  right: 20px;
  animation: float 3s ease-in-out infinite;
}

.piston {
  bottom: 60px;
  left: 30px;
  animation: float 2.5s ease-in-out infinite;
  animation-delay: 0.5s;
}

.dust {
  bottom: 20px;
  right: 40px;
  width: 32px;
  height: 32px;
  animation: pulse 2s ease-in-out infinite;
}

.reden-logo {
  width: 80px;
  height: 80px;
  z-index: 2;
  animation: float 4s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes glow {
  0% {
    filter: drop-shadow(0 0 5px rgba(255, 200, 0, 0.8))
      drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  100% {
    filter: drop-shadow(0 0 15px rgba(255, 200, 0, 1))
      drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.floating-elements {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.floating-chip,
.floating-chip-2 {
  animation: float 3s ease-in-out infinite;
}

.floating-chip-2 {
  animation-delay: 1.5s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .activity-title {
    font-size: 24px;
  }

  .activity-rewards {
    justify-content: center;
  }

  .activity-actions {
    justify-content: center;
  }

  .banner-background {
    padding: 20px;
  }
}
</style>
