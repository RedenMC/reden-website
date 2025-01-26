<script lang="ts" setup>
import '@mdi/font/css/materialdesignicons.css';
import { VSonner } from 'vuetify-sonner';
import { onMounted } from 'vue';
import { useTheme } from 'vuetify';
import { useAppStore } from '~/store/app';
import '@/assets/main.css';
import LayoutHeader from '~/components/layout/Header.vue';
import LayoutFooter from '~/components/layout/footer.vue';

const themeCookie = useCookie<'light' | 'dark'>('theme', {
  default: () => 'light',
  maxAge: 60 * 60 * 24 * 90,
  sameSite: 'strict',
});

const theme = useTheme();
const appStore = useAppStore();
onMounted(() => {
  const colors: Record<string, string> =
    theme.themes.value[themeCookie.value]!.colors;
  const css: string[] = [];
  let themeText = `theme: ${theme.name.value} cookie: ${themeCookie.value}\n`;
  for (const key in colors) {
    themeText += `%c ${key} %c${colors[key]}`;
    css.push('color:unset;');
    css.push(`background:${colors[key]}`);
  }
  console.log(themeText, ...css);
  // hack
  const fix = (ele: Element) => {
    if (themeCookie.value === 'dark') {
      if (ele.classList.contains('v-theme--light')) {
        console.log('hack: remove light', ele);
        ele.classList.remove('v-theme--light');
        ele.classList.add('v-theme--dark');
      }
    } else if (themeCookie.value === 'light') {
      if (ele.classList.contains('v-theme--dark')) {
        console.log('hack: remove dark', ele);
        ele.classList.remove('v-theme--dark');
        ele.classList.add('v-theme--light');
      }
    }
  };
  // fix hydration error
  for (const ele of document.getElementsByClassName('v-theme--light')) {
    fix(ele);
  }
  for (const ele of document.getElementsByClassName('v-theme--dark')) {
    fix(ele);
  }
});
onPrehydrate(() => {
  const background: Record<string, string> = {
    dark: '#121212',
    light: '#ffffff',
  };
  const themeCookie =
    document.cookie
      ?.split(';')
      ?.find((cookie) => cookie.includes('theme='))
      ?.replace('theme=', '')
      ?.replace(' ', '') || 'light';
  console.log('onPreHydrate', document.cookie, themeCookie);
  // set body background color
  document.body.style.backgroundColor = background[themeCookie];
});

function toggleTheme() {
  themeCookie.value = themeCookie.value === 'light' ? 'dark' : 'light';
  if (import.meta.client) {
    document.body.style.backgroundColor =
      theme.themes.value[themeCookie.value]!.colors.background;
  }
  appStore.save();
}

const localeHead = useLocaleHead({
  addSeoAttributes: {
    canonicalQueries: ['page'],
  },
});
</script>

<template>
  <Html :lang="localeHead.htmlAttrs.lang">
    <Head>
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
  <v-app :theme="themeCookie">
    <layout-header>
      <template #desktop-append>
        <v-btn
          :icon="
            themeCookie === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'
          "
          title="Toggle Theme"
          @click="toggleTheme"
        />
      </template>
      <template #mobile-menu-append>
        <v-list-item
          :prepend-icon="
            themeCookie === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'
          "
          @click="toggleTheme"
        >
          <v-list-item-title>
            {{ themeCookie === 'light' ? 'Light Mode' : 'Dark Mode' }}
          </v-list-item-title>
        </v-list-item>
      </template>
    </layout-header>

    <VSonner :expand="true" :position="'top-right'" />
    <v-main class="router" style="--v-layout-top: 64px">
      <slot />
    </v-main>

    <layout-footer />
  </v-app>
</template>
