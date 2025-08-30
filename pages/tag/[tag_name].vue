<script setup lang="ts">
import { useRoute } from '#vue-router';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '~/store/app';
import { ref } from 'vue';
import type { MachineDef, Tag } from '~/pages/litematica/index.vue';

const route = useRoute();
const router = useRouter();
const tagName = route.params.tag_name as string;
const { t, locale } = useI18n();
const localePath = useLocalePath();
const appStore = useAppStore();

const {
  data: pageData,
  status,
  error,
} = useFetch<{
  tag: Tag;
  posts: MachineDef[];
}>(`/api/mc-services/tags/${tagName}/posts`);
</script>

<template>
  <div v-if="error && status === 'error'" class="text-center">
    <div v-if="error.statusCode === 404">
      <h1 class="text-2xl font-bold">{{ t('tag.not_found') }}</h1>
      <p>{{ t('tag.not_found_description', { tag: tagName }) }}</p>
      <v-btn rounded="lg" :to="localePath('/')" class="mt-4">
        {{ t('common.back_to_home') }}
      </v-btn>
    </div>
  </div>
  <div v-else-if="status === 'success'">
    <div v-if="pageData && pageData.tag" class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-extrabold mb-4">#{{ pageData.tag.name }}</h1>
      <p class="mb-6 text-gray-600 dark:text-gray-400">
        {{ t('tag.tag_associated', { count: pageData.posts.length }) }}
      </p>

      <h2 class="text-3xl font-bold mb-2">
        {{ t('tag.posts_with_tag', { tag: pageData.tag.name }) }}
      </h2>
      <p class="mb-4 text-gray-600 dark:text-gray-400">
        {{ pageData.tag.description }}
      </p>
      <v-divider class="my-4"></v-divider>
      <div v-if="pageData.posts.length > 0" class="space-y-4">
        <div
          v-for="post in pageData.posts"
          :key="post.key"
          class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <h2 class="text-xl font-semibold mb-2">
            <router-link
              :to="localePath(`/litematica/${post.key}`)"
              style="color: initial"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {{ post.name }}
            </router-link>
          </h2>
          <p
            class="text-gray-700 dark:text-gray-300 mb-2"
            style="max-height: 180px"
          >
            {{ post.description }}
          </p>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('litematica_generator.by.author') }}:
            <router-link
              :to="localePath(`/@${post.author?.username}`)"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {{ post.author!.username }}
            </router-link>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-600 dark:text-gray-400">
        {{ t('tag.no_posts_with_tag', { tag: pageData.tag.name }) }}
      </div>
    </div>
    <div v-else class="text-center text-gray-600 dark:text-gray-400">
      {{ t('tag.loading') }}
    </div>
  </div>
</template>

<style scoped></style>
