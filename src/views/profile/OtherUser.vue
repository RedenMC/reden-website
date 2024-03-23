<script setup lang="ts">
import { ref } from 'vue';
import { fetchOtherUser, Profile } from '@/constants';
import UserProfileCard from '@/components/UserProfileCard.vue';
// to number
const uid = window.location.pathname.split('/').pop();
const numUid = Number(uid);
const loading = ref(true);
const user = ref<Profile>();
if (numUid) {
  fetchOtherUser(numUid, user).then(() => (loading.value = false));
}
</script>

<template>
  <v-card v-if="!numUid">
    <v-card-title>
      <h1>Invalid User</h1>
    </v-card-title>
    <v-card-text>
      <p>Invalid user id</p>
    </v-card-text>
  </v-card>
  <v-card v-else>
    <v-skeleton-loader
      v-show="loading"
      type="card-avatar"
      width="300"
    ></v-skeleton-loader>
    <v-alert v-show="!loading && !user" type="error" dismissible>
      Cannot find user
    </v-alert>
    <UserProfileCard v-show="!loading && user" :user="user" :can-edit="false" />
  </v-card>
</template>

<style scoped></style>
