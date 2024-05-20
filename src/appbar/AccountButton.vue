<script lang="ts" setup>
import { useAppStore } from '@/store/app';
</script>

<template>
  <v-btn
    :to="useAppStore().logined ? '/home' : '/login'"
    icon="mdi-account"
    title="Account"
  />
</template>

<style scoped></style>
