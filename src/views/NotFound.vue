<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const prevPage = (router.currentRoute.value.meta?.prevPage as any) ?? '/';
console.log(prevPage);
</script>

<template>
  <v-empty-state
    headline="Whoops, 404"
    :title="$t('page404.title')"
    height="500px"
  >
    <template #text>
      {{ $t('page404.evolving') }}
      <br />
      <a href="https://github.com/RedenMC/reden-website">
        {{ $t('page404.help') }}
      </a>
    </template>
    <template #actions>
      <v-btn color="primary" @click="router.push(prevPage)">{{
        $t('page404.back')
      }}</v-btn>
    </template>
  </v-empty-state>
</template>

<style scoped></style>
