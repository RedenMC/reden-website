<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useTitle } from '@vueuse/core';
import { computed } from 'vue';

const { t } = useI18n();
const title = useTitle();

useRouter().afterEach((to) => {
  title.value = t(to.meta.title as string) + ' - Reden';
});

const route = useRoute();
const { locale } = useI18n();
let stripedUrl = computed(() => {
  let uel = route.path.trim();
  if (route.params.language) {
    uel = uel.replace((route.params.language as string) + '/', '');
    locale.value = route.params.language as string;
  }
  return uel;
});
console.log('url', stripedUrl.value);
</script>

<template>
  <router-view />
  <div v-show="false" title="search-engine-hint">
    <a :href="`/en${stripedUrl}`">English</a>
    <a :href="`/zh_cn${stripedUrl}`">简体中文</a>
    <a :href="`/zh_tw${stripedUrl}`">繁體中文</a>
  </div>
</template>

<style></style>
