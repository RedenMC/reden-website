import { defineStore } from 'pinia';
import { doFetchGet, doFetchPost } from '~/utils/constants';
import type { NotificationDto, NotificationListDto } from '~/utils/notifications';

export const useMessageStore = defineStore('message', {
  state: (): {
    unreadCount: number;
    drawer: boolean;
    notifications: NotificationDto[];
    total: number;
    currentPage: number;
    loading: boolean;
    pollTimer: ReturnType<typeof setInterval> | null;
  } => ({
    unreadCount: 0,
    drawer: false,
    notifications: [],
    total: 0,
    currentPage: 1,
    loading: false,
    pollTimer: null,
  }),

  actions: {
    async fetchUnreadCount() {
      try {
        const res = await doFetchGet('/api/account/notifications/unread');
        if (res.ok) {
          const data: NotificationListDto = await res.json();
          this.unreadCount = data.total;
        }
      } catch {
        // silently fail for background polling
      }
    },

    async fetchNotifications(page = 1, size = 20) {
      this.loading = true;
      this.currentPage = page;
      try {
        const res = await doFetchGet('/api/account/notifications/all', {
          page: String(page),
          size: String(size),
        });
        if (res.ok) {
          const data: NotificationListDto = await res.json();
          this.notifications = data.notifications;
          this.total = data.total;
        }
      } catch (e) {
        console.error('Failed to fetch notifications', e);
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id: number) {
      try {
        const res = await doFetchPost(
          `/api/account/notifications/${id}/read`,
          {},
        );
        if (res.ok) {
          const notif = this.notifications.find((n) => n.id === id);
          if (notif && !notif.read) {
            notif.read = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
        }
      } catch (e) {
        console.error('Failed to mark notification as read', e);
      }
    },

    async markAllAsRead() {
      try {
        const res = await doFetchPost(
          '/api/account/notifications/read-all',
          {},
        );
        if (res.ok) {
          this.notifications.forEach((n) => {
            n.read = true;
          });
          this.unreadCount = 0;
        }
      } catch (e) {
        console.error('Failed to mark all as read', e);
      }
    },

    toggleDrawer() {
      this.drawer = !this.drawer;
    },

    startPolling() {
      if (this.pollTimer) return;
      this.fetchUnreadCount();
      this.pollTimer = setInterval(() => this.fetchUnreadCount(), 60000);
    },

    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },

    async fetchUnreadNotifications() {
      this.loading = true;
      try {
        const res = await doFetchGet('/api/account/notifications/unread');
        if (res.ok) {
          const data: NotificationListDto = await res.json();
          this.notifications = data.notifications;
          this.total = data.total;
        }
      } catch (e) {
        console.error('Failed to fetch unread notifications', e);
      } finally {
        this.loading = false;
      }
    },
  },
});
