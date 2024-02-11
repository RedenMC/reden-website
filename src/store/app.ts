// Utilities
import { defineStore } from 'pinia'

type AppState = {
  logined: boolean
  username: string | null
  uid: number
  csrfToken: string | null
}

function getState(): AppState {
  const data = localStorage.getItem('appState')
  if (data) {
    return JSON.parse(data)
  }
  return {
    logined: false,
    username: null,
    uid: -1,
    csrfToken: null,
  }
}

export const useAppStore = defineStore('app', {
  hydrate(storeState, initialState) {
    return {
      ...storeState,
      ...initialState,
    }
  },
  state: getState,
  actions: {
    save() {
      localStorage.setItem('appState', JSON.stringify(this.$state))
    },
    login(username: string, uid: number) {
      this.logined = true
      this.username = username
      this.uid = uid
      this.save()
    },
    setCsrfToken(token: string) {
      this.csrfToken = token
      this.save()
    },
    logout() {
      this.logined = false
      this.username = null
      this.uid = -1
      this.csrfToken = null
      this.save()
    }
  },
})
