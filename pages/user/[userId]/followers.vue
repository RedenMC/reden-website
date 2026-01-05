<script setup lang="ts">
definePageMeta({
  needLogin: true,
});

const route = useRoute();
const userId = computed(() => parseInt(route.params.userId as string));
</script>

<template>
  <div class="followers-page">
    <profile-follow-list :user-id="userId" type="followers" />
  </div>
</template>

<style scoped>
.followers-page {
  padding: 20px 0;
}
</style>
