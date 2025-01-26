<template>
  <h4 :id="props.id">
    <slot />
  </h4>
</template>

<script setup lang="ts">
import './mdc-styles.css';
const props = defineProps<{ id?: string }>();
</script>
