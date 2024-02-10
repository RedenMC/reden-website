// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  hydrate(storeState, initialState) {
    return {
      ...storeState,
      ...initialState,
    }
  },
  state: () => ({
    logined: false,
    username: null as string | null,
    uid: -1,
    csrfToken: null as string | null,
  }),
  actions: {
    login (username: string, uid: number) {
      this.logined = true
      this.username = username
      this.uid = uid
    },
    setCsrfToken (token: string) {
      this.csrfToken = token
    },
    logout () {
      this.logined = false
      this.username = null
      this.uid = -1
      this.csrfToken = null
    }
  },
})
