<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import Lever from '@/assets/lever.png';
import LeverBase from '@/assets/lever_base.png';
import LampOff from '@/assets/redstone_lamp.png';
import LampOn from '@/assets/redstone_lamp_on.png';
import RedenOff from '@/assets/favicon/reden_256_close.png';
import RedenOn from '@/assets/favicon/reden_256.png';

const { title,relaying } = defineProps<
{
  title: String,
  relaying?: boolean
}>();

const all: Ref<Element | null> = ref(null);
const leverOn = ref(false);
onMounted(() => {
  let observer = new IntersectionObserver(
    (it) => {
      it.forEach((entry) => {
        if (entry.target.getBoundingClientRect().top > 0) {
          // only operate when the element is at the bottom of the screen
          if (entry.intersectionRatio == 1) {
            leverOn.value = true;
          }
          if (entry.intersectionRatio == 0) {
            leverOn.value = false;
          }
        }
      });
    },
    {
      threshold: [0, 1],
    },
  );
  observer.observe(all.value!);
});
const lampOnStyle = 'url(' + LampOn + ')';
const lampOffStyle = 'url(' + LampOff + ')';

const redenOnStyle = 'url(' + RedenOn + ')';
const redenOffStyle = 'url(' + RedenOff + ')';
</script>

<template>
  <div class="redstone-section-title -translate-x-1" :class="relaying && 'mt-5'">
    <div class="lever-all" ref="all" @click="leverOn = !leverOn" v-if="!relaying">
      <img
        :src="Lever"
        :class="{ 'lever-on': leverOn, 'lever-off': !leverOn }"
        height="50"
        width="50"
        alt=""
      />
      <img :src="LeverBase" class="lever-base" alt="" />
    </div>

    <div class="absolute -translate-y-[65%]" ref="all" @click="leverOn = !leverOn" v-if="relaying">
      <div
        :class="{ 'reden-on': leverOn, 'reden-off': !leverOn, 'lamp-common': true }"
      ></div>
    </div>



    <div
      :class="{ 'lamp-on': leverOn, 'lamp-off': !leverOn, 'lamp-common': true }"
    ></div>
    <div class="title font-['MinecraftTen']">{{ title }}</div>
  </div>
</template>

<style scoped>
.title {
  font-size: 48px;
  margin-left: 25px;
}

.lever-on {
  position: absolute;
  transform: translateY(-36px) rotate(45deg) translateX(25px);
  transition: transform 0.5s;
  image-rendering: pixelated;
}

.lever-off {
  position: absolute;
  transform: translateY(-36px) rotate(-45deg) translateX(-25px);
  transition: transform 0.5s;
  image-rendering: pixelated;
}

.lever-base {
  position: absolute;
  height: 10px;
  left: 12px;
  top: 15px;
  image-rendering: pixelated;
}

.lever-all {
  position: absolute;
  width: 50px;
  height: 75px;
}

.lamp-on {
  background-image: v-bind(lampOnStyle);
  transition: background-image 0.5s;
  transition-delay: 0.2s;
}

.lamp-off {
  background-image: v-bind(lampOffStyle);
}

.reden-on {
  background-image: v-bind(redenOnStyle);
  transition: background-image 0.5s;
  transition-delay: 0.2s;
}

.reden-off {
  background-image: v-bind(redenOffStyle);
}

.lamp-common {
  background-position: 0 25px;
  background-size: 50px 50px;
  image-rendering: pixelated;
  width: 50px;
  height: 75px;
}

.redstone-section-title {
  display: flex;
}
</style>
