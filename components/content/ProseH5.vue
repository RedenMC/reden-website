<template>
  <h5 :id="props.id">
    <slot />
  </h5>
</template>

<script setup lang="ts">
import './mdc-styles.css';
const props = defineProps<{ id?: string }>();
</script>
