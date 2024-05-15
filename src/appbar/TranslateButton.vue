<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Locale } from '@intlify/core-base';

const { locale } = useI18n();

if (localStorage && !localStorage.getItem('locale')) {
  if (navigator && navigator.language) {
    changeLanguage(navigator.language);
    console.log('Set locale to', navigator.language);
  }
}

function changeLanguage(newLocale: Locale) {
  localStorage.setItem('locale', newLocale);
  locale.value = newLocale;
}
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
          >
            <v-list-item-title>{{ $t(locale) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn>
  </div>
</template>

<style scoped></style>
