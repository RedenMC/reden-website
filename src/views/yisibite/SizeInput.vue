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
      <template v-if="false" #append-inner>
        <span v-show="suggestedValues(model, props.def?.conditions?.x)?.length">
          Suggested values:
          <v-btn
            v-for="i in suggestedValues(model, cond)"
            :key="i"
            color="secondary"
            variant="outlined"
          >
            {{ i }}
          </v-btn>
        </span>
      </template>
    </v-text-field>

    <v-col v-show="suggestedValues(model, cond)?.length" cols="12">
      <span> Suggested values: </span>
      <v-btn
        v-for="i in suggestedValues(model, cond)"
        :key="i"
        color="secondary"
        variant="outlined"
        v-on:click="() => (model = i)"
      >
        {{ i }}
      </v-btn>
    </v-col>
  </v-row>
</template>
<script lang="ts" setup>
import { Machine } from '@/views/yisibite/Download.vue';
import { computed } from 'vue';
import { debugMessages } from '@/constants';

const props = defineProps<{
  def: Machine;
  xyz: 'x' | 'y' | 'z';
}>();

const model = defineModel<number | string>();
const cond = computed(() => props.def.conditions[props.xyz]);
const toggle = computed(
  () => (props.def as any)['has' + props.xyz.toUpperCase()] as boolean,
);

const suggestedValues = (
  current: number | string | undefined,
  conditions: any[],
): number[] | undefined => {
  current = Number(current);
  if (!current || !conditions || conditions.length === 0) {
    if (debugMessages()) console.error('bad args!', current, conditions);
    return;
  }
  for (let func of conditions) {
    if (!func || !(func instanceof Function)) {
      if (debugMessages()) console.error(func, 'is not function');
      return;
    }
  }
  let start = current;
  const check = (value: number) => {
    let accepted = true;
    for (let func of conditions) {
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
    console.log('suggestedValues', { current, model, start });
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
    console.log({ current, start, model, modelValue: model.value, ret });
  return ret;
};
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
</style>
