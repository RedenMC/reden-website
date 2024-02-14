<script setup lang="ts">
import {onMounted, type Ref, ref, VueElement} from "vue";
import {en} from "vuetify/locale";

const {size, imageTransparentPercentage} = defineProps({
  size: Number,
  imageTransparentPercentage: Number
});
if (size === undefined || size < 1) {
  throw new Error('size must be greater than 0')
}
const sizz = Math.floor(size);

let lightLine: Ref<Element | null> = ref(null);
let card: Ref<Element | null> = ref(null);
onMounted(() => {
  let observer = new IntersectionObserver((it) => {
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
    })
  }, {
    threshold: [0, 1]
  })
  observer.observe(lightLine.value as Element);
})

defineSlots<{
  title: VueElement
  subtitle: VueElement
  text: VueElement
  image: VueElement
}>()
</script>

<template>
  <div class="line">
    <div ref="card">

      <v-card
        class="card"
        :min-height="sizz * 100 - 80"
      >
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
        </template>
        <template #image>
          <slot name="image" />
        </template>
      </v-card>
    </div>

    <div class="darkLine lineLayout">
      <div class="photo r0" v-for="n in sizz" :key="n">
      </div>
    </div>

    <div class="lightLine lineLayout invisible" ref="lightLine">
      <div class="photo r15" v-for="n in sizz" :key="n"></div>
    </div>

  </div>
</template>

<style scoped>
.pistonBase {
  background: url("@/assets/piston_base.png") no-repeat;
  background-size: 100px 100px;
}

.pistonHead {
  position: absolute;
  background: url("@/assets/piston_head.png") no-repeat;
  background-size: 100px 100px;
}

.pistonSide {
  position: absolute;
  background: url("@/assets/piston_side.png") no-repeat;
  background-size: 100px 100px;
}

.photo {
  height: 100px;
  image-rendering: pixelated;
}

.r0 {
  background: url("@/assets/redstone_dust_0.png") no-repeat;
  background-size: 100px 100px;
  background-position-x: -30px;
}

.r15 {
  background: url("@/assets/redstone_dust_15.png") no-repeat;
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
  width: 100%;
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
</style>
