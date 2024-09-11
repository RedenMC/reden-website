<script setup lang="ts">
import { ref } from 'vue';
import { type Profile } from '@/utils/constants';
import UserProfileCard from '@/components/UserProfileCard.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { t } = useI18n();
const { data: user } = useFetch<Profile>(`/api/users/${route.params.username}`);
useHead({
  title: `${user?.value?.username ?? t('reden.user_not_found')} - Reden`,
});
</script>

<template>
  <v-card v-if="!user">
    <v-card-title>
      <h1>Invalid User</h1>
    </v-card-title>
    <v-card-text>
      <p>Invalid user id</p>
    </v-card-text>
  </v-card>
  <v-card v-else>
    <v-alert v-show="!user" type="error" dismissible>
      Cannot find user
    </v-alert>
    <UserProfileCard v-show="user" :user="user" :can-edit="false" />
  </v-card>
</template>

<style scoped></style>
