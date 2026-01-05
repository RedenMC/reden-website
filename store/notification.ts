import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Notification } from '@/composables/useNotifications';

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([]);
  const total = ref(0);
  const unreadCount = ref(0);
  const lastFetchTime = ref<number>(0);

  // Computed
  const hasUnread = computed(() => unreadCount.value > 0);

  // Actions
  const setNotifications = (newNotifications: Notification[], totalCount: number) => {
    notifications.value = newNotifications;
    total.value = totalCount;
    unreadCount.value = newNotifications.filter((n) => !n.read).length;
    lastFetchTime.value = Date.now();
  };

  const addNotification = (notification: Notification) => {
    notifications.value.unshift(notification);
    total.value++;
    if (!notification.read) {
      unreadCount.value++;
    }
  };

  const markAsRead = (notificationId: number) => {
    const notification = notifications.value.find((n) => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      notification.readAt = Date.now();
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  };

  const markAllAsRead = () => {
    notifications.value.forEach((n) => {
      if (!n.read) {
        n.read = true;
        n.readAt = Date.now();
      }
    });
    unreadCount.value = 0;
  };

  const clearNotifications = () => {
    notifications.value = [];
    total.value = 0;
    unreadCount.value = 0;
    lastFetchTime.value = 0;
  };

  return {
    notifications,
    total,
    unreadCount,
    hasUnread,
    lastFetchTime,
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
});
