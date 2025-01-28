<script lang="ts" setup>
const data = ['stone_hoe', 'stone', 'dirt', 'oak_wood', 'grass_block'];
</script>

<template>
  <template v-for="d in data" :key="d">
    {{ d }}
    <minecraft-item-display :id="d" :scale="2" />
  </template>
</template>

<style scoped></style>
