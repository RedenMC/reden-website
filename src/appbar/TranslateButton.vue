<script setup lang="ts">
import { changeLanguage } from '@/constants';
</script>

<template>
  <div class="text-center">
    <v-btn icon="mdi-translate">
      <v-icon icon="mdi-translate" />
      <v-menu :close-on-content-click="true" activator="parent">
        <v-list>
          <v-list-item
            v-for="locale in $i18n.availableLocales"
            :key="`locale-${locale}`"
            @click="changeLanguage(locale)"
            :active="false"
          >
            <v-list-item-title>{{ $t(locale) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn>
  </div>
</template>

<style scoped></style>
