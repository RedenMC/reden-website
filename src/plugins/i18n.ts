import type { I18n } from 'vue-i18n';
import { createI18n } from 'vue-i18n';
import en from '@/plugins/i18n/en.json';
import zh_cn from '@/plugins/i18n/zh_CN.json';
import zh_tw from '@/plugins/i18n/zh_TW.json';

const messages = {
  en,
  zh_cn,
  zh_tw,
};
const browserLanguage = navigator && navigator.language;

export const i18n: I18n = createI18n({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  locale: localStorage.getItem('locale') || browserLanguage || 'en',
  fallbackLocale: 'en',
  fallbackWarn: false,
  messages,
});
