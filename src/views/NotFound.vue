<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <v-empty-state
    headline="Whoops, 404"
    title="Page not found"
    text="The page you were looking for does not exist"
    height="500px"
  >
    <template #actions>
      <v-btn color="primary" @click="router.back()">Go Back</v-btn>
    </template>
  </v-empty-state>
</template>

<style scoped></style>
