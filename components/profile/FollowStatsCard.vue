<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();

interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface Props {
  userId: number;
  username: string;
}

const props = defineProps<Props>();
const stats = ref<FollowStats | null>(null);
const loading = ref(false);
const processing = ref(false);

// Fetch follow stats
const fetchStats = async () => {
  loading.value = true;
  try {
    const { data } = await useFetch<FollowStats>(
      `/api/user/follow/stats/${props.userId}`,
    );
    stats.value = data.value;
  } catch (error) {
    console.error('Failed to fetch follow stats:', error);
  } finally {
    loading.value = false;
  }
};

// Toggle follow
const toggleFollow = async () => {
  if (processing.value || !stats.value) return;

  processing.value = true;
  try {
    const method = stats.value.isFollowing ? 'DELETE' : 'POST';
    await $fetch(`/api/user/follow/${props.userId}`, { method });

    // Update stats
    stats.value.isFollowing = !stats.value.isFollowing;
    stats.value.followersCount += stats.value.isFollowing ? 1 : -1;

    // Show success message
    useNuxtApp().$toast?.success(
      stats.value.isFollowing
        ? $t('follow.success')
        : $t('follow.unfollowSuccess'),
    );
  } catch (error) {
    console.error('Failed to toggle follow:', error);
    useNuxtApp().$toast?.error($t('follow.error'));
  } finally {
    processing.value = false;
  }
};

const buttonText = computed(() => {
  if (!stats.value) return '';
  return stats.value.isFollowing ? $t('follow.unfollow') : $t('follow.follow');
});

const buttonColor = computed(() => {
  if (!stats.value) return 'primary';
  return stats.value.isFollowing ? 'default' : 'primary';
});

// Fetch stats on mount
onMounted(() => {
  fetchStats();
});

const $t = (key: string) => {
  const i18n = useNuxtApp().$i18n;
  return i18n?.t(key) || key;
};
</script>

<template>
  <v-card class="follow-stats-card" elevation="2">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>{{ username }}</span>
      <v-btn
        v-if="stats && appStore.logined && appStore.uid !== userId"
        :color="buttonColor"
        :loading="processing"
        :disabled="loading"
        size="small"
        @click="toggleFollow"
      >
        <v-icon v-if="stats.isFollowing" start>mdi-account-check</v-icon>
        <v-icon v-else start>mdi-account-plus</v-icon>
        {{ buttonText }}
      </v-btn>
    </v-card-title>

    <v-card-text v-if="loading" class="text-center py-4">
      <v-progress-circular indeterminate color="primary" />
    </v-card-text>

    <v-card-text v-else-if="stats" class="follow-stats">
      <v-row dense>
        <v-col cols="6">
          <NuxtLink
            :to="`/user/${userId}/followers`"
            class="stat-item text-decoration-none"
          >
            <div class="stat-number">
              {{ stats.followersCount.toLocaleString() }}
            </div>
            <div class="stat-label">{{ $t('follow.followers') }}</div>
          </NuxtLink>
        </v-col>
        <v-col cols="6">
          <NuxtLink
            :to="`/user/${userId}/following`"
            class="stat-item text-decoration-none"
          >
            <div class="stat-number">
              {{ stats.followingCount.toLocaleString() }}
            </div>
            <div class="stat-label">{{ $t('follow.following') }}</div>
          </NuxtLink>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.follow-stats-card {
  margin-bottom: 16px;
}

.follow-stats {
  padding: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.stat-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
