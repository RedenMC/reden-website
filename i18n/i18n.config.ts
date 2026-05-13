import en from '~/i18n/en.json';
import zh_cn from '~/i18n/zh_CN.json';
import zh_tw from '~/i18n/zh_TW.json';
import ru from '~/i18n/ru_RU.json';
import mcEn from '~/i18n/minecraft/en_us.json';
import mcZhCn from '~/i18n/minecraft/zh_cn.json';
import mcZhTw from '~/i18n/minecraft/zh_tw.json';
import mcRu from '~/i18n/minecraft/ru_ru.json';

export const localeToIso: Record<string, string> = {
  en: 'en',
  zh_cn: 'zh-CN',
  zh_tw: 'zh-TW',
};

const messages = {
  en: {
    ...en,
    minecraft: mcEn,
  },
  zh_cn: {
    ...zh_cn,
    minecraft: mcZhCn,
  },
  zh_tw: {
    ...zh_tw,
    minecraft: mcZhTw,
  },
};
export default defineI18nConfig(() => ({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  fallbackLocale: 'en',
  fallbackWarn: false,
  missingWarn: false,
  messages,
}));
