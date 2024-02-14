<script setup lang="ts">

import {doFetchGet, Profile} from "@/constants";
import {ref} from "vue";
import {toast} from "vuetify-sonner";
import UserBadges from "@/components/UserBadges.vue";
import {useAppStore} from "@/store/app";

let roles: string[] = []
let user = ref<Profile>()

doFetchGet('/api/account/profile').then(async response => {
  if (response.ok) {
    const data: Profile = await response.json()
    roles = []
    if (data.isDeveloper) {
      roles?.push('developer')
    }
    if (data.isContributor) {
      roles?.push('contributor')
    }
    if (data.isStaff) {
      roles?.push('staff')
    }
    console.log('roles', roles)
    user.value = data
    useAppStore().updateCache(data)
  } else {
    console.log(response)
    await Promise.reject(response.json())
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
</script>

<template>
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
      <UserBadges :roles="roles" />
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
  <pre>
  {{ JSON.stringify(user, null, 2) }}
</pre>
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
