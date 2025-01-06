// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from 'vite-plugin-vuetify';
import transformAssetUrls = vuetify.transformAssetUrls;

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  extends: '@nuxt-themes/docus',
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxt/content',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
  ],
  content: {
    experimental: {
      search: {
        indexed: true,
      },
    },
    api: {
      baseURL: '/_my_content',
    },
    markdown: {
      toc: {
        depth: 3,
        searchDepth: 2,
      },
    },
  },
  i18n: {
    strategy: 'prefix_and_default',
    vueI18n: './i18n.config.ts',
    defaultLocale: 'en',
    lazy: true,
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
    baseUrl: 'https://redenmc.com',
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  features: {
    inlineStyles: false,
  },
  experimental: {
    inlineRouteRules: true,
  },
  nitro: {
    prerender: {
      failOnError: false,
      routes: ['/', '/sitemap.xml'],
      ignore: ['/api'],
    },
  },
  routeRules: {
    '/api/**': {
      proxy:
        process.env.NODE_ENV === 'development'
          ? 'https://api.redenmc.com/api/**'
          : 'http://localhost:10005/api/**',
    },
  },
  sitemap: {
    exclude: ['/secret/**', '/admin/**', '/api/**'],
  },
  devServer: {
    host: '0.0.0.0',
  },
  site: {
    url: 'redenmc.com',
  },
});
