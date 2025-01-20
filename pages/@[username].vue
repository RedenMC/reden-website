<script lang="ts" setup>
import UserProfileCard from '@/components/UserProfileCard.vue';
import UserContentPanel from '@/components/profile/UserContentPanel.vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { ListLitematicaResponse } from '~/pages/litematica/index.vue';

const route = useRoute();
const { t } = useI18n();

const { data: user, error } = await useFetchUserGet(
  route.params.username as string,
);

useHead({
  title: `${user?.value?.username ?? t('reden.user_not_found')} - Reden`,
});

// watch(user, () => {
//   useHead({
//     title: `${user?.value?.username ?? t('reden.user_not_found')} - Reden`,
//   });
// });

const { data: machines } = useFetch(
  () => `/api/mc-services/litematica/by-author?author=${user.value?.username}`,
  {
    transform: (data: ListLitematicaResponse) => {
      return Object.values(data.d);
    },
  },
);
</script>

<template>
  <v-card v-if="!user">
    <v-card-title>
      <h1>Invalid User</h1>
    </v-card-title>
    <v-card-text>
      <p>
        Invalid user id:
        {{ route.params.username }}
      </p>
      <p>
        {{ error?.error }}
      </p>
    </v-card-text>
  </v-card>
  <v-card v-else>
    <v-alert v-show="!user" dismissible type="error">
      Cannot find user
    </v-alert>
    <div class="user-profile-container">
      <UserProfileCard
        class="user-profile-card"
        v-show="user"
        :can-edit="false"
        :user="user"
      />
      <UserContentPanel v-if="machines" :machines="machines" />
    </div>
  </v-card>
</template>

<style scoped>
.user-profile-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: visible;
}

.user-profile-card {
  max-width: 360px;
  flex-grow: 0;
}

@media (max-width: 968px) {
  .user-profile-container {
    flex-direction: column;
  }

  .user-profile-card {
    max-width: 100%;
    flex-grow: 1;
  }
}
</style>
