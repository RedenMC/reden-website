<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface MonitoringData {
  followStats: {
    totalFollows: number;
    todayFollows: number;
    weekFollows: number;
  };
  achievementStats: {
    totalUnlocks: number;
    todayUnlocks: number;
    popularAchievements: Array<{
      key: string;
      name: string;
      unlockCount: number;
    }>;
  };
  notificationStats: {
    likeNotifications: number;
    followNotifications: number;
    commentNotifications: number;
    totalSent: number;
  };
  milestoneStats: {
    totalReached: number;
    todayReached: number;
    byType: Record<string, number>;
  };
  userEngagement: {
    activeUsers: number;
    newUsers: number;
    retentionRate: number;
  };
}

const data = ref<MonitoringData | null>(null);
const loading = ref(false);
const refreshInterval = ref<NodeJS.Timeout | null>(null);
const autoRefresh = ref(true);

const fetchMonitoringData = async () => {
  loading.value = true;
  try {
    // 这里需要创建对应的后端API端点
    const { data: response } = await useFetch<MonitoringData>(
      '/api/admin/monitoring/retention',
    );
    data.value = response.value;
  } catch (error) {
    console.error('Failed to fetch monitoring data:', error);
    useNuxtApp().$toast?.error($t('common.load_error'));
  } finally {
    loading.value = false;
  }
};

const setupAutoRefresh = () => {
  if (autoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      fetchMonitoringData();
    }, 60000); // 每分钟刷新一次
  }
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  if (autoRefresh.value) {
    setupAutoRefresh();
  } else if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
};

onMounted(() => {
  fetchMonitoringData();
  setupAutoRefresh();
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});

