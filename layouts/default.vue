<script lang="ts" setup>
import '@mdi/font/css/materialdesignicons.css';
import { VSonner } from 'vuetify-sonner';
import { onMounted, ref } from 'vue';
import { useTheme } from 'vuetify';
import { useAppStore } from '~/store/app';
import '@/assets/main.css';
import { globalTheme } from '@/utils/constants';
import LayoutHeader from '~/components/layout/Header.vue';
import LayoutFooter from '~/components/layout/footer.vue';
import NotificationDrawer from "~//components/homePage/NotificationDrawer.vue";

import { useI18n } from 'vue-i18n';

const localePath = useLocalePath();

const { t } = useI18n();

const theme = useTheme();
const appStore = useAppStore();
watch(globalTheme, () => {
  console.log('[layouts/default] theme changed', appStore.theme);
  if (import.meta.client) {
    document.body.style.backgroundColor =
      theme.themes.value[appStore.theme]!.colors.background;
  }
});
onMounted(() => {
  const colors: Record<string, string> =
    theme.themes.value[appStore.theme]!.colors;
  const css: string[] = [];
  let themeText = `[onMounted layouts/default] theme: ${theme.name.value} app: ${appStore.theme}\n`;
  globalTheme.value = appStore.theme;
  for (const key in colors) {
    themeText += `%c ${key} %c${colors[key]}`;
    css.push('color:unset;');
    css.push(`background:${colors[key]}`);
  }
  console.log(themeText, ...css);
});

function toggleTheme() {
  appStore.theme = appStore.theme === 'light' ? 'dark' : 'light';
  globalTheme.value = appStore.theme;
  if (import.meta.client) {
    document.body.style.backgroundColor =
      theme.themes.value[appStore.theme]!.colors.background;
  }
  appStore.save();
}

const localeHead = useLocaleHead({
  addSeoAttributes: {
    canonicalQueries: ['page', 'q'],
  },
});

</script>

<template>
  <Html :lang="localeHead.htmlAttrs.lang">
    <Head>
      <Meta content="38f365878eac2da0ab1c69a63a130ade" name="monetag" />
      <template v-for="link in localeHead.link" :key="link.hid">
        <Link
          :id="link.hid"
          :href="link.href"
          :hreflang="link.hreflang"
          :rel="link.rel"
        />
      </template>
      <template v-for="meta in localeHead.meta" :key="meta.hid">
        <Meta
          :id="meta.hid"
          :content="meta.content"
          :property="meta.property"
        />
      </template>
    </Head>
  </Html>
  <v-app :theme="globalTheme">
    <layout-header>
      <template #desktop-append>
        <v-btn
          :icon="
            appStore.theme === 'light'
              ? 'mdi-weather-night'
              : 'mdi-weather-sunny'
          "
          title="Toggle Theme"
          @click="toggleTheme"
        />
      </template>
      <template #mobile-menu-append>
        <v-list-item
          :prepend-icon="
            appStore.theme === 'light'
              ? 'mdi-weather-night'
              : 'mdi-weather-sunny'
          "
          @click="toggleTheme"
        >
          <v-list-item-title>
            {{ appStore.theme === 'light' ? 'Light Mode' : 'Dark Mode' }}
          </v-list-item-title>
        </v-list-item>
      </template>
    </layout-header>

    <VSonner :expand="true" :position="'top-right'" />
    <v-main class="router" style="--v-layout-top: 64px">
      <slot />
    </v-main>
    <layout-footer />
    <notification-drawer></notification-drawer>

  </v-app>
</template>

<style scoped>

</style>
