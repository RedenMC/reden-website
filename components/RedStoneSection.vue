<script lang="ts" setup>
import { onMounted, type Ref, ref } from 'vue';
import { useDisplay, useTheme } from 'vuetify';
import { useElementHover } from '@vueuse/core';

// todo: 不透明度渐变
const props = defineProps({
  size: Number,
  imageTransparentPercentage: Number,
  leverOn: {
    type: Boolean,
    default: true,
  },
  video: String,
});
if (props.size === undefined || props.size < 1) {
  throw new Error('size must be greater than 0');
}
const size = Math.floor(props.size);
const theme = useTheme();
const themeBackground = computed(() => {
  return theme.current.value.colors.background;
});

const { mobile } = useDisplay({
  mobileBreakpoint: 500,
});

let lightLine = useTemplateRef<Element>('lightLine');
let card = useTemplateRef<Element>('card');
const lineFullyVisible = ref(false);
const showLightLine = computed(() => {
  return lineFullyVisible.value && props.leverOn;
});
watch(showLightLine, (value) => {
  if (value) {
    if (lightLine.value?.classList.contains('invisible')) {
      lightLine.value?.classList.add('light-line-animate');
      lightLine.value?.classList.remove('invisible');
    }
  } else {
    lightLine.value?.classList.remove('light-line-animate');
    lightLine.value?.classList.add('invisible');
  }
});
const hovering = useElementHover(card);
onMounted(() => {
  let observer = new IntersectionObserver(
    (it) => {
      it.forEach((entry) => {
        // eslint-disable-next-line no-constant-condition
        if (0) {
          console.log(
            'entry top: ',
            entry.target.getBoundingClientRect().top,
            'entry bottom: ',
            entry.target.getBoundingClientRect().bottom,
            'window innerHeight: ',
            window.innerHeight,
            'element',
            entry.target,
          );
        }
        if (
          entry.target.getBoundingClientRect().top > 100 ||
          entry.target.clientHeight > window.innerHeight
        ) {
          // only operate when the element is at the bottom of the screen
          if (entry.intersectionRatio == 1) {
            lineFullyVisible.value = true;
            card.value?.classList?.add('card-active');
            card.value?.classList?.remove('card-invisible');
          } else {
            card.value?.classList?.remove('card-active');
          }
          if (entry.intersectionRatio == 0) {
            lineFullyVisible.value = false;
            card.value?.classList?.add('card-invisible');
          }
        }
      });
    },
    {
      threshold: [0, 1],
    },
  );
  observer.observe(lightLine.value as Element);
});

const autoPlay = ref(true);
</script>

<template>
  <div class="line">
    <div ref="card">
      <v-card :min-height="size * 100 - 80" class="card">
        <template #title>
          <slot name="title" />
        </template>
        <template #subtitle>
          <slot name="subtitle" />
        </template>
        <template #text>
          <div class="my-text-wrap">
            <slot name="text" />
          </div>
        </template>
        <template #image>
          <div
            :class="{
              'bg-img-wrap': !mobile,
              'bg-blur': hovering,
            }"
          >
            <slot v-if="video == undefined" name="image" />
            <video
              v-if="video != undefined"
              :autoplay="autoPlay"
              :src="video"
              height="220"
              loop
              muted
              playsinline
              style="object-fit: cover; object-position: center"
            />
          </div>
        </template>
        <template #actions>
          <slot name="action" />
        </template>
      </v-card>
    </div>
    <div class="darkLine lineLayout">
      <div v-for="n in size" :key="n" class="photo r0"></div>
    </div>

    <div
      ref="lightLine"
      :class="{
        lightLine: true,
        lineLayout: true,
        invisible: !showLightLine,
        'light-line-animate': showLightLine,
      }"
    >
      <div v-for="n in size" :key="n" class="photo r15"></div>
    </div>
  </div>
</template>

<style scoped>
.photo {
  height: 100px;
  image-rendering: pixelated;
}

.r0 {
  background: url('/image/homepage/section/redstone_dust_0.png') no-repeat;
  background-size: 100px 100px;
  background-position-x: -30px;
}

.r15 {
  background: url('/image/homepage/section/redstone_dust_15.png') no-repeat;
  background-size: 100px 100px;
  background-position-x: -30px;
}

.lineLayout {
  display: flex;
  flex-direction: column;
}

.line {
  position: relative;
}

.lightLine {
  top: 0;
  position: absolute;
  width: 50px;
  height: 100%;
  mask: linear-gradient(var(--c0) -100%, var(--c1) 20%);
}

.invisible {
  opacity: 0;
}

@property --c0 {
  syntax: '<color>';
  inherits: false;
  initial-value: #fff;
}

@property --c1 {
  syntax: '<color>';
  inherits: false;
  initial-value: #fff;
}

@keyframes mask {
  0% {
    --c0: #fff;
    --c1: transparent;
  }
  100% {
    --c0: #fff;
    --c1: #fff;
  }
}

@keyframes light-line-bg {
}

.card {
  position: absolute;
  top: 2rem;
  margin-left: 40px;
  translate: 0;
  min-width: calc(100% - 80px);
  transform: none;
}

.card-active {
  transition: all 1s ease-out;
  transform: none;
  animation: 1s ease-in;
}

/*noinspection CssUnusedSymbol*/
.light-line-animate {
  animation: mask 1s ease-out alternate;
}

/*noinspection CssUnusedSymbol*/
.card-invisible {
  position: absolute;
  opacity: 0;
  transform: translateX(-10%);
}

.bg-img-wrap {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: end;
  left: 0;
}

.my-text-wrap {
  min-width: 200px;
  max-width: 350px;
  font-size: 16px;
}

.darkLine {
  width: 50px;
}

.bg-blur {
  filter: blur(8px);
  opacity: 0.5;
  transition:
    filter 0.5s,
    opacity 0.5s;
}
</style>
