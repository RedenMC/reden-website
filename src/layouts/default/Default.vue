<template>
  <v-app theme="dark">
    <RedenAppBar />

    <default-view />
  </v-app>
</template>

<script lang="ts" setup>
import DefaultView from './View.vue'
  import RedenAppBar from "@/appbar/RedenAppBar.vue";
</script>
