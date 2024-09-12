<script setup lang="ts">
import ModrinthFull from '@/plugins/icons/ModrinthFull.vue';
definePageMeta({
  title: 'reden.title.download',
});
</script>

<template>
  <div class="content-common">
    <h1>
      {{ $t('reden.title.download') }}
      Reden
    </h1>
    <p>
      {{ $t('reden.download_page.sorry_constructing') }}
      <a href="https://modrinth.com/mod/reden">
        <ModrinthFull class="router" style="height: 24px" />
      </a>
    </p>
    <h2>
      {{ $t('also_try_our_other_online_services:') }}
    </h2>
    <reden-router to="/litematica">
      {{ $t('litematica_generator.title') }}
    </reden-router>
    - {{ $t('litematica_generator.description') }}
  </div>
</template>

<style scoped>
p {
  font-size: 1.3em;
}
</style>
