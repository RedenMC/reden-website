<script lang="ts" setup>

import {doFetchGet, Profile} from "@/constants";
import {ref} from "vue";
import {toast, VSonner} from "vuetify-sonner";
import UserBadges from "@/components/UserBadges.vue";
import {useAppStore} from "@/store/app";
import VerifyMinecraft from "@/components/VerifyMinecraft.vue";

let user = ref<Profile>()

// oauth login csrf token is not passed by json, but by query string
const queries = window.location.search.substring(1).split('&');
const csrf = queries.find(str => str.startsWith('csrf_token='))?.substring(11)
if (csrf) {
  useAppStore().setCsrfToken(csrf)
  history.pushState({}, document.title, window.location.pathname + window.location.hash)
  console.log('csrf', csrf)
}

function fetchUser() {
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
}

fetchUser()

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
  <v-card
    :elevation="10"
    class="profile-card"
  >
    <div class="profile-card-content">
      <div class="user-avatar-border">
        <v-avatar
          :image="user?.avatarUrl"
          :size="200"
        />
      </div>
      <h1 class="user-name">
        {{ user?.username }}
      </h1>
      <UserBadges :roles="user?.roles"/>
      <p v-if="user?.id != null" class="user-id">
        <v-icon>mdi-account</v-icon>
        uid: {{ user?.id }}
      </p>
      <p v-if="user?.email != null" class="user-email">
        <v-icon>mdi-email</v-icon>
        <a :href="'mailto:' + user?.email">{{ user?.email }}</a>
        <v-icon>mdi-warning</v-icon>
      </p>
      <VerifyMinecraft :user="user"/>
      <p class="user-github">
        <v-icon>mdi-github</v-icon>
        <span v-if="user?.githubId != null">
          <a :href="'//github.com/' + user.githubId">     {{ user!.githubId }} </a>
        </span>
        <span v-else>
          Account not linked
          <a
            href="/api/oauth/github?redirect_url=/home"
          >
            Link Now
          </a>
        </span>
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

a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.profile-card-content {
  padding: 16px;
}

.user-avatar-border {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