const $t = (key: string) => {
  const i18n = useNuxtApp().$i18n;
  return i18n?.t(key) || key;
};
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <h1 class="text-h4">
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            {{ $t('monitoring.title') }}
          </h1>
          <div class="d-flex gap-2">
            <v-btn :loading="loading" icon @click="fetchMonitoringData">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn
              :color="autoRefresh ? 'primary' : 'default'"
              @click="toggleAutoRefresh"
            >
              <v-icon start>{{
                autoRefresh ? 'mdi-pause' : 'mdi-play'
              }}</v-icon>
              {{
                autoRefresh
                  ? $t('monitoring.autoRefreshOn')
                  : $t('monitoring.autoRefreshOff')
              }}
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="loading && !data" class="mt-8">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-col>
    </v-row>

    <template v-else-if="data">
      <!-- User Engagement Stats -->
      <v-row dense>
        <v-col cols="12" md="4">
          <v-card class="stat-card">
            <v-card-text>
              <div class="stat-icon mb-2">
                <v-icon size="40" color="primary">mdi-account-group</v-icon>
              </div>
              <div class="stat-value">
                {{ data.userEngagement.activeUsers.toLocaleString() }}
              </div>
              <div class="stat-label">{{ $t('monitoring.activeUsers') }}</div>
              <v-chip size="small" color="success" class="mt-2">
                +{{ data.userEngagement.newUsers }}
                {{ $t('monitoring.newToday') }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="stat-card">
            <v-card-text>
              <div class="stat-icon mb-2">
                <v-icon size="40" color="success"
                  >mdi-chart-line-variant</v-icon
                >
              </div>
              <div class="stat-value">
                {{ data.userEngagement.retentionRate }}%
              </div>
              <div class="stat-label">{{ $t('monitoring.retentionRate') }}</div>
              <v-progress-linear
                :model-value="data.userEngagement.retentionRate"
                color="success"
                class="mt-2"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="stat-card">
            <v-card-text>
              <div class="stat-icon mb-2">
                <v-icon size="40" color="info">mdi-email</v-icon>
              </div>
              <div class="stat-value">
                {{ data.notificationStats.totalSent.toLocaleString() }}
              </div>
              <div class="stat-label">
                {{ $t('monitoring.totalNotifications') }}
              </div>
              <div class="text-caption mt-2">
                {{ $t('monitoring.last24Hours') }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Follow Stats -->
      <v-row dense class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-account-heart</v-icon>
              {{ $t('monitoring.followStats') }}
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" sm="4">
                  <div class="metric-box">
                    <div class="metric-value">
                      {{ data.followStats.totalFollows.toLocaleString() }}
                    </div>
                    <div class="metric-label">
                      {{ $t('monitoring.totalFollows') }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="4">
                  <div class="metric-box">
                    <div class="metric-value text-success">
                      +{{ data.followStats.todayFollows }}
                    </div>
                    <div class="metric-label">
                      {{ $t('monitoring.todayFollows') }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="4">
                  <div class="metric-box">
                    <div class="metric-value text-info">
                      +{{ data.followStats.weekFollows }}
                    </div>
                    <div class="metric-label">
                      {{ $t('monitoring.weekFollows') }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Achievement Stats -->
      <v-row dense class="mt-4">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-trophy</v-icon>
              {{ $t('monitoring.achievementStats') }}
            </v-card-title>
            <v-card-text>
              <v-row dense class="mb-4">
                <v-col cols="6">
                  <div class="metric-box">
                    <div class="metric-value">
                      {{ data.achievementStats.totalUnlocks.toLocaleString() }}
                    </div>
                    <div class="metric-label">
                      {{ $t('monitoring.totalUnlocks') }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="metric-box">
                    <div class="metric-value text-warning">
                      +{{ data.achievementStats.todayUnlocks }}
                    </div>
                    <div class="metric-label">
                      {{ $t('monitoring.todayUnlocks') }}
                    </div>
                  </div>
                </v-col>
              </v-row>

              <div class="text-subtitle-2 mb-2">
                {{ $t('monitoring.popularAchievements') }}
              </div>
              <v-list density="compact">
                <v-list-item
                  v-for="ach in data.achievementStats.popularAchievements"
                  :key="ach.key"
                >
                  <template #prepend>
                    <v-icon size="small">mdi-medal</v-icon>
                  </template>
                  <v-list-item-title>{{ ach.name }}</v-list-item-title>
                  <template #append>
                    <v-chip size="small" color="primary">{{
                      ach.unlockCount
                    }}</v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Milestone Stats -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-flag-checkered</v-icon>
              {{ $t('monitoring.milestoneStats') }}
            </v-card-title>
            <v-card-text>
              <v-row dense class="mb-4">
                <v-col cols="6">
                  <div class="metric-box">
                    <div class="metric-value">
                      {{ data.milestoneStats.totalReached.toLocaleString() }}
                    </div>
                    <div class="metric-label">
                      {{ $t('monitoring.totalMilestones') }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="metric-box">
                    <div class="metric-value text-success">
                      +{{ data.milestoneStats.todayReached }}
                    </div>
                    <div class="metric-label">
                      {{ $t('monitoring.todayMilestones') }}
                    </div>
                  </div>
                </v-col>
              </v-row>

              <div class="text-subtitle-2 mb-2">
                {{ $t('monitoring.byType') }}
              </div>
              <div
                v-for="(count, type) in data.milestoneStats.byType"
                :key="type"
                class="mb-2"
              >
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-capitalize">{{ type }}</span>
                  <span class="font-weight-bold">{{ count }}</span>
                </div>
                <v-progress-linear
                  :model-value="
                    (count / data.milestoneStats.totalReached) * 100
                  "
                  color="primary"
                  height="6"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Notification Stats -->
      <v-row dense class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-bell</v-icon>
              {{ $t('monitoring.notificationStats') }}
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" sm="3">
                  <div class="metric-box">
                    <v-icon color="error" size="32" class="mb-2"
                      >mdi-heart</v-icon
                    >
                    <div class="metric-value">
                      {{ data.notificationStats.likeNotifications }}
                    </div>
                    <div class="metric-label">
                      {{ $t('monitoring.likeNotifications') }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="3">
                  <div class="metric-box">
                    <v-icon color="primary" size="32" class="mb-2"
                      >mdi-account-plus</v-icon
                    >
                    <div class="metric-value">
                      {{ data.notificationStats.followNotifications }}
                    </div>
                    <div class="metric-label">
                      {{ $t('monitoring.followNotifications') }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="3">
                  <div class="metric-box">
                    <v-icon color="info" size="32" class="mb-2"
                      >mdi-comment</v-icon
                    >
                    <div class="metric-value">
                      {{ data.notificationStats.commentNotifications }}
                    </div>
                    <div class="metric-label">
                      {{ $t('monitoring.commentNotifications') }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="3">
                  <div class="metric-box">
                    <v-icon color="success" size="32" class="mb-2"
                      >mdi-email-check</v-icon
                    >
                    <div class="metric-value">
                      {{ data.notificationStats.totalSent }}
                    </div>
                    <div class="metric-label">
                      {{ $t('monitoring.totalSent') }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style scoped>
.stat-card {
  height: 100%;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  color: rgb(var(--v-theme-primary));
}

.stat-label {
  font-size: 14px;
  text-align: center;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-box {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.metric-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
}

.text-success {
  color: rgb(var(--v-theme-success));
}

.text-info {
  color: rgb(var(--v-theme-info));
}

.text-warning {
  color: rgb(var(--v-theme-warning));
}
</style>
