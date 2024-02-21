<script setup lang="ts">
import {ref} from "vue";
import {fetchOtherUser, Profile} from "@/constants";
import UserProfileCard from "@/components/UserProfileCard.vue";
// to number
const uid = window.location.pathname.split('/').pop()
const numUid = Number(uid)
const user = ref<Profile>()
if (numUid) {
  fetchOtherUser(numUid, user)
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
  <v-card v-else-if="user">
    <UserProfileCard :user="user" :show-actions="false"/>
  </v-card>
</template>

<style scoped>

</style>
