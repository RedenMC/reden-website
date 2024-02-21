<script lang="ts" setup>
import {
  doFetchGet,
  fetchUser,
  Profile,
  toastError,
  // toastStatusCode,
} from '@/constants';
import { toast } from 'vuetify-sonner';
import { useAppStore } from '@/store/app';
import UserProfileCard from '@/components/UserProfileCard.vue';
import { ref } from 'vue';

// oauth login csrf token is not passed by json, but by query string
const queries = window.location.search.substring(1).split('&');
const csrf = queries
  .find((str) => str.startsWith('csrf_token='))
  ?.substring(11);
if (csrf) {
  useAppStore().setCsrfToken(csrf);
  history.pushState(
    {},
    document.title,
    window.location.pathname + window.location.hash,
  );
  console.log('csrf', csrf);
}

let user = ref<Profile>();
fetchUser(user);

function logout() {
  doFetchGet('/api/account/logout')
    .then((response) => {
      if (response.ok) {
        window.location.href = '/';
        useAppStore().logout();
        toast('Logout Successful', {
          description: 'You have been logged out',
          duration: 1000,
          cardProps: {
            color: 'green',
          },
        });
      } else {
        return Promise.reject(response);
      }
    })
    .catch((e) => toastError(e, 'Failed to logout'));
}
</script>

<template>
  <UserProfileCard :user="user">
    <template #actions>
      <v-row>
        <v-col>
          <v-btn
            color="secondary"
            href="/home/edit"
            rounded="lg"
            class="text-none"
            variant="outlined"
          >
            Edit Profile
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </UserProfileCard>
  <v-btn color="primary" @click="logout"> Logout </v-btn>
</template>

<style scoped></style>
