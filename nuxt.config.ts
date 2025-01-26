// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from 'vite-plugin-vuetify';
import { createResolver } from '@nuxt/kit';
import transformAssetUrls = vuetify.transformAssetUrls;

const { resolve } = createResolver(import.meta.url);

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxt/content',
    '@nuxtjs/mdc',
    '@nuxtjs/color-mode',
    '@ant-design-vue/nuxt',
    '@vite-pwa/nuxt',
    // cause OOM
    // '@nuxthq/studio',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
  ],
  content: {
    // cause OOM
    // documentDriven: true,
    highlight: {
      theme: {
        dark: 'github-dark',
        default: 'github-light',
      },
      preload: [
        'json',
        'js',
        'ts',
        'html',
        'css',
        'vue',
        'diff',
        'shell',
        'markdown',
        'yaml',
        'bash',
        'ini',
      ],
    },
    navigation: {
      fields: ['icon', 'titleTemplate', 'header', 'main', 'aside', 'footer'],
    },
    api: {
      baseURL: '/_my_content',
    },
  },
  colorMode: {
    classSuffix: '',
    dataValue: 'theme',
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
      { code: 'ru', language: 'ru' },
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
    // server: {
    //   proxy: {
    //     '/api': 'https://api.redenmc.com/api/**',
    //     '/ws': {
    //       target: 'ws://localhost:10005',
    //       ws: true,
    //       rewriteWsOrigin: true,
    //     },
    //   },
    // },
  },
  features: {
    inlineStyles: false,
  },
  experimental: {
    inlineRouteRules: true,
  },
  // typescript: {
  //   includeWorkspace: true,
  // },
  nitro: {
    prerender: {
      failOnError: false,
      routes: [
        '/',
        '/sitemap.xml',
        // '/opensearch.xml'
      ],
      ignore: [
        '/api',
        '/__pinceau_tokens_config.json',
        '/__pinceau_tokens_schema.json',
      ],
    },
  },
  routeRules: {
    // '/api/search': {
    //   prerender: true,
    //   cache: {},
    // },
    '/api/**': {
      proxy:
        process.env.NODE_ENV === 'development'
          ? 'https://api.redenmc.com/api/**'
          : 'http://localhost:10005/api/**',
    },
  },
  sitemap: {
    exclude: ['/secret/**', '/admin/**', '/api/**'],
    urls: async () => {
      const backendData: string[] = await (
        await fetch(
          'https://api.redenmc.com/api/mc-services/yisibite/all-internal',
        )
      ).json();
      return backendData.map((id) => ({
        loc: `/litematica/${id}`,
        _i18nTransform: true,
      }));
    },
  },
  devServer: {
    host: '0.0.0.0',
  },
  site: {
    url: 'redenmc.com',
  },
  pwa: {
    registerType: 'autoUpdate',
    devOptions: {
      // https://github.com/vite-pwa/nuxt/issues/77
      enabled: false,
    },
    manifest: {
      name: 'Reden',
      short_name: 'Reden',
      icons: [
        {
          src: '/reden_256.png',
          purpose: 'any maskable',
          sizes: '256x256',
        },
      ],
      theme_color: '#ffffff',
    },
  },
});
