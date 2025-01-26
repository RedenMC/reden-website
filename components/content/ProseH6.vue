<template>
  <h6 :id="props.id">
    <slot />
  </h6>
</template>

<script lang="ts" setup>
import './mdc-styles.css';

const props = defineProps<{ id?: string }>();
</script>
