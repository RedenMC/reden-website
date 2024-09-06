import type { I18n } from 'vue-i18n';
import { createI18n } from 'vue-i18n';
import en from '@/plugins/i18n/en.json';
import zh_CN from '@/plugins/i18n/zh_CN.json';
import zh_TW from '@/plugins/i18n/zh_TW.json';

const messages = {
  en,
  zh_cn: zh_CN,
  zh_tw: zh_TW,
};

const lang = document.location.search
  .substring(1)
  .split('&')
  .find((q) => q.startsWith('lang='))
  ?.substring(5);

export const i18n: I18n = createI18n({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  locale: lang || localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  fallbackWarn: false,
  messages,
});
