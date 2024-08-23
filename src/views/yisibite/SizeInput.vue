<template>
  <v-row v-if="toggle">
    <v-col class="text-md-body-1">
      {{ $t('litematica_generator.size_' + $props.xyz) }}
    </v-col>
    <v-text-field
      :rules="cond"
      v-model="model"
      type="number"
      density="compact"
      variant="underlined"
    >
      <template v-if="false" #append-inner>
        <span
          v-show="
            suggestedValues(model, props.def?.conditions?.x)?.length
          "
        >
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
import {computed} from "vue";

const props = defineProps<{
  def: Machine;
  xyz: 'x' | 'y' | 'z';
}>();

const model = defineModel<number>();
const cond = computed(() => props.def.conditions[props.xyz]);
const toggle = computed(() => (props.def as any)['has' + props.xyz.toUpperCase()] as boolean);

const suggestedValues = (
  current: number | string | undefined,
  conditions: any[],
): number[] | undefined => {
  current = Number(current);
  if (!current || !conditions || conditions.length === 0) {
    console.error('bad args!', current, conditions)
    return;
  }
  for (let func of conditions) {
    if (!func || !(func instanceof Function)) {
      console.error(func, 'is not function');
      return;
    }
  }
  const check = (value: number) => {
    let accepted = true;
    for (let func of conditions) {
      if (typeof func(value) !== 'boolean') {
        accepted = false;
      }
    }
    return accepted;
  };
  console.log(current, model, model.value)
  if (check(current)) return [];
  let i = current - 1;
  let ret = [];
  while (i > current - 50 && i > 0) {
    if (check(i)) {
      ret.push(i);
      break;
    }
    i--;
  }
  i = current + 1;
  while (i < current + 50 && i < 1000) {
    if (check(i)) {
      ret.push(i);
      break;
    }
    i++;
  }
  console.log(current, model, model.value, ret)
  return ret;
};
</script>
<style scoped></style>
