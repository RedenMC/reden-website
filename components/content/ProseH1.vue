<template>
  <h1 :id="props.id">
    <a :href="`#${props.id}`" class="my-mdc-header">
      <slot />
    </a>
  </h1>
</template>

<script lang="ts" setup>
import './mdc-styles.css';
const props = defineProps<{ id?: string }>();
</script>
