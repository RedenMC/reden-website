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
  gads?: boolean;
  invertPreview: boolean;
};

const storage = useLocalStorage<AppState>('redenCache', {
  logined: false,
  username: undefined,
  uid: -1,
  csrfToken: null,
  userCache: undefined,
  gads: false,
  invertPreview: false,
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
    storeState.gads = storage.value.gads;
  },
  actions: {
    save() {
      storage.value = {
        logined: this.logined,
        username: this.username,
        uid: this.uid,
        csrfToken: this.csrfToken,
        userCache: this.userCache,
        gads: this.gads,
        invertPreview: this.invertPreview,
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
      this.logined = true;
      this.csrfToken = token;
      this.save();
    },
    toggleInvertPreview() {
      this.invertPreview = !this.invertPreview;
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
