import { defineStore } from 'pinia';
import { doFetchGet } from '@/utils/constants';

const name = 'meta';

export type Meta = {
  developmentMode: boolean;
  baseUrl: string;
  production: boolean;
  gitHash?: string;
  gitBranch?: string;
  buildTime?: string;
  buildTimestamp?: number;
};

function state(): Meta {
  if (import.meta.client) {
    const data = localStorage.getItem(name);
    if (data) {
      return JSON.parse(data);
    }
  }
  return {
    developmentMode: import.meta.dev,
    baseUrl: location.host,
    production: !import.meta.dev,
  };
}

export const useBackendMeta = defineStore(name, {
  state,
  actions: {
    refresh() {
      doFetchGet('/api/meta')
        .then((res) => res.json())
        .then((data: Meta) => {
          localStorage.setItem(name, JSON.stringify(data));
          this.developmentMode = data.developmentMode;
          this.baseUrl = data.baseUrl;
          this.production = data.production;
          this.gitHash = data.gitHash;
          this.gitBranch = data.gitBranch;
          this.buildTime = data.buildTime;
          this.buildTimestamp = data.buildTimestamp;
        });
    },
    get() {
      if (!this.gitHash) this.refresh();
      return this;
    },
  },
});
