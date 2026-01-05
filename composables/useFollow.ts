import { ref } from 'vue';
import { useAppStore } from '@/store/app';

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface FollowUser {
  uid: number;
  username: string;
  isFollowing: boolean;
}

export interface FollowListResponse {
  users: FollowUser[];
  total: number;
}

/**
 * Composable for managing follow functionality
 */
export const useFollow = () => {
  const appStore = useAppStore();
  const { $t } = useI18nHelper();
  const processing = ref(false);

  /**
   * Fetch follow stats for a user
   */
  const fetchFollowStats = async (userId: number) => {
    try {
      const { data, error } = await useFetch<FollowStats>(
        `/api/user/follow/stats/${userId}`
      );

      if (error.value) {
        throw error.value;
      }

      return data.value;
    } catch (error) {
      console.error('Failed to fetch follow stats:', error);
      throw error;
    }
  };

  /**
   * Toggle follow status for a user
   */
  const toggleFollow = async (userId: number, currentlyFollowing: boolean) => {
    if (processing.value) return null;
    if (!appStore.logined) {
      useNuxtApp().$toast?.error($t('common.loginRequired'));
      return null;
    }

    processing.value = true;
    const previousState = currentlyFollowing;

    try {
      const method = currentlyFollowing ? 'DELETE' : 'POST';
      await $fetch(`/api/user/follow/${userId}`, { method });

      const newState = !currentlyFollowing;

      useNuxtApp().$toast?.success(
        newState ? $t('follow.success') : $t('follow.unfollowSuccess')
      );

      return newState;
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      useNuxtApp().$toast?.error($t('follow.error'));
      // Return previous state to allow rollback
      return previousState;
    } finally {
      processing.value = false;
    }
  };

  /**
   * Fetch followers list
   */
  const fetchFollowers = async (userId: number, page: number = 1, pageSize: number = 20) => {
    try {
      const { data, error } = await useFetch<FollowListResponse>(
        `/api/user/follow/followers/${userId}?page=${page}&pageSize=${pageSize}`
      );

      if (error.value) {
        throw error.value;
      }

      return data.value;
    } catch (error) {
      console.error('Failed to fetch followers:', error);
      throw error;
    }
  };

  /**
   * Fetch following list
   */
  const fetchFollowing = async (userId: number, page: number = 1, pageSize: number = 20) => {
    try {
      const { data, error } = await useFetch<FollowListResponse>(
        `/api/user/follow/following/${userId}?page=${page}&pageSize=${pageSize}`
      );

      if (error.value) {
        throw error.value;
      }

      return data.value;
    } catch (error) {
      console.error('Failed to fetch following:', error);
      throw error;
    }
  };

  return {
    processing,
    fetchFollowStats,
    toggleFollow,
    fetchFollowers,
    fetchFollowing,
  };
};
