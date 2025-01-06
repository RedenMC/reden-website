<script lang="ts" setup>
import type { I18nHeadMetaInfo } from '@nuxtjs/i18n';
import { useTheme } from 'vuetify';

const theme = useTheme();
const currentTheme = computed(() => theme.current.value);
const i18nHead: Ref<I18nHeadMetaInfo> = useLocaleHead({
  seo: { canonicalQueries: [''] },
});
watch(i18nHead, (value) => {
  console.log('i18nHead', value);
});
</script>

<template>
  <Html :lang="i18nHead.htmlAttrs?.lang">
    <Head>
      <template v-for="link in i18nHead.link" :key="link.hid">
        <Link
          :id="link.hid"
          :href="link.href"
          :hreflang="link.hreflang"
          :rel="link.rel"
        />
      </template>
      <template v-for="meta in i18nHead.meta" :key="meta.hid">
        <Meta
          :id="meta.hid"
          :content="meta.content"
          :property="meta.property"
        />
      </template>
    </Head>
    <Body :style="`background-color: ${currentTheme.colors.background}`" />
  </Html>
</template>

<style scoped></style>
