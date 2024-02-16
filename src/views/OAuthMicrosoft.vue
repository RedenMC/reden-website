<script setup lang="ts">
import {ref} from "vue";

const loading = ref(true)

</script>

<template>
<v-progress-linear
  :indeterminate="true"
  v-show="loading"
  ></v-progress-linear>
</template>

<style scoped>

</style>
