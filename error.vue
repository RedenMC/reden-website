<script setup lang="ts">
import type { NuxtError } from '#app';
import { useRouter } from 'vue-router';

const router = useRouter();
const prevPage = (router.currentRoute.value.meta?.prevPage as any) ?? '/';

const props = defineProps({
  error: Object as () => NuxtError,
});
console.log('error', props.error);
console.log('prevPage', prevPage);
</script>

<template>
  <NuxtLayout>
    <v-empty-state
      v-if="error?.statusCode === 404"
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
    <v-empty-state
      v-else
      :headline="String(error?.statusCode)"
      :title="error?.message"
      height="500px"
    >
      <template #text>
        <component v-html="error?.stack" />
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
  </NuxtLayout>
</template>
