<template>
  <v-row v-if="toggle">
    <v-col class="info">
      {{ $t('litematica_generator.size_' + $props.xyz) }}
    </v-col>
    <v-text-field
      v-model="model"
      :rules="cond"
      density="compact"
      type="number"
      variant="underlined"
    >
      <template #details>
        {{ Math.ceil(Number(model) / 16) }}
        {{ $t('litematica_generator.chunks') }}
      </template>
    </v-text-field>

    <v-expand-transition>
      <div class="suggested-values" v-show="suggestedValues?.length">
        {{ $t('litematica_generator.suggested_values') }}
        <v-btn
          v-for="i in suggestedValues"
          :key="i"
          color="secondary"
          variant="outlined"
          v-on:click="() => (model = i)"
        >
          {{ i }}
        </v-btn>
        <div class="opacity-60">
          {{ $t('litematica_generator.suggestion_notice') }}
        </div>
      </div>
    </v-expand-transition>
  </v-row>
</template>
<script lang="ts" setup>
import { type Machine } from '~/pages/litematica.vue';
import { computed } from 'vue';
import { debugMessages } from '@/utils/constants';

const props = defineProps<{
  def: Machine;
  xyz: 'x' | 'y' | 'z';
}>();

const model = defineModel<number | string>();
const cond: ({
  min?: number;
  max?: number;
} & ((v: number) => any))[] = props.def.conditions[props.xyz];
const toggle = (props.def as any)['has' + props.xyz.toUpperCase()] as boolean;

const suggestedValues = computed(() => {
  const current = Number(model.value);
  if (!current || !cond || cond.length === 0) {
    if (import.meta.dev) console.info('bad args!', current, cond);
    return;
  }
  let start = current;
  const check = (value: number) => {
    let accepted = true;
    for (let func of cond) {
      if (func(value) !== true) {
        accepted = false;
        if (func.min) {
          if (start < func.min) start = func.min;
        }
        if (func.max) {
          if (start > func.max) start = func.max;
        }
      }
    }
    return accepted;
  };
  if (check(current)) return [];
  if (debugMessages())
    console.log('suggestedValues', 'current', current, 'start', start);
  let i = start;
  let ret: number[] = [];
  while (i > start - 50 && i > 0) {
    if (check(i)) {
      if (ret.indexOf(i) == -1) {
        ret.push(i);
      }
      break;
    }
    i--;
  }
  i = start;
  while (i < start + 50 && i < 1000) {
    if (check(i)) {
      if (ret.indexOf(i) == -1) {
        ret.push(i);
      }
      break;
    }
    i++;
  }
  if (debugMessages())
    console.log('current', current, 'start', start, 'ret', ret);
  return ret;
});
</script>
<style scoped>
.info {
  font-size: 1rem !important;
  font-weight: 400;
  letter-spacing: 0.03125em !important;
  font-family: 'Roboto', sans-serif;
  text-transform: none !important;
  min-width: 70px;
}

.suggested-values {
  height: 40px;
  width: 100%;
  padding-left: 12px;
  padding-right: 12px;
  line-height: 36px;
}
</style>
