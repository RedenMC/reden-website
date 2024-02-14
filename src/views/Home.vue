<script setup lang="ts">
import {VSonner} from 'vuetify-sonner'
import {ref} from 'vue'
import type {Position as PositionType} from 'vue-sonner/lib/types'
import {useI18n} from 'vue-i18n'
import RedStoneSection from "@/components/RedStoneSection.vue";

const {t} = useI18n()

const position = ref<PositionType>('bottom-center')
const expand = ref(false)
addEventListener('scroll', () => {
  expand.value = window.scrollY > 0;
})
document.title = t('reden.title.home')
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
  <div class="features-intro">
    <RedStoneSection :size="3">
      <template #title>
        Undo
      </template>
      <template #subtitle>
        Undo is
      </template>
      <template #text>
        <p>
          This is Undo
        </p>
        <p>
          Hello, Reden!
        </p>
        <br />
        <br />
        <br />
        <br />
      </template>
      <template #image>
        <video src="@/assets/nether_protal.mp4"
               style="object-fit: scale-down; height:260px"
               autoplay
               loop
               muted
               playsinline
        />
      </template>
    </RedStoneSection>
  </div>
  <div style="height: 400px"/>
  <v-parallax src="https://cdn.vuetifyjs.com/images/parallax/material.jpg">
    <div class="content">
      <h2>Undo</h2>
      <p>
        Reden can quickly undo your actions by just pressing Ctrl+Z. All chain reactions will be undone.
      </p>
      <p>
        Reden can undo:
      </p>
      <p>
        Block changes
        <video/>
      </p>
      <p>
        Block changes with tile entities:
        <video/>
      </p>
      <p>
        TNTs
        <video/>
      </p>
      <p>
        Pistons
        <video/>
      </p>
      <p>
        And even entity changes!
        <video/>
      </p>


      <h2>Reden Debugger</h2>
      <p>
        Pause the game, during a tick
      </p>
      <p>
        See update order visually
      </p>
      <p>
        Breakpoints
      </p>
      <p>
        Step into & step over
      </p>
      <p>
        Tile ticks, block events...
      </p>
      <p>
        Tick phase tree, view all detailed information just by a click
      </p>
    </div>
  </v-parallax>
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

  .buttons {
  }

  @media (max-width: 750px) {
    .icon {
      display: none;
    }
  }
}

* {
  touch-action: manipulation;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 48px;
  margin-top: 96px;
}

.main-button {
  margin: 6px;
}

.features-intro {
  width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

</style>
