<script lang="ts" setup>
import {doFetchGet, fetchUser, Profile} from "@/constants";
import {ref} from "vue";
import {toast} from "vuetify-sonner";

const user = ref<Profile>()
fetchUser(user)
type OAuthAccount = {
  type: string
  id: string
  email: string
  name?: string
}
const microsoft = ref<OAuthAccount>()
const github = ref<OAuthAccount>()
doFetchGet("/api/account/microsoft").then(res => {
  if (res.ok) {
    res.json().then((data: OAuthAccount) => {
      microsoft.value = data
    })
  } else {
    console.error(res)
    toast('Error', {
      description: 'Failed to get Microsoft account',
      duration: 10000,
      cardProps: {
        color: 'error'
      }
    })
  }
})
doFetchGet("/api/account/github").then(res => {
  if (res.ok) {
    res.json().then((data: OAuthAccount) => {
      github.value = data
    })
  } else {
    console.error(res)
    toast('Error', {
      description: 'Failed to get GitHub account',
      duration: 10000,
      cardProps: {
        color: 'error'
      }
    })
  }
})

</script>

<template>
  <v-card
    v-if="user"
    class="setting-section-card"
    rounded="lg"
  >
    <h3 class="setting-section-title">
      Basic Information
    </h3>
    <v-row>
      <v-col>
        <p class="setting-label">
          Email
        </p>
        <p class="setting-description">
          This is the email you use to register and reset your password.
        </p>
      </v-col>
      <v-col>
        <v-text-field
          v-model="user.email"
          class="setting-input"
          color="primary"
          type="email"
        >
          <template #prepend>
            <v-icon>mdi-email</v-icon>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
  </v-card>
  <v-card
    class="setting-section-card"
    rounded="lg"
  >
    <h3 class="setting-section-title">
      Third Party Accounts
    </h3>
  </v-card>
</template>

<style scoped>
.setting-label {
  font-size: 1.2rem;
  font-weight: 500;

  min-width: 250px;
}

.setting-input {
  min-width: 250px;
}

.setting-section-card {
  margin: 20px auto;
  padding: 20px;

  max-width: 900px;
}

.setting-section-title {
  font-size: 1.5rem !important;
  font-weight: 500;
  padding: 0;
  margin: 0 0 10px;
}
</style>
