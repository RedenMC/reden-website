<script setup lang="ts">
import { useAppStore } from '~/store/app';
import { useI18n } from 'vue-i18n';

definePageMeta({
  needLogin: true,
});

const appStore = useAppStore();
const { t } = useI18n();

useHead({
  title: t('achievements.title'),
  titleTemplate: '%s - Reden',
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-4">
          <v-icon size="large" class="mr-2">mdi-trophy</v-icon>
          {{ $t('achievements.title') }}
        </h1>
      </v-col>
      <v-col cols="12">
        <profile-achievements-panel :user-id="appStore.uid" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
h1 {
  display: flex;
  align-items: center;
}
</style>
