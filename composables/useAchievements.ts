import { ref } from 'vue';

export interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: number;
  requirement: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
}

export interface AchievementStats {
  achievements: Achievement[];
  totalAchievements: number;
  unlockedCount: number;
}

/**
 * Composable for managing achievements
 */
export const useAchievements = () => {
  const { $t } = useI18nHelper();

  /**
   * Fetch achievements for a user
   */
  const fetchAchievements = async (userId?: number) => {
    try {
      const url = userId
        ? `/api/user/achievements/${userId}`
        : '/api/user/achievements';

      const { data, error } = await useFetch<AchievementStats>(url);

      if (error.value) {
        throw error.value;
      }

      return data.value;
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      useNuxtApp().$toast?.error($t('achievements.fetchError'));
      throw error;
    }
  };

  /**
   * Format achievement date
   */
  const formatAchievementDate = (timestamp: number, locale?: string) => {
    return new Date(timestamp).toLocaleDateString(locale || 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Calculate achievement progress percentage
   */
  const calculateProgress = (achievement: Achievement) => {
    if (achievement.unlocked) return 100;
    return Math.min(100, (achievement.progress / achievement.requirement) * 100);
  };

  /**
   * Get achievement category icon
   */
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      upload: 'mdi-upload',
      social: 'mdi-account-group',
      impact: 'mdi-chart-line',
      special: 'mdi-star',
    };
    return icons[category] || 'mdi-trophy';
  };

  return {
    fetchAchievements,
    formatAchievementDate,
    calculateProgress,
    getCategoryIcon,
  };
};
