<script lang="ts" setup>

import {doFetchGet} from "@/constants";
import {toast, VSonner} from "vuetify-sonner";
import {useAppStore} from "@/store/app";
import UserProfileCard from "@/components/UserProfileCard.vue";

// oauth login csrf token is not passed by json, but by query string
const queries = window.location.search.substring(1).split('&');
const csrf = queries.find(str => str.startsWith('csrf_token='))?.substring(11)
if (csrf) {
  useAppStore().setCsrfToken(csrf)
  history.pushState({}, document.title, window.location.pathname + window.location.hash)
  console.log('csrf', csrf)
}

function logout() {
  doFetchGet('/api/account/logout').then(response => {
    if (response.ok) {
      window.location.href = '/'
      useAppStore().logout()
      toast('Logout Successful', {
        description: 'You have been logged out',
        duration: 1000,
        cardProps: {
          color: 'green'
        }
      })
    } else {
      toast('Error', {
        description: 'Failed to logout',
        duration: 1000,
        cardProps: {
          color: 'error'
        }
      })
    }
  });
}
</script>

<template>
  <VSonner/>
  <UserProfileCard>
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
  <v-btn
    color="primary"
    @click="logout"
  >
    Logout
  </v-btn>
</template>

<style scoped>

</style>
