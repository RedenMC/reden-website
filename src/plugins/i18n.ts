import type { I18n } from 'vue-i18n'
import { createI18n } from 'vue-i18n'
const messages = {
  en: {
    en: 'English',
    zh: '中文',
    reden: {
      download: 'Download',
      description: 'Provide a one-stop working environment for redstone machine developers and become the best redstone debugging and teaching tool.',
    },
    search: {
      hover: 'Search Reden Features',
    },
  },
  zh: {
    en: 'English',
    zh: '中文',
    reden: {
      download: '下载',
      description: '为红石机器开发者提供一站式工作环境，成为最好的红石调试和教学工具。',
    },
    search: {
      hover: '搜索 Reden 功能',
    },
  },
}


export const i18n: I18n = createI18n({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages,
})
