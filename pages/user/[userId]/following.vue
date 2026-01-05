<script setup lang="ts">
definePageMeta({
  needLogin: true,
});

const route = useRoute();
const userId = computed(() => parseInt(route.params.userId as string));
</script>

<template>
  <div class="following-page">
    <profile-follow-list :user-id="userId" type="following" />
  </div>
</template>

<style scoped>
.following-page {
  padding: 20px 0;
}
</style>
