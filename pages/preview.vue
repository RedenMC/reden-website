<script lang="ts" setup>
import { versionGrouped } from '~/utils/constants';
import { Cascader } from 'ant-design-vue';

const items = ref<string[]>([]);
console.log(versionGrouped);
const options = Object.entries(versionGrouped)
  .map(([name, children]) => ({
    label: name + '.x',
    value: name + '.x',
    children: children.map((version) => ({
      label: version,
      value: version,
    })),
  }))
  .toReversed();
</script>

<template>
  <Cascader
    v-model="items"
    :options="options"
    class="w-100"
    hover
    multiple
    size="large"
  />
  {{ items.join(' ') }}
</template>

<style scoped></style>
