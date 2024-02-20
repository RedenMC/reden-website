<script setup lang="ts">
import {ref} from "vue";
import {doFetchGet, Profile} from "@/constants";
import {useAppStore} from "@/store/app";
import {toast} from "vuetify-sonner";
import UserBadges from "@/components/UserBadges.vue";
import VerifyMinecraft from "@/components/VerifyMinecraft.vue";

let user = ref<Profile>()

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
</script>
<template>
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
        <a class="link" :href="'mailto:' + user?.email"> {{ user?.email }} </a>
        <v-icon>mdi-warning</v-icon>
      </p>
      <VerifyMinecraft :user="user"/>
      <p class="user-github">
        <v-icon>mdi-github</v-icon>
        <span v-if="user?.githubId != null">
          <a class="link" :href="'//github.com/' + user.githubId"> {{ user!.githubId }} </a>
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
      <v-row>
        <v-col>
          <v-btn
              color="primary"
              href="/home/edit"
              rounded="lg"
              variant="outlined"
          >
            Edit Profile
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-card>
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

p {
  color: #cccccc;
}

a.link {
  color: #cccccc;
  text-decoration: none;
  transition: all 0.5s;
}

a:hover.link {
  color: #eeeeee;
  text-decoration: underline;
  transition: all 0.5s;
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