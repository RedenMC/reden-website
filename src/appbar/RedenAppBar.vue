<script setup>
import SearchButton from './SearchButton.vue'
import TranslateButton from "./TranslateButton.vue";
</script>

<script>
export default {
  name: 'RedenAppBar',
  data() {
    return {
      onClick: (url) => {
        location.href = url
      },
    }
  },
}
</script>

<template>
  <v-app-bar :elevation="2">
    <template #prepend>
      <v-btn icon="mdi-menu" title="Menu" />
<v-btn icon="mdi-home" title="Home" @click="onClick('/')" />
    </template>
      <p class="text-h5">REDEN</p>
    <template #append>
      <v-btn icon="mdi-github" title="Github" href="https://github.com/zly2006/reden-is-what-we-made" />
      <v-btn icon="custom:discordIcon" title="Discord" href="https://discord.gg/fCxmEyFgAd" />
      <TranslateButton />
      <SearchButton />
    </template>
  </v-app-bar>
</template>

<style scoped>

</style>
