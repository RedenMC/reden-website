<script lang="ts" setup>
import type { NuxtError } from '#app';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

const router = useRouter();
const prevPage = (router.currentRoute.value.meta?.prevPage as any) ?? '/';

const props = defineProps({
  error: Object as () => NuxtError,
});
console.log('error', props.error);
console.log('prevPage', prevPage);
const { t } = useI18n();
definePageMeta({
  title:
    props.error?.statusCode === 4044
      ? t('reden.title.404')
      : `Error ${props.error?.statusCode}`,
});

const { width } = useDisplay();
</script>

<template>
  <NuxtLayout>
    <v-empty-state
      v-if="error?.statusCode === 404"
      :text-width="Math.min(width, 1000)"
      :title="$t('page404.title')"
      headline="Whoops, 404"
      width="1000"
    >
      <template #text>
        {{ $t('page404.evolving') }}
        <br />
        <a href="https://github.com/RedenMC/reden-website">
          {{ $t('page404.help') }}
        </a>
      </template>
      <template #actions>
        <v-btn color="primary" @click="router.push(prevPage)"
          >{{ $t('page404.back') }}
        </v-btn>
      </template>
    </v-empty-state>
    <v-empty-state
      v-else
      :headline="String(error?.statusCode)"
      :title="error?.message"
      text-width="1000"
      width="1000"
    >
      <template #text>
        <pre
          class="mx-auto"
          style="max-width: max-content"
          v-html="error?.stack"
        />
        <br />
        <a href="https://github.com/RedenMC/reden-website">
          {{ $t('page404.help') }}
        </a>
      </template>
      <template #actions>
        <v-btn color="primary" @click="router.push(prevPage)">
          {{ $t('page404.back') }}
        </v-btn>
      </template>
    </v-empty-state>
  </NuxtLayout>
</template>

<style scoped>
/*noinspection CssUnusedSymbol*/
:deep(.stack) {
  text-align: start;
  text-align-last: start;
  width: 500px;
  word-break: break-word;
  white-space: pre-wrap !important;
}
</style>
