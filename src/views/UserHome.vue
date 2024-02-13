<script setup lang="ts">

import {doFetchGet} from "@/constants";
import {ref} from "vue";
import {toast} from "vuetify-sonner";

type Profile = {
  username: string
  email: string
  id: number
  avatarUrl: string
}
let user = ref<Profile>()
doFetchGet('/api/account/profile').then(async response => {
  if (response.ok) {
    user.value = await response.json()
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
    class="profile-card user-card"
    :elevation="10"
    >
    <v-img
      :src="user?.avatarUrl"
      height="200"
      width="200"
      />
    <h1 class="user-name">
      {{user?.username}}
    </h1>
    <span class="user-id" v-if="user?.id != null">
      <v-icon>mdi-account</v-icon>
      uid: {{user?.id}}
    </span>
    <p class="user-email" v-if="user?.email != null">
      <v-icon>mdi-email</v-icon>
      {{user?.email}}
      <v-icon>mdi-warning</v-icon>
    </p>
  </v-card>
<pre>
  {{JSON.stringify(user, null, 2)}}
</pre>
</template>

<style scoped>
.profile-card {
  margin: 20px;
}

.user-card {
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
</style>
