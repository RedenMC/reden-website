<template>
  <h3 :id="props.id">
    <a v-if="props.id" class="my-mdc-header" :href="`#${props.id}`">
      <slot />
    </a>
    <slot v-else />
  </h3>
</template>

<script setup lang="ts">
import './mdc-styles.css';
const props = defineProps<{ id?: string }>();
</script>
