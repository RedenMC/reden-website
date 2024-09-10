// Utilities
import { defineStore } from 'pinia';
import { type Profile } from '@/utils/constants';
import { useLocalStorage } from '@vueuse/core';

type AppState = {
  logined: boolean;
  username?: string;
  uid: number;
  csrfToken: string | null;
  userCache?: Profile;
  theme: 'light' | 'dark';
};

function state(): AppState {
  console.log('import.meta', import.meta);
  if (import.meta.client) {
    const data = localStorage.getItem('redenCache');
    if (data) {
      console.log('loaded localStorage', data);
      return JSON.parse(data);
    }
  }
  return {
    logined: false,
    username: undefined,
    uid: -1,
    csrfToken: null,
    userCache: undefined,
    theme: 'dark',
  };
}

const storage = useLocalStorage<AppState>('redenCache', {
  logined: false,
  username: undefined,
  uid: -1,
  csrfToken: null,
  userCache: undefined,
  theme: 'dark',
});

export const useAppStore = defineStore('reden', {
  state() {
    return storage.value;
  },
  hydrate(storeState, initialState) {
    storeState.logined = storage.value.logined;
    storeState.username = storage.value.username;
    storeState.uid = storage.value.uid;
    storeState.csrfToken = storage.value.csrfToken;
    storeState.userCache = storage.value.userCache;
    storeState.theme = storage.value.theme;
  },
  actions: {
    save() {
      storage.value = {
        logined: this.logined,
        username: this.username,
        uid: this.uid,
        csrfToken: this.csrfToken,
        userCache: this.userCache,
        theme: this.theme,
      };
    },
    login(username: string, uid: number) {
      this.logined = true;
      this.username = username;
      this.uid = uid;
      this.save();
    },
    updateCache(profile: Profile) {
      this.logined = true;
      this.uid = profile.id;
      this.userCache = profile;
      this.username = profile.username;
      this.save();
    },
    setCsrfToken(token: string) {
      this.csrfToken = token;
      this.save();
    },
    setTheme(theme: 'light' | 'dark') {
      this.theme = theme;
      this.save();
    },
    logout() {
      this.logined = false;
      this.username = undefined;
      this.uid = -1;
      this.csrfToken = null;
      this.userCache = undefined;
      this.save();
    },
  },
});
