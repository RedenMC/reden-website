<script setup lang="ts">
import {useAppStore} from "@/store/app";
</script>

<template>
<v-btn
  :href="useAppStore().logined ? '/home' : '/login'"
  icon="mdi-account"
  title="Account"
  />
</template>

<style scoped>

</style>
