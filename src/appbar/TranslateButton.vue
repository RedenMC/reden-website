<script lang="ts">
import { useI18n } from 'vue-i18n'
import {Locale} from "@intlify/core-base";

export default {
  name: 'TranslateButton',
  data() {
    const t = useI18n()
    return {
      t,
    }
  },
  methods: {
    changeLanguage(locale: Locale) {
      localStorage.setItem('locale', locale)
      this.$i18n.locale = locale
    },
  },
}
</script>

<template>
  <div class="text-center">
    <v-menu
      :close-on-content-click="true"
    >
      <template #activator="{ props }">
        <v-btn icon="mdi-translate" v-bind="props" />
      </template>

      <v-list>
        <v-list-item
          v-for="(locale) in $i18n.availableLocales"
          :key="`locale-${locale}`"
          @click="changeLanguage(locale)"
        >
          <v-list-item-title>{{ $t(locale) }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<style scoped>

</style>
