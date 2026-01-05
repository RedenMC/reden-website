import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Achievement, AchievementStats } from '@/composables/useAchievements';

export const useAchievementStore = defineStore('achievement', () => {
  // State
  const achievementsCache = ref<Map<number, AchievementStats>>(new Map());
  const lastFetchTime = ref<Map<number, number>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Actions
  const setAchievements = (userId: number, stats: AchievementStats) => {
    achievementsCache.value.set(userId, stats);
    lastFetchTime.value.set(userId, Date.now());
  };

  const getAchievements = (userId: number) => {
    return achievementsCache.value.get(userId);
  };

  const isCacheValid = (userId: number) => {
    const lastFetch = lastFetchTime.value.get(userId);
    if (!lastFetch) return false;
    return Date.now() - lastFetch < CACHE_DURATION;
  };

  const updateAchievementProgress = (userId: number, achievementKey: string, progress: number) => {
    const stats = achievementsCache.value.get(userId);
    if (stats) {
      const achievement = stats.achievements.find((a) => a.key === achievementKey);
      if (achievement) {
        achievement.progress = progress;
        if (progress >= achievement.requirement && !achievement.unlocked) {
          achievement.unlocked = true;
          achievement.unlockedAt = Date.now();
          stats.unlockedCount++;
        }
      }
    }
  };

  const clearCache = () => {
    achievementsCache.value.clear();
    lastFetchTime.value.clear();
  };

  return {
    achievementsCache,
    lastFetchTime,
    setAchievements,
    getAchievements,
    isCacheValid,
    updateAchievementProgress,
    clearCache,
  };
});
