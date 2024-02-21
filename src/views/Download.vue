<script setup lang="ts">
import ModrinthFull from '@/plugins/icons/ModrinthFull.vue';
</script>

<template>
  <h2>
    {{ $t('reden.download_page.sorry_constructing') }}
    <a href="https://modrinth.com/mod/reden">
      <ModrinthFull style="height: 24px" />
    </a>
  </h2>
</template>

<style scoped>
.body {
  align-content: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  margin: auto;
  padding: initial;
}

.main-card {
  width: max-content;
}
</style>
