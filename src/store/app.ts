// Utilities
import { defineStore } from 'pinia';
import { Profile } from '@/constants';

type AppState = {
  logined: boolean;
  username?: string;
  uid: number;
  csrfToken?: string;
  userCache?: Profile;
  theme: 'light' | 'dark';
};

function state(): AppState {
  const data = localStorage.getItem('redenCache');
  if (data) {
    return JSON.parse(data);
  }
  return {
    logined: false,
    username: undefined,
    uid: -1,
    csrfToken: undefined,
    userCache: undefined,
    theme: 'dark',
  };
}

export const useAppStore = defineStore('reden', {
  state,
  actions: {
    save() {
      localStorage.setItem(
        'redenCache',
        JSON.stringify({
          logined: this.logined,
          username: this.username,
          uid: this.uid,
          csrfToken: this.csrfToken,
          userCache: this.userCache,
          theme: this.theme,
        }),
      );
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
      this.csrfToken = undefined;
      this.userCache = undefined;
      this.save();
    },
  },
});
