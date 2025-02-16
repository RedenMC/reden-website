<script lang="ts" setup>
import { type MachineDef } from '~/pages/litematica/index.vue';

const props = defineProps<{
  post: MachineDef;
}>();
const { t } = useI18n();

const localePath = useLocalePath();
</script>

<template>
  <v-card
    :to="localePath(`/litematica/${post.key}`)"
    class="transition-transform duration-300 hover:scale-105 bg-background shadow-md hover:shadow-lg overflow-hidden rounded-none"
  >
    <div
      :style="{ backgroundImage: `url(${post.thumbnailUrl})` }"
      class="relative w-full h-[200px] bg-cover bg-center"
    >
      <div class="absolute inset-0 backdrop-blur-sm">
        <v-img :aspect-ratio="16 / 9" :src="post.thumbnailUrl" />
      </div>
    </div>
    <div class="p-2">
      <v-card-title class="text-lg font-semibold text-on-background mb-2"
        >{{ post.name }}
      </v-card-title>
      <v-card-subtitle
        class="text-sm font-bold text-on-background flex items-center gap-2"
      >
        {{ t('litematica_generator.by.author') }}:
        <span
          ><v-avatar :image="post.author?.avatarUrl" size="x-small"></v-avatar
        ></span>
        <span>{{ post.author?.username }}</span>
      </v-card-subtitle>
      <v-card-subtitle class="text-sm font-bold text-on-background">
        {{ t('reden.card.downloads') }}:
        <v-chip
          class="ml-1"
          color="blue lighten-4"
          label
          text-color="blue darken-2"
          x-small
        >
          {{ post.downloads }}
        </v-chip>
      </v-card-subtitle>
    </div>
  </v-card>
</template>
