<script lang="ts" setup>
import type { NuxtError } from '#app';
import { useRouter } from 'vue-router';

const router = useRouter();
const prevPage = (router.currentRoute.value.meta?.prevPage as any) ?? '/';

const props = defineProps({
  error: Object as () => NuxtError,
});
console.log('[error] err=', props.error, 'prevPage=', prevPage);
const { t } = useI18n();
useHead({
  title: t(
    props.error?.statusCode === 4044
      ? 'reden.title.404'
      : `Error ${props.error?.statusCode}`,
  ),
  titleTemplate: '%s - Reden',
});
</script>

<template>
  <NuxtLayout>
    <v-empty-state
      v-if="error?.statusCode === 404"
      :max-width="1000"
      :title="t('page404.title')"
      class="mx-auto"
      headline="Whoops, 404"
    >
      <template #text>
        {{ t('page404.evolving') }}
        <br />
        <a href="https://github.com/RedenMC/reden-website">
          {{ t('page404.help') }}
        </a>
      </template>
      <template #actions>
        <v-btn color="primary" @click="router.push(prevPage)"
          >{{ t('page404.back') }}
        </v-btn>
      </template>
    </v-empty-state>
    <v-empty-state
      v-else
      :headline="String(error?.statusCode)"
      :title="'如果你看到了这个页面，请加QQ群截图反馈：708842363，谢谢！' + error?.message"
      height="500px"
    >
      <template #text>
        <component v-html="error?.stack" />
        <br />
        <a href="https://github.com/RedenMC/reden-website">
          {{ t('page404.help') }}
        </a>
      </template>
      <template #actions>
        <v-btn color="primary" @click="router.push(prevPage)">
          {{ t('page404.back') }}
        </v-btn>
      </template>
    </v-empty-state>
  </NuxtLayout>
</template>

<style scoped>
.v-empty-state__text {
  white-space: pre-wrap;
}
</style>
