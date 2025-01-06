<script lang="ts" setup>
import { VSonner } from 'vuetify-sonner';
import { useAppStore } from '~/store/app';
import '@/assets/main.css';

const appStore = useAppStore();
</script>

<template>
  <layout-i18n-head-attr />
  <v-app :theme="appStore.theme">
    <layout-header />
    <VSonner :expand="true" :position="'top-right'" />
    <slot name="sidebars" />
    <v-main class="router">
      <slot />
    </v-main>
    <layout-footer />
  </v-app>
</template>

<style scoped></style>
