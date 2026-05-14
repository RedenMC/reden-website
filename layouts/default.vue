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
import NotificationDrawer from '~/components/notification/NotificationDrawer.vue';

import { useI18n } from 'vue-i18n';
import { useMessageStore } from '~/store/message';

const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();

const { t, locale } = useI18n();

const theme = useTheme();
const appStore = useAppStore();
const messageStore = useMessageStore();

watch(globalTheme, () => {
  console.log('[layouts/default] theme changed', appStore.theme);
  if (import.meta.client) {
    document.body.style.backgroundColor =
      theme.themes.value[appStore.theme]!.colors.background;
  }
});
const zhCNLanguageNoti = ref(false);
onMounted(() => {
  appStore
    .isInChina()
    .then(
      (result) =>
        (zhCNLanguageNoti.value =
          locale.value !== 'zh_cn' && (result ?? false)),
    );
  const colors: Record<string, string> =
    theme.themes.value[appStore.theme]!.colors;
  const css: string[] = [];
  let themeText = `[onMounted layouts/default] theme: ${theme.name.value} app: ${appStore.theme}\n`;
  //todo: 亮色主题废了，日后修复
  // globalTheme.value = appStore.theme;
  for (const key in colors) {
    themeText += `%c ${key} %c${colors[key]}`;
    css.push('color:unset;');
    css.push(`background:${colors[key]}`);
  }
  console.log(themeText, ...css);

  if (appStore.logined) {
    messageStore.startPolling();
  }
});

watch(
  () => appStore.logined,
  (val) => {
    if (val) {
      messageStore.startPolling();
    } else {
      messageStore.stopPolling();
    }
  },
);

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
  seo: {
    canonicalQueries: ['page', 'q'],
  },
});
</script>

<template>
  <Html :lang="localeHead?.htmlAttrs?.lang">
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
    <v-dialog
      #default="{ isActive }"
      :model-value="zhCNLanguageNoti"
      max-width="600"
      @close="zhCNLanguageNoti = false"
    >
      <v-card>
        <v-card-title>切换到您常用的语言</v-card-title>
        <v-card-text>
          您现在的IP地址是中国大陆的地址，我们检测到您的浏览器语言设置为
          <b>{{ t(locale) }}</b>
          ，是否切换到简体中文？
        </v-card-text>
        <v-card-actions>
          <v-btn @click="zhCNLanguageNoti = false">不切换</v-btn>
          <v-btn
            :to="switchLocalePath('zh_cn')"
            color="primary"
            @click="zhCNLanguageNoti = false"
          >
            切换
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-main class="router" style="--v-layout-top: 64px">
      <slot />
    </v-main>

    <NotificationDrawer />
    <layout-footer />
  </v-app>
</template>
