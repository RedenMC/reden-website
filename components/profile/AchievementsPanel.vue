<script setup lang="ts">
import { ref, computed } from 'vue';

interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: number;
  requirement: number;
  unlocked: boolean;
  unlockedAt: number | null;
  progress: number;
}

interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  recentAchievements: Achievement[];
  nextAchievements: Achievement[];
}

interface Props {
  userId?: number;
}

const props = defineProps<Props>();
const stats = ref<AchievementStats | null>(null);
const loading = ref(false);
const selectedCategory = ref<string | null>(null);
const showAll = ref(false);

const categories = [
  { key: null, label: 'achievements.categories.all', icon: 'mdi-star' },
  { key: 'upload', label: 'achievements.categories.upload', icon: 'mdi-upload' },
  { key: 'social', label: 'achievements.categories.social', icon: 'mdi-heart' },
  { key: 'impact', label: 'achievements.categories.impact', icon: 'mdi-chart-line' },
  { key: 'special', label: 'achievements.categories.special', icon: 'mdi-trophy' },
];

// Fetch achievements
const fetchAchievements = async () => {
  loading.value = true;
  try {
    const url = props.userId
      ? `/api/user/achievements/${props.userId}`
      : '/api/user/achievements';
    const { data } = await useFetch<AchievementStats>(url);
    stats.value = data.value;
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
  } finally {
    loading.value = false;
  }
};

const completionPercentage = computed(() => {
  if (!stats.value) return 0;
  return Math.round(
    (stats.value.unlockedAchievements / stats.value.totalAchievements) * 100,
  );
});

const allAchievements = computed(() => {
  if (!stats.value) return [];
  return [...stats.value.recentAchievements, ...stats.value.nextAchievements];
});

const filteredAchievements = computed(() => {
  let achievements = showAll.value
    ? allAchievements.value
    : stats.value?.recentAchievements || [];

  if (selectedCategory.value) {
    achievements = achievements.filter(
      (a) => a.category === selectedCategory.value,
    );
  }

  return achievements.sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return b.tier - a.tier;
  });
});

const getTierColor = (tier: number) => {
  const colors = ['grey', 'blue', 'green', 'purple', 'orange', 'red'];
  return colors[tier] || 'grey';
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString();
};

const getProgressPercentage = (achievement: Achievement) => {
  return Math.min(100, (achievement.progress / achievement.requirement) * 100);
};

onMounted(() => {
  fetchAchievements();
});

const $t = (key: string) => {
  const i18n = useNuxtApp().$i18n;
  return i18n?.t(key) || key;
};
</script>

<template>
  <v-card class="achievements-card">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-2">
        <v-icon color="primary">mdi-trophy</v-icon>
        <span>{{ $t('achievements.title') }}</span>
      </div>
      <v-chip v-if="stats" color="primary" size="small">
        {{ stats.unlockedAchievements }} / {{ stats.totalAchievements }}
      </v-chip>
    </v-card-title>

    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-card-text>

    <v-card-text v-else-if="stats">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="d-flex justify-space-between mb-2">
          <span class="text-body-2">{{ $t('achievements.progress') }}</span>
          <span class="text-body-2 font-weight-bold"
            >{{ completionPercentage }}%</span
          >
        </div>
        <v-progress-linear
          :model-value="completionPercentage"
          height="8"
          color="primary"
          rounded
        />
      </div>

      <!-- Category Filter -->
      <div class="mb-4">
        <v-chip-group v-model="selectedCategory" mandatory>
          <v-chip
            v-for="cat in categories"
            :key="cat.key"
            :value="cat.key"
            size="small"
          >
            <v-icon start>{{ cat.icon }}</v-icon>
            {{ $t(cat.label) }}
          </v-chip>
        </v-chip-group>
      </div>

      <!-- Achievements Grid -->
      <v-row dense>
        <v-col
          v-for="achievement in filteredAchievements"
          :key="achievement.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            :class="['achievement-card', { unlocked: achievement.unlocked }]"
            :elevation="achievement.unlocked ? 3 : 1"
          >
            <v-card-text class="text-center pa-3">
              <div class="achievement-icon mb-2">
                {{ achievement.icon }}
              </div>
              <div class="achievement-name mb-1">
                {{ achievement.name }}
              </div>
              <div class="achievement-desc text-caption mb-2">
                {{ achievement.description }}
              </div>

              <v-chip
                :color="getTierColor(achievement.tier)"
                size="x-small"
                class="mb-2"
              >
                Tier {{ achievement.tier }}
              </v-chip>

              <div v-if="!achievement.unlocked" class="progress-section mt-2">
                <div class="text-caption mb-1">
                  {{ achievement.progress }} / {{ achievement.requirement }}
                </div>
                <v-progress-linear
                  :model-value="getProgressPercentage(achievement)"
                  height="4"
                  color="primary"
                  rounded
                />
              </div>

              <div v-else class="text-caption success-text mt-2">
                <v-icon size="small" color="success">mdi-check-circle</v-icon>
                {{ $t('achievements.unlocked') }}
                {{ formatDate(achievement.unlockedAt || 0) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Show More Button -->
      <div class="text-center mt-4">
        <v-btn variant="outlined" @click="showAll = !showAll">
          {{
            showAll ? $t('achievements.showLess') : $t('achievements.showAll')
          }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.achievements-card {
  margin-bottom: 16px;
}

.achievement-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  background: rgba(var(--v-theme-surface), 0.8);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.achievement-card:hover {
  transform: translateY(-2px);
}

.achievement-card.unlocked {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.1),
    rgba(var(--v-theme-secondary), 0.05)
  );
  border-color: rgb(var(--v-theme-primary));
}

.achievement-icon {
  font-size: 48px;
  line-height: 1;
  filter: grayscale(100%);
  opacity: 0.5;
  transition: all 0.3s;
}

.achievement-card.unlocked .achievement-icon {
  filter: grayscale(0%);
  opacity: 1;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.achievement-name {
  font-weight: 600;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
}

.achievement-desc {
  color: rgb(var(--v-theme-on-surface-variant));
  min-height: 36px;
}

.progress-section {
  padding-top: 8px;
}

.success-text {
  color: rgb(var(--v-theme-success));
}
</style>
