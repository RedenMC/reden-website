<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import Lever from '@/assets/lever.png';
import LeverBase from '@/assets/lever_base.png';
import LampOff from '@/assets/redstone_lamp.png';
import LampOn from '@/assets/redstone_lamp_on.png';

const { title } = defineProps({
  title: String,
});

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
</script>

<template>
  <div class="redstone-section-title" draggable="false">
    <div class="lever-all" ref="all" @click="leverOn = !leverOn">
      <img
        :src="Lever"
        :class="{ 'lever-on': leverOn, 'lever-off': !leverOn }"
        height="100"
        width="50"
        style="user-select: none;"
        alt="" />
      <img
        :src="LeverBase"
        class="lever-base"
        style="user-select: none;"
        alt=""/>
    </div>
    <div
      :class="{ 'lamp-on': leverOn, 'lamp-off': !leverOn, 'lamp-common': true }"
    ></div>
    <div class="title">{{ title }}</div>
  </div>
</template>

<style scoped>
.title {
  font-size: 48px;
  margin-left: 25px;
}

.lever-on {
  position: absolute;
  top: -28px;
  transform:rotate(45deg);
  transition: transform 0.5s;
  image-rendering: pixelated;
}

.lever-off {
  position: absolute;
  top: -28px;
  transform:rotate(-45deg);
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
