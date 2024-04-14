<script setup lang="ts">
import {onMounted, type Ref, ref, watch} from 'vue';
import router from "@/router";
import {useAppStore} from "@/store/app";

const { icon, video, link } = defineProps({
  icon: String,
  video: String,
  link: String
});

const light = ref(useAppStore().theme === 'light');
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isHovered = ref(false);

let card: Ref<Element | null> = ref(null);

onMounted(() => {
  let observer = new IntersectionObserver(
    (it) => {
      it.forEach((entry) => {
        if (entry.target.getBoundingClientRect().top > 0) {
          // only operate when the element is at the bottom of the screen
          if (entry.intersectionRatio >= 0.4) {
            if (entry.target.classList.contains('invisible')) {
              entry.target.classList.remove('invisible');
            }
            card.value?.classList?.add('card-active');
            card.value?.classList?.remove('card-invisible');
          } else {
            card.value?.classList?.remove('card-active');
          }
          if (entry.intersectionRatio == 0) {
            entry.target.classList.add('invisible');
            card.value?.classList?.add('card-invisible');
          }
        }
      });
    },
    {
      threshold: [0, 0.4],
    },
  );
  observer.observe(card.value as Element);
});

const goToLink = () => {
  if (link) {
    router.push(link).then(() => {
      if (window.location.href != link) {
        location.reload();
      }
    });
  }
};

watch(() => useAppStore().theme, (Value) => {
  light.value = Value === 'light';
});

</script>

<template>
  <div style="display: flex; flex-direction:row; justify-content: center;" ref="card">
    <v-card class="card card-responsive" :class="{ 'card-light': light, 'card-dark': !light }">
      <template #title>
        <v-row dense>
          <v-col cols="auto">
            <v-img :src="icon" width="40" height="40" style="image-rendering: pixelated;" />
          </v-col>
          <v-col cols="auto">
            <div class="custom-title" @click="goToLink">
              <slot name="title"/>
            </div>
          </v-col>
        </v-row>
      </template>
      <template #subtitle>
        <slot name="subtitle" />
      </template>
      <template #text>
        <div class="custom-text text-responsive">
          <slot name="text" />
        </div>
      </template>
      <template #image>
        <div
          class="overlay overlay-responsive"
          @click="goToLink"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
          :tabindex="0"
          @keydown.enter="goToLink"
          @focus="isHovered = true"
          @blur="isHovered = false">
          <video
            :class="{ 'filter': isHovered, 'filterOff': !isHovered }"
            :src="video"
            :autoplay="true"
            style="height: 100%;"
            loop
            muted
            playsinline
          />
          <div v-if="isHovered || isMobileDevice " class="overlay-text">
            {{ $t('reden.learn_more') }}
          </div>
        </div>
      </template>
    </v-card>
  </div>
</template>

<style scoped>
.invisible {
  opacity: 0;
}

.card-active {
  transition: all 1s ease-out;
  transform: none;
  animation: 1s ease-in;
}

.custom-title {
  cursor: pointer;
  font-size: 144%;
  letter-spacing: -1px;
  line-height: 40px;
  text-decoration: none;
}

.custom-title:hover{
  text-decoration: underline;
}

.custom-text {
  font-size: 120%;
}

.card {
  position: relative;
  margin-left: 9%;
  margin-right: 9%;
  top: 2rem;
}

.card-light{
  background-color: rgba(255, 255, 255, 0.2);
}

.card-dark{
  background-color: rgba(255, 255, 255, 0.05);
}

.overlay {
  position: absolute;
  flex: auto;
  cursor: pointer;
  clip-path: inset(0 0 0 0);
  transition: opacity 0.5s;
}

.filter{
  filter: blur(10px);
  opacity: 0.3;
  transition: filter 0.5s, opacity 0.5s;
}

.filterOff{
  transition: filter 0.5s, opacity 0.5s;
}

.overlay-text{
  position: absolute;
  bottom: 50%;
  left: 51%;
  letter-spacing: 6px;
  transform: translate(-50%, 50%) scale(1.4);
  transition: letter-spacing 2s;
}

@media (max-width: 600px) {   /* XS */
  .card-responsive{
    min-width: 260px;
    max-width: 330px;
    height: 420px;
  }

  .text-responsive{
    line-height: 1.1;
  }

  .overlay-responsive{
    height: 230px;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (min-width: 600px) and (max-width: 960px) {   /* SM~MD */
  .card-responsive{
    min-width: 580px;
    height: 230px;
  }

  .text-responsive{
    line-height: 1.5;
    width: 45%;
  }

  .overlay-responsive{
    display: flex;
    right: 0;
    width: 50%;
    height: 100%;
    justify-content: center;
    align-items: center;
  }
}

@media (min-width: 960px){   /* MD+ */
  .card-responsive{
    min-width: 280px;
    height: 460px;
  }

  .text-responsive{
    line-height: 1.7;
  }

  .overlay-responsive{
    height: 200px;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
