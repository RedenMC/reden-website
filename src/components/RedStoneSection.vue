<script setup lang="ts">
import { onMounted, type Ref, ref, VueElement } from 'vue';
import { useAppStore } from '@/store/app';

const theme = () => {
  return useAppStore().theme === 'light';
};

// todo: 不透明度渐变
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { size, imageTransparentPercentage, video } = defineProps({
  size: Number,
  imageTransparentPercentage: Number,
  video: String
});
if (size === undefined || size < 1) {
  throw new Error('size must be greater than 0');
}
const sizz = Math.floor(size);

let lightLine: Ref<Element | null> = ref(null);
let card: Ref<Element | null> = ref(null);
onMounted(() => {
  let observer = new IntersectionObserver(
    (it) => {
      it.forEach((entry) => {
        if (entry.target.getBoundingClientRect().top > 0) {
          // only operate when the element is at the bottom of the screen
          if (entry.intersectionRatio == 1) {
            if (entry.target.classList.contains('invisible')) {
              entry.target.classList.add('light-line-animate');
              entry.target.classList.remove('invisible');
            }
            card.value?.classList?.add('card-active');
            card.value?.classList?.remove('card-invisible');
          } else {
            entry.target.classList.remove('light-line-animate');
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
      threshold: [0, 1]
    }
  );
  observer.observe(lightLine.value as Element);
});

defineSlots<{
  title: VueElement;
  subtitle: VueElement;
  text: VueElement;
  image: VueElement;
  action: VueElement[];
}>();
const autoPlay = ref(true);
</script>

<template>
  <div class="line">
    <div ref="card">
      <div class="card w-auto shadow border relative overflow-hidden"
           :class="theme()? 'bg-stone-100':'bg-stone-800'"
           :style="`min-height: ${sizz * 100 - 80}px;max-height: ${sizz * 100 - 80}px`">

        <div class="absolute top-0 right-0 z-0
        after:w-full after:h-full after:absolute after:top-0 after:left-0  after:bg-opacity-25"
             :class="useAppStore().theme == 'light'?'after:bg-white':'after:bg-black'">
          <div class="bg-img-wrap">
            <slot v-if="video == undefined" name="image" />
            <video
              :src="video"
              v-if="video != undefined"
              style="object-fit: scale-down; height: 260px; right: 0"
              :autoplay="autoPlay"
              loop
              muted
              playsinline
            />
          </div>
        </div>

        <div class="absolute top-0 left-0 z-10 w-full h-full px-8 py-6 flex flex-col justify-between">
          <div class="">
            <div class="flex flex-col items-start">
              <div class="font-serif font-bold text-xl tracking-wide">
                <slot name="title" />
              </div>
              <div class="font-mono text-xs" :class="useAppStore().theme == 'light'?'text-gray-600':'text-gray-300'">
                <slot name="subtitle" />
              </div>
            </div>
            <div>
              <div class=" mt-2 text-base">
                <slot name="text" />
              </div>
            </div>
          </div>
          <div>
            <slot name="action" />
          </div>
        </div>


        <div>
          <!--
          <v-tooltip text="Auto play">
            <template #activator="{ props }">
              <v-btn
                :icon="autoPlay ? 'mdi-pause' : 'mdi-play'"
                @click="autoPlay = !autoPlay"
                v-bind="props">
              </v-btn>
            </template>
          </v-tooltip>
          -->
        </div>
      </div>
    </div>
    <div class="darkLine lineLayout">
      <div class="photo r0" v-for="n in sizz" :key="n"></div>
    </div>

    <div class="lightLine lineLayout invisible" ref="lightLine">
      <div class="photo r15" v-for="n in sizz" :key="n"></div>
    </div>

  </div>
</template>

<style scoped>
.pistonBase {
  background: url('@/assets/piston_base.png') no-repeat;
  background-size: 100px 100px;
}

.pistonHead {
  position: absolute;
  background: url('@/assets/piston_head.png') no-repeat;
  background-size: 100px 100px;
}

.pistonSide {
  position: absolute;
  background: url('@/assets/piston_side.png') no-repeat;
  background-size: 100px 100px;
}

.photo {
  height: 100px;
  image-rendering: pixelated;
}

.r0 {
  background: url('@/assets/redstone_dust_0.png') no-repeat;
  background-size: 100px 100px;
  background-position-x: -30px;
}

.r15 {
  background: url('@/assets/redstone_dust_15.png') no-repeat;
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
  margin-left: 60px;
  translate: 0;
  min-width: calc(100% - 100px);
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
  justify-content: end;
}

.my-text-wrap {
  min-width: 200px;
  max-width: 350px;
  text-shadow: black 1px 1px 1px;
  font-size: 16px;
}
</style>
