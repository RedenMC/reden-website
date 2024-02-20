<script setup lang="ts">
import {VSonner} from 'vuetify-sonner'
import {ref} from 'vue'
import type {Position as PositionType} from 'vue-sonner/lib/types'
import {useI18n} from 'vue-i18n'
import RedStoneSection from "@/components/RedStoneSection.vue";
import RedstoneSectionTitle from "@/components/RedstoneSectionTitle.vue";
import Feature from "@/views/Feature.vue";
import {discordInvite} from "@/constants";

const {t} = useI18n()

const position = ref<PositionType>('bottom-center')
const expand = ref(false)
const introContent = ref<HTMLElement | null>(null)
document.title = t('reden.title.home') + ' - Reden'
</script>

<template>
  <VSonner :position="position" :expand="expand"/>
  <div class="main-page">
    <div>
      <v-row>
        <v-col>
          <h1 class="text-h2 font-weight-bold">
            Reden
          </h1>
          <p style="font-size: larger">
            {{ t('reden.description') }}
          </p>
        </v-col>
        <v-col cols="3" class="icon">
          <v-img src="/reden_256.png" width="148"/>
        </v-col>
      </v-row>
      <div class="buttons">
        <v-btn class="main-button" prepend-icon="mdi-download" size="x-large" rounded="rounded" color="primary"
               href="/download">
          {{ t('reden.download') }}
        </v-btn>
        <v-btn
          class="main-button"
          href="https://github.com/zly2006/reden-is-what-we-made"
          prepend-icon="mdi-github"
          size="x-large"
          rounded="rounded"
          variant="outlined"
        >
          Github
        </v-btn>
        <v-btn
          class="main-button"
          href="//wiki.redenmc.com"
          prepend-icon="mdi-book-open"
          size="x-large"
          rounded="rounded"
          variant="outlined"
        >
          {{ t('reden.wiki') }}
        </v-btn>
      </div>
    </div>
  </div>

  <div class="intro-content" ref="introContent">
    <Feature/>
    <div class="community-intro content-common">
      <RedstoneSectionTitle :title="$t('reden.home.community_intro.title')"/>
      <RedStoneSection
        :size="3">
        <template #title>
          Open Source
        </template>
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
      <RedStoneSection
        :size="3">
        <template #title>
          RVC Hub
        </template>
        <template #text>
          <p>
            {{ $t('reden.home.community_intro.rvchub') }}
          </p>
        </template>
        <template #action>
          <v-btn
            href="//hub.redenmc.com"
            color="primary"
            variant="outlined"
            rounded="rounded"
            class="main-button"
          >
            RVC Hub
          </v-btn>
        </template>
      </RedStoneSection>
      <RedStoneSection
        :size="3">
        <template #title>
          Sponsors
        </template>
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
      <RedStoneSection
        :size="3">
        <template #title>
          Wiki
        </template>
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
      <RedStoneSection
        :size="3">
        <template #title>
          Discord
        </template>
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
  max-width: 800px;
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
