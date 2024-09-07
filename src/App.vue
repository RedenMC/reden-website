<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { locale } = useI18n();
const route = useRoute();
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
  <metainfo> </metainfo>
  <router-view />
  <div v-show="false" title="search-engine-hint">
    <a :href="`/en${stripedUrl}`">English</a>
    <a :href="`/zh_cn${stripedUrl}`">简体中文</a>
    <a :href="`/zh_tw${stripedUrl}`">繁體中文</a>
  </div>
</template>

<style></style>
