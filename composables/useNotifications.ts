import { ref } from 'vue';

export interface Notification {
  id: number;
  subject: string;
  message: string;
  read: boolean;
  createdAt: number;
  readAt: number | null;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Composable for managing notifications
 */
export const useNotifications = () => {
  const { $t } = useI18nHelper();

  /**
   * Fetch notifications list
   */
  const fetchNotifications = async (page: number = 1, pageSize: number = 10) => {
    try {
      const { data, error } = await useFetch<NotificationListResponse>(
        `/api/account/notifications/all?page=${page}&size=${pageSize}`
      );

      if (error.value) {
        throw error.value;
      }

      return data.value;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      useNuxtApp().$toast?.error($t('notifications.fetchError'));
      throw error;
    }
  };

  /**
   * Mark a notification as read
   */
  const markAsRead = async (notificationId: number) => {
    try {
      await $fetch(`/api/account/notifications/${notificationId}/read`, {
        method: 'POST',
      });

      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      useNuxtApp().$toast?.error($t('notifications.markReadError'));
      return false;
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      await $fetch('/api/account/notifications/read-all', {
        method: 'POST',
      });

      useNuxtApp().$toast?.success($t('notifications.allMarkedRead'));
      return true;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      useNuxtApp().$toast?.error($t('notifications.markAllReadError'));
      return false;
    }
  };

  /**
   * Format notification date
   */
  const formatNotificationDate = (timestamp: number, locale?: string) => {
    return new Date(timestamp).toLocaleString(locale || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = (notification: Notification) => {
    if (notification.subject.includes('follow')) return 'mdi-account-plus';
    if (notification.subject.includes('like')) return 'mdi-heart';
    if (notification.subject.includes('comment')) return 'mdi-comment';
    if (notification.subject.includes('achievement')) return 'mdi-trophy';
    if (notification.subject.includes('milestone')) return 'mdi-flag';
    return notification.read ? 'mdi-email-open' : 'mdi-email';
  };

  return {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    formatNotificationDate,
    getNotificationIcon,
  };
};
