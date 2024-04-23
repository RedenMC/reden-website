<script lang="ts" setup>
import { doFetchGet, fetchUser, Profile, toastError } from '@/constants';
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
</script>

<template>
  <div class="d-flex flex-wrap flex-row w-100">
    <div>
      <v-skeleton-loader
        v-show="loading"
        type="card-avatar"
        width="300"
      ></v-skeleton-loader>
      <UserProfileCard v-show="!loading" :user="user" :apply-preference="false">
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
    </div>
    <v-timeline>
      <v-timeline-item
        v-for="event in [
          {
            id: 1,
            title: 'Title',
            subtitle: 'Subtitle',
            subtitle2: 'Subtitle 2',
            description: 'Description',
            color: 'primary',
            icon: 'mdi-account',
          },
          {
            id: 2,
            title: 'Title',
            subtitle: 'Subtitle',
            subtitle2: 'Subtitle 2',
            description: 'Description',
            color: 'primary',
            icon: 'mdi-account',
          },
        ]"
        :key="event.id"
        :color="event.color"
        :icon="event.icon"
        :title="event.title"
        :subtitle="event.subtitle"
        :subtitle-2="event.subtitle2"
      >
        <template #opposite>
          <v-card>
            <v-card-title>{{ event.title }}</v-card-title>
            <v-card-text>{{ event.description }}</v-card-text>
            <template #actions>
              <v-btn color="primary">Action</v-btn>
            </template>
          </v-card>
        </template>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>

<style scoped></style>
