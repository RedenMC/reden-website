import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FollowStats, FollowUser } from '@/composables/useFollow';

export const useFollowStore = defineStore('follow', () => {
  // State
  const followStatsCache = ref<Map<number, FollowStats>>(new Map());
  const followersCache = ref<Map<number, FollowUser[]>>(new Map());
  const followingCache = ref<Map<number, FollowUser[]>>(new Map());

  // Actions
  const setFollowStats = (userId: number, stats: FollowStats) => {
    followStatsCache.value.set(userId, stats);
  };

  const getFollowStats = (userId: number) => {
    return followStatsCache.value.get(userId);
  };

  const updateFollowStatus = (userId: number, isFollowing: boolean) => {
    const stats = followStatsCache.value.get(userId);
    if (stats) {
      stats.isFollowing = isFollowing;
      stats.followersCount += isFollowing ? 1 : -1;
      followStatsCache.value.set(userId, stats);
    }
  };

  const setFollowers = (userId: number, followers: FollowUser[]) => {
    followersCache.value.set(userId, followers);
  };

  const getFollowers = (userId: number) => {
    return followersCache.value.get(userId);
  };

  const setFollowing = (userId: number, following: FollowUser[]) => {
    followingCache.value.set(userId, following);
  };

  const getFollowing = (userId: number) => {
    return followingCache.value.get(userId);
  };

  const clearCache = () => {
    followStatsCache.value.clear();
    followersCache.value.clear();
    followingCache.value.clear();
  };

  return {
    followStatsCache,
    followersCache,
    followingCache,
    setFollowStats,
    getFollowStats,
    updateFollowStatus,
    setFollowers,
    getFollowers,
    setFollowing,
    getFollowing,
    clearCache,
  };
});
