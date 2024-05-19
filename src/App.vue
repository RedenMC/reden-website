<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useTitle } from '@vueuse/core';

const { t } = useI18n();
const title = useTitle();

useRouter().afterEach((to, from, failure) => {
  console.log('Route changed', to, from, failure);
  title.value = t(to.meta.title as string) + ' - Reden';
});
</script>

<template>
  <router-view />
</template>

<style></style>
