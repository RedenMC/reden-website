<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import RedStoneSection from '@/components/RedStoneSection.vue';
import RedstoneSectionTitle from '@/components/RedstoneSectionTitle.vue';
import Feature from '@/views/Feature.vue';
import { discordInvite } from '@/constants';

const { t } = useI18n();

const introContent = ref<HTMLElement | null>(null);
document.title = t('reden.title.home') + ' - Reden';
</script>

<template>
  <div class="main-page">
    <div>
      <v-row dense>
        <v-col cols="12" sm="8">
          <v-row dense>
            <v-col cols="4" class="d-flex justify-center align-center">
              <v-img src="/reden_256.png" style="font-size: 75%" />
            </v-col>
            <v-col cols="7" justify="center">
              <v-row class="d-flex justify-center align-center">
                <h1 class="font-weight-bold" style="font-size: 10vw;">Reden</h1>
              </v-row>
              <v-row class="d-flex justify-center" dense>
                  <v-col cols="12" sm="auto">
                    <v-btn
                      class="main-button"
                      prepend-icon="mdi-download"
                      size="large"
                      rounded="rounded"
                      color="white"
                      href="/download"
                    >
                      {{ $t('reden.download') }}
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="auto">
                    <v-btn
                      class="main-button"
                      href="https://github.com/zly2006/reden-is-what-we-made"
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
        <v-col cols="12" sm="4" class="d-flex justify-center align-center">
          <p style="font-size: 150%">{{ $t('reden.description') }}</p>
        </v-col>
      </v-row>
    </div>
  </div>

  <div class="intro-content" ref="introContent">
    <Feature />
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
            href="//github.com/zly2006/reden-is-what-we-made"
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
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 64px;
  height: calc(100vh - 120px);
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 750px) {
    .icon {
      display: none;
    }
  }
}

* {
  touch-action: manipulation;
}

.main-button {
  margin: 6px;
}
</style>
