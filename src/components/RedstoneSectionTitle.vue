<script setup lang="ts">
import {onMounted, Ref, ref} from "vue";
import Lever from "@/assets/lever.png";
import LeverBase from "@/assets/lever_base.png";
import LampOff from "@/assets/redstone_lamp.png";
import LampOn from "@/assets/redstone_lamp_on.png";

const {title} = defineProps({
  title: String
})

const all: Ref<Element | null> = ref(null)
const leverOn = ref(false)
onMounted(() => {
  let observer = new IntersectionObserver((it) => {
    it.forEach((entry) => {
      if (entry.target.getBoundingClientRect().top > 0) {
        // only operate when the element is at the bottom of the screen
        if (entry.intersectionRatio == 1) {
          leverOn.value = true
        }
        if (entry.intersectionRatio == 0) {
          leverOn.value = false
        }
      }
    })
  }, {
    threshold: [0, 1]
  })
  observer.observe(all.value!);
})
</script>

<template>
  <div class="redstone-section-title">
    <div class="lever-all" ref="all" @click="leverOn = !leverOn">
      <img :src="Lever"
           :class="{ 'lever-on': leverOn, 'lever-off': !leverOn }"
           height="50"
           width="50"
           alt=""
      />
      <img :src="LeverBase"
           class="lever-base"
           alt=""
      />
      <img :src="leverOn ? LampOn : LampOff" width="50" class="lamp" alt=""/>
    </div>
    <div style="width: 50px; height: 75px;">

    </div>
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
  transform: translateY(-35px) rotate(45deg) translateX(25px);
  transition: transform 0.5s;
  image-rendering: pixelated;
}

.lever-off {
  position: absolute;
  transform: translateY(-35px) rotate(-45deg) translateX(-25px);
  transition: transform 0.5s;
  image-rendering: pixelated;
}

.lever-base {
  position: absolute;
  width: 25px;
  left: 12px;
  top: 15px;
  image-rendering: pixelated;
}

.lever-all {
  position: absolute;
  width: 50px;
  height: 75px;
}

.lamp {
  position: absolute;
  top: 25px;
  image-rendering: pixelated;
}

.redstone-section-title {
  display: flex;
}
</style>
