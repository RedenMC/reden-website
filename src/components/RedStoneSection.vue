<script setup lang="ts">
import {onMounted, type Ref, ref} from "vue";
import {en} from "vuetify/locale";

const { size } = defineProps({
  size: Number,
});
if (size === undefined || size < 1) {
  throw new Error('size must be greater than 0')
}
const sizz = Math.floor(size);

let lightLine: Ref<Element | null> = ref(null);
onMounted(() => {
  let observer = new IntersectionObserver((it) => {
    it.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      } else {
        entry.target.classList.remove('animate');
      }
      console.log(entry.target.getBoundingClientRect().top)
    })
  })
  observer.observe(lightLine.value as Element);
})
</script>

<template>
  <div class="line">

    <div class="darkLine lineLayout">
      <div class="photo r0" v-for="n in sizz" :key="n"><slot :name="n"></slot></div>
    </div>

    <div class="lightLine lineLayout" ref="lightLine">
      <div class="photo r15" v-for="n in sizz" :key="n"></div>
    </div>

    <div>
      <div class="photo pistonHead"></div>
      <div class="photo pistonSide"></div>
      <div class="photo pistonBase"></div>
    </div>

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
  mask: linear-gradient(var(--c0) 0%, var(--c1) 10%);

}

.animate {
  animation: mask 1s ease-out alternate;
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


.card {
  position: absolute;
  top: 2rem;
  left: 10%;
}
</style>
