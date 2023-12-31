<script setup lang="ts">
import {VSonner} from 'vuetify-sonner'
import {ref} from 'vue'
import type {Position as PositionType} from 'vue-sonner/lib/types'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

const position = ref<PositionType>('bottom-center')
const expand = ref(false)
addEventListener('scroll', () => {
  expand.value = window.scrollY > 0;
})
document.title = t('reden.title.home', [' | Reden'])
</script>

<template>
  <VSonner :position="position" :expand="expand"/>
  <div class="main-page">
    <v-row align-content="center">
      <v-col cols="9">
        <h1 class="text-h2 font-weight-bold">
          Reden Mod
        </h1>
        <p style="font-size: larger">
          {{ t('reden.description') }}
        </p>
      </v-col>
      <v-col cols="3">
        <v-img src="/reden_256.png" width="148"/>
      </v-col>
    </v-row>
    <v-row>
      <v-btn class="main-button" prepend-icon="mdi-download" size="x-large" rounded="rounded" color="primary"
             href="#download">
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
    </v-row>
  </div>
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
        <video />
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

<style>
body {
  --side-padding: 16px;
}

.main-page {
  max-width: 800px;
  margin: auto;
  height: auto;
  padding: 300px max(var(--side-padding), env(safe-area-inset-right)) 300px max(var(--side-padding), env(safe-area-inset-left));
}

@keyframes s {
  0% {
    background-color: #5fff;
  }
  50% {
    background-color: #ff5f;
  }
  100% {
    background-color: #5fff;
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

</style>
