<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useTitle } from '@vueuse/core';

const { t } = useI18n();
const title = useTitle();

useRouter().afterEach((to) => {
  title.value = t(to.meta.title as string) + ' - Reden';
});
</script>

<template>
  <router-view />
  <div v-show="false" title="search-engine-hint">
    <a href="?lang=en">English</a>
    <a href="?lang=zh_CN">简体中文</a>
    <a href="?lang=zh_TW">繁體中文</a>
  </div>
</template>

<style></style>
