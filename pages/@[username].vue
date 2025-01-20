<script lang="ts" setup>
import UserProfileCard from '@/components/UserProfileCard.vue';
import UserContentPanel from '@/components/profile/UserContentPanel.vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';

const route = useRoute();
const { t } = useI18n();

const { data: user, error } = await useFetchUserGet(
  route.params.username as string
);

useHead({
  title: `${user?.value?.username ?? t('reden.user_not_found')} - Reden`,
});

watch(user, () => {
  useHead({
    title: `${user?.value?.username ?? t('reden.user_not_found')} - Reden`,
  });
});

const machines = ref<any[]>([]);

const loadMachines = async () => {
  if (!user.value?.username) return;

  try {
    const response = await fetch(
      `/api/mc-services/litematica/by-author?author=${user.value.username}`
    );
    const data = await response.json();

    if (data.hits) {
      machines.value = Object.values(data.hits).map((machine: any) => ({
        key: machine.key,
        name: machine.name,
        summary: machine.summary,
        downloads: machine.downloads,
      }));
    }
  } catch (error) {
    console.error('Failed to load machines:', error);
  }
};

loadMachines();
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
      <UserProfileCard v-show="user" :can-edit="false" :user="user" />
      <UserContentPanel :machines="machines" />
    </div>
  </v-card>
</template>

<style scoped>
.user-profile-container {
  display: flex;
  gap: 4%;
  padding: 20px;
}

.user-profile-container > .profile-card {
  flex: 1;
  max-width: 20%;
}

.user-profile-container > .user-content-panel {
  flex: 4;
  max-width: 76%;
}
</style>
