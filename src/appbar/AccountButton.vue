<script lang="ts" setup>
import { useAppStore } from '@/store/app';
import RedenRouter from '@/router/RedenRouter.vue';
</script>

<template>
  <reden-router :to="useAppStore().logined ? '/home' : '/login'">
    <v-btn icon="mdi-account" title="Account"> </v-btn>
  </reden-router>
</template>

<style scoped></style>
