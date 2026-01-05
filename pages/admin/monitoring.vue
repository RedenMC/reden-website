<script setup lang="ts">
definePageMeta({
  needLogin: true,
  needAdmin: true,
});

useHead({
  title: 'User Retention Monitoring - Admin',
});
</script>

<template>
  <div class="monitoring-page">
    <admin-monitoring-dashboard />
  </div>
</template>

<style scoped>
.monitoring-page {
  padding: 20px;
}
</style>
