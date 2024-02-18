// Utilities
import { defineStore } from 'pinia'
import {Profile} from "@/constants";

type AppState = {
  logined: boolean
  username?: string
  uid: number
  csrfToken?: string
  userCache?: Profile
}

function getState(): AppState {
  const data = localStorage.getItem('appState')
  if (data) {
    return JSON.parse(data)
  }
  return {
    logined: false,
    username: undefined,
    uid: -1,
    csrfToken: undefined,
    userCache: undefined,
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
      localStorage.setItem('appState', JSON.stringify({
        logined: this.logined,
        username: this.username,
        uid: this.uid,
        csrfToken: this.csrfToken,
        userCache: this.userCache
      }))
    },
    login(username: string, uid: number) {
      this.logined = true
      this.username = username
      this.uid = uid
      this.save()
    },
    updateCache(profile: Profile) {
      this.logined = true
      this.uid = profile.id
      this.userCache = profile
      this.username = profile.username
      this.save()
    },
    setCsrfToken(token: string) {
      this.csrfToken = token
      this.save()
    },
    logout() {
      this.logined = false
      this.username = undefined
      this.uid = -1
      this.csrfToken = undefined
      this.userCache = undefined
      this.save()
    }
  },
})
