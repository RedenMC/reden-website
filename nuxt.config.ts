// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from 'vite-plugin-vuetify';
import transformAssetUrls = vuetify.transformAssetUrls;

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
  ],
  i18n: {
    strategy: 'prefix_except_default',
    vueI18n: './i18n.config.ts',
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en' },
      { code: 'zh_cn', language: 'zh-CN' },
      { code: 'zh_tw', language: 'zh-TW' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    server: {
      proxy: {
        '/api': 'http://localhost:10005',
      },
    },
  },
  features: {
    inlineStyles: false,
  },
  nitro: {
    prerender: {
      routes: ['/'],
      ignore: ['/api'],
    },
  },
});
