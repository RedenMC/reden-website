<script lang="ts" setup>
import {
  doFetchGet,
  doFetchPut,
  fetchUser,
  Profile,
  toastError,
} from '@/constants';
import { toast } from 'vuetify-sonner';
import { useAppStore } from '@/store/app';
import UserProfileCard from '@/components/UserProfileCard.vue';
import { ref } from 'vue';
import RedenRouter from '@/router/RedenRouter.vue';

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
const loading = ref(true);
fetchUser(user).then(() => (loading.value = false));

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

// webhook
const needInstallWebhook = ref(false);
doFetchGet('/api/account/activity').then((response) => {
  if (response.ok) {
    response.json().then((data) => {
      console.log(data);
    });
  } else {
    if (response.status === 412) {
      needInstallWebhook.value = true;
    } else if (response.status === 404) {
      // nothing
    } else {
      toastError(response);
    }
  }
});

function installWebhook() {
  doFetchPut('/api/github/reden-webhook', {})
    .then((response) =>
      response.ok ? response.json() : Promise.reject(response),
    )
    .then((data: { action: string; redirect?: string | null }) => {
      if (data.action === 'confirm' && data.redirect) {
        location.href = data.redirect;
      }
      console.log(data);
    })
    .catch((e) => toastError(e, 'Failed to update webhook'));
}
</script>

<template>
  <v-banner
    border
    :stacked="true"
    color="info"
    icon="mdi-information-variant"
    v-if="needInstallWebhook"
  >
    <v-banner-text>
      You have not installed the webhook yet. Please install the webhook to
      enable the activity tracking feature.
    </v-banner-text>
    <template #actions>
      <v-btn color="primary" @click="installWebhook">
        Install Webhook

        <v-dialog activator="parent">
          <v-card>
            <v-card-title>Install Webhook</v-card-title>
            <v-card-text> Redirecting... </v-card-text>
          </v-card>
        </v-dialog>
      </v-btn>
      <v-btn color="gray" @click="needInstallWebhook = false"> Dismiss </v-btn>
    </template>
  </v-banner>

  <div class="d-flex flex-wrap flex-row w-100">
    <div>
      <v-skeleton-loader
        v-show="loading"
        type="card-avatar"
        width="300"
      ></v-skeleton-loader>
      <UserProfileCard v-show="!loading" :apply-preference="false" :user="user">
        <template #actions>
          <v-row>
            <v-col>
              <reden-router to="/home/edit">
                <v-btn
                  class="text-none"
                  color="secondary"
                  href="/"
                  rounded="lg"
                  variant="outlined"
                >
                  Edit Profile
                </v-btn>
              </reden-router>
            </v-col>
          </v-row>
        </template>
      </UserProfileCard>
      <v-btn color="primary" @click="logout"> Logout </v-btn>
    </div>

    <div class="flex-column">
      <v-timeline> </v-timeline>
    </div>
  </div>
</template>

<style scoped></style>
