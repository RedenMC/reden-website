<script setup lang="ts">
import { Ref, ref } from 'vue';
import { doFetchGet, ErrorResponse, Profile, toastError } from '@/constants';
import UserBadges from '@/components/UserBadges.vue';

const pageSize = ref(20);
const totalItems = ref(0);
const serverItems: Ref<Profile[]> = ref([]);
const loading = ref(false);
const search = ref('');
async function loadItems(options: {
  page: number;
  itemsPerPage: number;
  sortBy: string[];
  sortDesc: boolean;
}) {
  loading.value = true;
  const response = await doFetchGet(
    `/api/admin/user/list?page=${options.page}&pageSize=${options.itemsPerPage}&sort=${options.sortBy[0]}&order=${options.sortDesc ? 'desc' : 'asc'}&search=${search.value}`,
  );
  if (response.ok) {
    const data: {
      users: Profile[];
      total: number;
    } = await response.json();
    serverItems.value = data.users;
    totalItems.value = data.total;
  } else {
    const error: ErrorResponse = await response.json();
    await toastError(error);
  }
  loading.value = false;
}
const headers = [
  { title: 'UID', key: 'id' },
  { title: 'Username', key: 'username' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'roles' },
  { title: 'Last Login IP', key: 'lastLoginIp' },
  { title: 'Last Login Time', key: 'lastLoginTime' },
  { title: 'Banned', key: 'bannedUntil' },
  { title: 'Actions', key: 'actions', sortable: false },
];

function isBanned(user: Profile) {
  return (user.bannedUntil || 0) > Date.now();
}
</script>

<template>
  <v-data-table-server
    v-model:items-per-page="pageSize"
    :headers="headers"
    :items-length="totalItems"
    :items="serverItems"
    :items-per-page-options="[10, 20, 50, 100]"
    :loading="loading"
    :search="search"
    item-value="name"
    @update:options="loadItems"
  >
    <template #[`item.lastLoginTime`]="{ value }">
      {{ value ? new Date(value) : 'Never logged in' }}
    </template>
    <template #[`item.roles`]="{ value }">
      <user-badges :roles="value" />
    </template>
    <template #[`item.bannedUntil`]="{ item }">
      <v-chip
        v-if="isBanned(item)"
        color="error"
        :text="`Banned until ${new Date(item.bannedUntil ?? 0).toLocaleString()}, ${item.bannedReason}`"
      />
      <v-chip v-else color="success" text="Not Banned" />
    </template>
    <template #[`item.username`]="{ item }">
      <a class="username" :href="`/user/${item.id}`">
        <v-avatar :image="item.avatarUrl" />
        {{ item.username }}
      </a>
    </template>
  </v-data-table-server>
</template>

<style scoped>
.username {
  font-size: 1.3rem;
  text-decoration: none;
  color: #dddddd;
}

.username:hover {
  transition: all 0.5s;
  color: #66ccff;
  text-decoration: underline;
}
</style>
