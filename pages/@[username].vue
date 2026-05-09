<script lang="ts" setup>
import UserProfileCard from '~/components/profile/UserProfileCard.vue';
import UserContentPanel from '@/components/profile/UserContentPanel.vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { ListLitematicaResponse } from '~/pages/litematica/index.vue';
import '~/components/profile/user-card-wrap.css';

import { useAppStore } from '~/store/app';
import { useGoTo } from 'vuetify';

const route = useRoute();
const { t } = useI18n();
const appStore = useAppStore();

const {
  data: user,
  error,
  refresh,
} = await useFetchUserGet(route.params.username as string);

if (import.meta.client) {
  refresh();
}

useHead({
  title: user?.value
    ? t('reden.title.user_profile_seo', [user?.value.username])
    : t('reden.user_not_found'),
  titleTemplate: '%s - Reden User',
});

const goto = useGoTo();
const page = ref(1);
const sortType = useRouteQuery<'createdAt' | 'downloads'>('sort', 'createdAt');
watch(page, () => goto(0));
watch(sortType, () => {
  page.value = 1;
});
const { data: machines } = useFetch<ListLitematicaResponse>(
  () =>
    `/api/mc-services/litematica/by-author?author=${user.value?.username}&pageSize=12&page=${page.value}&order=${sortType.value}`,
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
  <template v-else>
    <v-row class="d-flex flex-wrap flex-row ma-1">
      <v-col class="user-card-wrap" cols="12" md="3">
        <UserProfileCard
          v-show="user"
          :can-edit="user.id === appStore.uid"
          :user="user"
        />
      </v-col>
      <v-col v-if="machines">
        <UserContentPanel
          v-model:page="page"
          v-model:sort="sortType"
          :machines="machines.d"
          :totalPages="Math.ceil(machines.count / 12)"
        />
      </v-col>
    </v-row>
  </template>
</template>
