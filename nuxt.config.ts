// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from 'vite-plugin-vuetify';
import transformAssetUrls = vuetify.transformAssetUrls;
import { createProxyServer } from 'httpxy';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
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
        '/ws': {
          target: 'ws://localhost:10005',
          ws: true,
          rewriteWsOrigin: true,
        },
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
      routes: ['/', '/sitemap.xml'],
      ignore: ['/api'],
    },
  },
  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:10005/api/**',
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
