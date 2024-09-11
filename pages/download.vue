<script setup lang="ts">
import ModrinthFull from '@/plugins/icons/ModrinthFull.vue';
definePageMeta({
  title: 'reden.title.download',
});
</script>

<template>
  <h2 class="content-common">
    {{ $t('reden.download_page.sorry_constructing') }}
    <a href="https://modrinth.com/mod/reden">
      <ModrinthFull style="height: 24px" />
    </a>
  </h2>
</template>

<style scoped></style>
