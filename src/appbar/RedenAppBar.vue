<script setup lang="ts">
import SearchButton from './SearchButton.vue'
import TranslateButton from "./TranslateButton.vue";
</script>

<script lang="ts">
export default {
  name: 'RedenAppBar',
  data: () => {
  },
}
</script>

<template>
  <v-app-bar :elevation="2">
    <template #prepend>
      <v-menu
        class="mobile-show"
        :close-on-content-click="true"
      >
        <template #activator="{ props }">
          <v-btn class="mobile-show" icon="mdi-menu" title="Menu" v-bind="props"/>
        </template>

        <v-list>
          <v-list-item
            :link="true"
            v-for="(k) in [1, 2, 3]"
            :key="`locale-${k}`"
            :min-width="200"
          >
            <v-list-item-title>
              {{ k }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn class="mobile-hide" icon="mdi-home" title="Home" href="/"/>
    </template>
    <p class="text-h5 mobile-hide">REDEN</p>
    <template #append>
      <v-btn class="mobile-hide" icon="mdi-github" title="Github"
             href="https://github.com/zly2006/reden-is-what-we-made"/>
      <v-btn class="mobile-hide" icon="custom:DiscordIcon" title="Discord" href="https://discord.gg/fCxmEyFgAd"/>
      <TranslateButton/>
      <SearchButton/>
    </template>
  </v-app-bar>
</template>

<style scoped>
@media (max-width: 500px) {
  .mobile-hide {
    display: none;
  }
}

@media (min-width: 500px) {
  .mobile-show {
    display: none;
  }
}

</style>
