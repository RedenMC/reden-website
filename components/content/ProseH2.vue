<template>
  <h2 :id="props.id">
    <a v-if="props.id" class="my-mdc-header" :href="`#${props.id}`">
      <slot />
    </a>
    <slot v-else />
  </h2>
</template>

<script setup lang="ts">
import './mdc-styles.css';
const props = defineProps<{ id?: string }>();
</script>
