import { defineStore } from 'pinia';
import { doFetchGet } from '@/utils/constants';

export const useMessageStore = defineStore('message', {
  state: (): {
    unreadCount: number;
    drawer: boolean;
    unreadMessages: any[];
    messages: any[];
  } => ({
    unreadCount: 0,
    drawer: false,
    unreadMessages: [],
    messages: [],
  }),
  actions: {
    // 初始化未读消息数量
    async initMessageList() {
      doFetchGet('/api/account/notifications/unread')
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            this.unreadCount = data.length;
            this.unreadMessages = data;
          } else {
            console.error(
              'Failed to fetch unread notifications:',
              response.statusText,
            );
          }
        })
        .catch((e) => toastError(e, 'Failed to fetch unread notifications'));
      doFetchGet('/api/account/notifications/all')
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            this.messages = data;
            console.log('messages:', this.messages);
          } else {
            console.error(
              'Failed to fetch all notifications:',
              response.statusText,
            );
          }
        })
        .catch((e) => toastError(e, 'Failed to fetch all notifications'));
    },
    // 减少未读消息数量
    decrementUnreadCount() {
      if (this.unreadCount > 0) {
        this.unreadCount--;
      }
    },
  },
});
