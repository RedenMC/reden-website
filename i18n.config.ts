import en from '@/i18n/en.json';
import zh_cn from '@/i18n/zh_CN.json';
import zh_tw from '@/i18n/zh_TW.json';

const messages = {
  en,
  zh_cn,
  zh_tw,
};
const browserLanguage = navigator && navigator.language;
export default defineI18nConfig(() => ({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  locale: browserLanguage || 'en',
  fallbackLocale: 'en',
  fallbackWarn: false,
  messages,
}));
