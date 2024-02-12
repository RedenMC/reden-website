<script setup lang="ts">
import {onMounted, type Ref, ref} from "vue";

const {size} = defineProps({
  size: Number,
});
if (size === undefined || size < 1) {
  throw new Error('size must be greater than 0')
}
const sizz = Math.floor(size);

let lightLine: Ref<Element | null> = ref(null);
let card: Ref<Element | null> = ref(null);
onMounted(() => {
  let observer = new IntersectionObserver((it) => {
    console.log(card.value?.classList)
    it.forEach((entry) => {
      if (entry.target.getBoundingClientRect().top > 0) {
        // only operate when the element is at the bottom of the screen
        if (entry.intersectionRatio == 1) {
          entry.target.classList.add('light-line-animate');
          entry.target.classList.remove('invisible');
          card.value?.classList?.add('card-animate');
          card.value?.classList?.remove('invisible');
        } else {
          entry.target.classList.remove('light-line-animate');
          card.value?.classList?.remove('card-animate');
        }
        if (entry.intersectionRatio == 0) {
          entry.target.classList.add('invisible');
          card.value?.classList?.add('invisible');
        }
      }
    })
  }, {
    threshold: [0, 1]
  })
  observer.observe(lightLine.value as Element);
})
</script>

<template>
  <div class="line">

    <div class="darkLine lineLayout">
      <div class="photo r0" v-for="n in sizz" :key="n">
        <slot :name="n"></slot>
      </div>
    </div>

    <div class="lightLine lineLayout invisible" ref="lightLine">
      <div class="photo r15" v-for="n in sizz" :key="n"></div>
    </div>

    <div ref="card">
      <v-card class="card">
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
      </v-card>
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
}

.r15 {
  background: url("@/assets/redstone_dust_15.png") no-repeat;
  background-size: 100px 100px;
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

.light-line-animate {
  animation: mask 1s ease-out alternate;
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
  margin-left: 70px;
  margin-right: 70px;
  width: calc(100% - 140px);
}

@keyframes card-appear {
  0% {
    position: relative;
    top: 2rem;
    transform: translateX(-100px);
    opacity: 100%;
  }
  100% {
    position: static;
    top: 2rem;
    transform: translateX(0);
    opacity: 100%;
  }
}

.card-animate {
  animation: card-appear 1s ease-out;
}
</style>
