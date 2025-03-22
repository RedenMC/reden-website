// Utilities
import { defineStore } from 'pinia';
import { doFetchGet, type Profile } from '@/utils/constants';
import { useLocalStorage } from '@vueuse/core';

type AppState = {
  logined: boolean;
  username?: string;
  uid: number;
  csrfToken: string | null;
  userCache?: Profile;
  gads?: boolean;
  invertPreview: boolean;
  _isInChina?: boolean;
  theme: 'light' | 'dark';
};

export const storage = useLocalStorage<AppState>('redenCache', {
  logined: false,
  username: undefined,
  uid: -1,
  csrfToken: null,
  userCache: undefined,
  gads: true,
  invertPreview: false,
  _isInChina: undefined,
  theme: 'light',
});

export const useAppStore = defineStore('reden', {
  state: () =>
    ({
      logined: false,
      username: undefined,
      uid: -1,
      csrfToken: null,
      userCache: undefined,
      gads: true,
      invertPreview: false,
      theme: 'light',
    }) as AppState,
  hydrate(storeState, initialState) {
    console.log(
      '[pinia] hydrate',
      JSON.stringify(storeState),
      JSON.stringify(storage.value),
    );
    storeState.logined = storage.value.logined;
    storeState.username = storage.value.username;
    storeState.uid = storage.value.uid;
    storeState.csrfToken = storage.value.csrfToken;
    storeState.userCache = storage.value.userCache;
    storeState.theme = storage.value.theme ?? 'light';
    storeState._isInChina = storage.value._isInChina ?? undefined;
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
        theme: this.theme,
        _isInChina: this._isInChina,
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
    async isInChina() {
      if (this._isInChina !== undefined) return this._isInChina;
      if (!import.meta.client) return false;
      else {
        const res = await doFetchGet('/api/ip');
        if (res.ok) {
          const data: {
            ip: string;
            mm?: {
              country_code: string;
              country: string;
              country_zh: string;
              subdivision: string;
              subdivision_zh: string;
              city: string;
              city_zh: string;
              latitude: number;
              longitude: number;
            };
          } = await res.json();
          if (data.mm?.country_code === 'CN') {
            console.log('ip', data.ip, 'is in china.');
            this._isInChina = true;
            this.save();
            return true;
          } else if (data.mm?.country_code) {
            this._isInChina = false;
            this.save();
            return false;
          } else {
            console.log('ip', data.ip, 'is unknown.');
          }
        }
      }
    },
    logout() {
      this.logined = false;
      this.username = undefined;
      this.uid = -1;
      this.csrfToken = null;
      this.userCache = undefined;
      this._isInChina = undefined;
      this.save();
    },
  },
});
