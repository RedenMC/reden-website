<script setup lang="ts">
import {VSonner, toast} from 'vuetify-sonner'
import {ref} from 'vue'
import type {Position as PositionType} from 'vue-sonner/lib/types'
import {useI18n} from 'vue-i18n'
import RedStoneSection from "@/components/RedStoneSection.vue";
import PistonBase from "@/assets/piston_base.png";
import PistonSide from "@/assets/piston_side.png";
import PistonHead from "@/assets/piston_head.png";

const {t} = useI18n()

const position = ref<PositionType>('bottom-center')
const expand = ref(false)
addEventListener('scroll', () => {
  expand.value = window.scrollY > 0;
})
document.title = t('reden.title.home', [' | Reden'])
</script>

<template>

</template>

<style scoped>
body {
  --side-padding: 16px;
}

.main-page {
  max-width: 800px;
  margin: auto;
  height: auto;
  padding: 260px 0 260px 0;
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
