<template>Rendering the <code>script</code> is disabled.</template>

<script setup lang="ts">
defineProps({
  src: {
    type: String,
    default: '',
  },
});
const isDev = import.meta.dev;
</script>
