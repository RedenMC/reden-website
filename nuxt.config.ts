// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from 'vite-plugin-vuetify';
import { createResolver } from '@nuxt/kit';
import transformAssetUrls = vuetify.transformAssetUrls;
import { $fetch } from 'ofetch';

const { resolve } = createResolver(import.meta.url);

let isPrerender = false;
if (
  process.argv.find((arg) => arg.includes('/nuxi')) &&
  (process.argv.includes('build') || process.argv.includes('generate')) // nuxi build command
) {
  isPrerender = true;
  console.log('\x1b[32m😭 Pre-rendering');
}

const isProd = process.env.REDEN_APP_ENV === 'production';
const useRemoteBackend =
  process.env.REMOTE === 'true'
    ? true
    : process.env.REMOTE === 'false'
      ? false
      : !isProd && !isPrerender;
console.log('useRemoteBackend=', useRemoteBackend);
const isDev = process.env.DEV === 'true';
const sitemap = await (
  await fetch('https://api.redenmc.com/api/mc-services/yisibite/nuxt-sitemap')
).json();

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  typescript: {
    shim: false,
    strict: true,
    tsConfig: {
      compilerOptions: {
        jsx: 'preserve',
        jsxFactory: 'h',
        jsxFragmentFactory: 'Fragment',
      },
    },
  },
  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxt/content',
    '@nuxtjs/mdc',
    '@nuxtjs/color-mode',
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
    bundle: {
      optimizeTranslationDirective: false,
    },
    baseUrl: 'https://redenmc.com',
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    server: {
      proxy: {
        '/api': isDev
          ? 'http://localhost:10005'
          : useRemoteBackend
            ? 'https://api.redenmc.com'
            : 'http://api:10005',
      },
    },
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
        // '/sitemap.xml',
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
    '/**': {
      swr: 60 * 5, // 5 minutes
      cache: {
        maxAge: 60 * 60 * 24, // 1 day
      },
    },
    '/api/**': {
      proxy: isDev
        ? 'http://localhost:10005/api/**'
        : useRemoteBackend
          ? 'https://api.redenmc.com/api/**'
          : 'http://api:10005/api/**',
    },
  },
  sitemap: {
    exclude: ['/secret/**', '/admin/**', '/api/**'],
    urls() {
      return sitemap;
    },
    sources: ['https://api.redenmc.com/api/mc-services/yisibite/nuxt-sitemap'],
  },
  devServer: {
    host: '0.0.0.0',
  },
  site: {
    url: 'redenmc.com',
  },
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in', // default
    },
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
