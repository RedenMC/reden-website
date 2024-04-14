<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '@/store/app';
import RedStoneSection from '@/components/RedStoneSection.vue';
import RedstoneSectionTitle from '@/components/RedstoneSectionTitle.vue';
import Feature from '@/views/Feature.vue';
import { discordInvite, githubLink } from '@/constants';

const { t } = useI18n();

const light = ref(useAppStore().theme === 'light');
const introContent = ref<HTMLElement | null>(null);
document.title = t('reden.title.home') + ' - Reden';

watch(() => useAppStore().theme, (newValue) => {
  light.value = newValue === 'light';
});
</script>

<template>
  <div class="main-page">
    <div>
      <v-row no-gutters>
        <v-col cols="12" md="8">
          <v-row no-gutters>
            <v-col cols="6" sm="4" class="d-flex justify-center align-center">
              <v-img src="/Reden.png" style="image-rendering: pixelated;" />
            </v-col>
            <v-col cols="6" sm="8" justify="center">
              <v-row class="d-flex justify-center align-center">
                <h1 class="font-weight-bold" style="font-size: 12vw; z-index: 5;">Reden</h1>
              </v-row>
              <v-row class="d-flex justify-center" no-gutters>
                <v-col cols="12" sm="auto">
                  <v-btn
                    class="main-button"
                    prepend-icon="mdi-download"
                    size="large"
                    rounded="rounded"
                    :color="light ? 'black' : 'white'"
                    href="/download"
                  >
                    {{ $t('reden.download') }}
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="auto">
                  <v-btn
                    class="main-button"
                    :href="githubLink"
                    prepend-icon="mdi-github"
                    size="large"
                    rounded="rounded"
                    variant="outlined"
                  >
                    Github
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="auto">
                  <v-btn
                    class="main-button"
                    href="//wiki.redenmc.com"
                    prepend-icon="mdi-book-open"
                    size="large"
                    rounded="rounded"
                    variant="outlined"
                  >
                    {{ $t('reden.wiki') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-center align-center" style="z-index: 5;">
          <p style="font-size: 150%">{{ $t('reden.description') }}</p>
        </v-col>
      </v-row>
    </div>
  </div>
  <div style="display: flex; justify-content: center;">
    <div class="intro-content" style="max-width: 1500px;" ref="introContent">
      <Feature />
    </div>
  </div>
  <div class="intro-content" ref="introContent">
    <div class="community-intro content-common">
      <RedstoneSectionTitle :title="$t('reden.home.community_intro.title')" />
      <RedStoneSection :size="3">
        <template #title> Open Source </template>
        <template #text>
          <p>
            {{ $t('reden.home.community_intro.open_source') }}
          </p>
        </template>
        <template #action>
          <v-btn
            :href="githubLink"
            color="primary"
            variant="outlined"
            rounded="rounded"
            class="main-button"
          >
            Github
          </v-btn>
        </template>
      </RedStoneSection>
      <RedStoneSection :size="3">
        <template #title> Sponsors </template>
        <template #text>
          <p>
            {{ $t('reden.home.community_intro.sponsor') }}
          </p>
        </template>
        <template #action>
          <v-btn
            href="/sponsors"
            color="primary"
            variant="outlined"
            rounded="rounded"
            class="main-button"
          >
            Sponsors
          </v-btn>
        </template>
      </RedStoneSection>
      <RedStoneSection :size="3">
        <template #title> Wiki </template>
        <template #text>
          <p>
            {{ $t('reden.home.community_intro.wiki') }}
          </p>
        </template>
        <template #action>
          <v-btn
            href="//wiki.redenmc.com"
            color="primary"
            variant="outlined"
            rounded="rounded"
            class="main-button"
          >
            Wiki
          </v-btn>
        </template>
      </RedStoneSection>
      <RedStoneSection :size="3">
        <template #title> Discord </template>
        <template #text>
          <p>
            {{ $t('reden.home.community_intro.discord') }}
          </p>
        </template>
        <template #action>
          <v-btn
            :href="discordInvite"
            color="primary"
            variant="outlined"
            rounded="rounded"
            class="main-button"
          >
            Discord
          </v-btn>
        </template>
      </RedStoneSection>
    </div>
  </div>
</template>

<style scoped>
body {
  --side-padding: 16px;
}

.main-page {
  margin-left: 2%;
  margin-right: 2%;
  margin-bottom: 64px;
  height: calc(100vh - 100px);
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

* {
  touch-action: manipulation;
}

.main-button {
  margin: 6px;
}
</style>
