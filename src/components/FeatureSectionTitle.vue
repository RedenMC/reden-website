<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue';
import { useAppStore } from '@/store/app';
import LampOnLight from '@/assets/redstone_lamp_on.png';
import LampOffLight from '@/assets/redstone_lamp.png';
import LampOnDark from '@/assets/redstone_block.png';
import LampOffDark from '@/assets/null.png';

const { title } = defineProps({title: String,});
const all: Ref<Element | null> = ref(null);
const light = ref(useAppStore().theme === 'light');
const lampOn = ref(false);

watch(() => useAppStore().theme, (Value) => {
  light.value = Value === 'light';
});

onMounted(() => {
  let observer = new IntersectionObserver(
    (it) => {
      it.forEach((entry) => {
        if (entry.target.getBoundingClientRect().top > 0) {
          // only operate when the element is at the bottom of the screen
          if (entry.intersectionRatio == 1) {
            lampOn.value = true;
          }
          if (entry.intersectionRatio == 0) {
            lampOn.value = false;
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

const lampOnStyleLight = 'url(' + LampOnLight + ')';
const lampOnStyleDark = 'url(' + LampOnDark + ')';
const lampOffStyleLight = 'url(' + LampOffLight + ')';
const lampOffStyleDark = 'url(' + LampOffDark + ')';
</script>

<template>
  <div class="redstone-section-title">
    <div
      :class="{
        'lamp-on-light': lampOn && light,
        'lamp-on-dark': lampOn && !light,
        'lamp-off-light': !lampOn && light,
        'lamp-off-dark': !lampOn && !light,
        'lamp-common': true
      }"
      ref="all"
    ></div>
    <div class="title">{{ title }}</div>
  </div>
</template>

<style scoped>
.title {
  font-size: 290%;
  margin-left: 1%;
}

.lamp-on-light {
  background-image: v-bind(lampOnStyleLight);
  box-shadow: 0 0 100px 50px #ff8000ff,0 0 100px 150px #ff800040, 0 0 200px 300px #ffa00086;
  transition: background-image 0.2s, box-shadow 0.2s;
  transition-delay: 0.2s;
}

.lamp-on-dark {
  background-image: v-bind(lampOnStyleDark);
  box-shadow: 0 0 100px 100px #ff000057, 0 0 150px 220px #ff000025, 0 0 200px 300px #ff00003a;
  transition: background-image 0.1s, box-shadow 0.2s;
  transition-delay: 0.2s;
}

.lamp-off-light {
  background-image: v-bind(lampOffStyleLight);
  transition: background-image 0.2s, box-shadow 0.2s;
}

.lamp-off-dark {
  background-image: v-bind(lampOffStyleDark);
  transition: background-image 0.2s, box-shadow 0.2s;
}

.lamp-common {
  background-size: 65px 65px;
  image-rendering: pixelated;
  width: 65px;
  height: 65px;
}

.redstone-section-title {
  margin-left: 3%;
  margin-right: 3%;
  display: flex;
}
</style>
