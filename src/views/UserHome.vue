<script setup lang="ts">

import {doFetchGet, Profile} from "@/constants";
import {ref} from "vue";
import {toast, VSonner} from "vuetify-sonner";
import UserBadges from "@/components/UserBadges.vue";
import {useAppStore} from "@/store/app";

let user = ref<Profile>()

// oauth login csrf token is not passed by json, but by query string
const queries = window.location.search.substring(1).split('&');
const csrf = queries.find(str => str.startsWith('csrf_token='))?.substring(11)
if (csrf) {
  useAppStore().setCsrfToken(csrf)
  history.pushState({}, document.title, window.location.pathname + window.location.hash)
  console.log('csrf', csrf)
}

doFetchGet('/api/account/profile').then(async response => {
  if (response.ok) {
    const data: Profile = await response.json()
    user.value = data
    useAppStore().updateCache(data)
  } else {
    if (response.status === 401) {
      toast('Error', {
        description: 'You are not logged in',
        duration: 1000,
        cardProps: {
          color: 'error'
        }
      })
      window.location.href = '/login'
    }
    await Promise.reject(await response.json())
  }
}).catch((e) => {
  toast('Error', {
    description: 'Failed to get user profile',
    duration: 1000,
    cardProps: {
      color: 'error'
    }
  })
  console.log(e)
})

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
  <VSonner />
  <v-card
    class="profile-card"
    :elevation="10"
  >
    <div class="profile-card-content">
      <v-img
        :src="user?.avatarUrl"
        height="200"
        width="200"
      />
      <h1 class="user-name">
        {{ user?.username }}
      </h1>
      <UserBadges :roles="user?.roles" />
      <span class="user-id" v-if="user?.id != null">
      <v-icon>mdi-account</v-icon>
      uid: {{ user?.id }}
    </span>
      <p class="user-email" v-if="user?.email != null">
        <v-icon>mdi-email</v-icon>
        <a :href="'mailto:' + user?.email">{{ user?.email }}</a>
        <v-icon>mdi-warning</v-icon>
      </p>
    </div>
  </v-card>
  <v-btn
    color="primary"
    @click="logout"
  >
    Logout
  </v-btn>
</template>

<style scoped>
.profile-card {
  margin: 20px;
  width: 300px;
}

.user-name {
  text-align: center;
  font-size: 2em;
  margin: 0;
  padding: 0;
  font-weight: bold;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
}

.user-email {
  a {
    color: inherit;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
}

.profile-card-content {
  padding: 16px;
}
</style>
