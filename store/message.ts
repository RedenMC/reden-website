// stores/message.ts
import { defineStore } from 'pinia';

export const useMessageStore = defineStore('message', {
  state: (): {
    unreadCount: number;
    drawer: boolean;
  } => ({
    // TODO 初始化未读消息数量
    unreadCount: 3,
    drawer: false,
  }),
  actions: {
    decrementUnreadCount() {
      if (this.unreadCount > 0) {
        console.log(this.unreadCount);
        this.unreadCount--;
      }
    },
  },
});
