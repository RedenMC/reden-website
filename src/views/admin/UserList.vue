<script lang="ts" setup>
import { Ref, ref } from 'vue';
import { doFetchGet, ErrorResponse, Profile, toastError } from '@/constants';
import UserBadges from '@/components/UserBadges.vue';
import AdminEditUserButton from '@/views/admin/AdminEditUserButton.vue';
import AdminBanUserButton from '@/views/admin/AdminBanUserButton.vue';
import { useRouter } from 'vue-router';

const pageSize = ref(20);
const totalItems = ref(0);
const serverItems: Ref<Profile[]> = ref([]);
const loading = ref(false);
const search = ref('');
const router = useRouter();

async function loadItems(options: {
  page: number;
  itemsPerPage: number;
  sortBy: {
    key: string;
    order: 'asc' | 'desc';
  }[];
  sortDesc: boolean;
}) {
  loading.value = true;
  console.log(options);
  router.push({ query: { page: options.page, search: search.value } });
  const response = await doFetchGet(
    `/api/admin/user/list?page=${options.page}&pageSize=${options.itemsPerPage}&sort=${options.sortBy[0]?.key}&order=${options.sortBy[0]?.order}&search=${search.value}`,
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
  { title: 'Actions', key: 'actions', sortable: false, minWidth: '150px' },
];

function isBanned(user: Profile) {
  return (user.bannedUntil || 0) > Date.now();
}
</script>

<template>
  <v-data-table-server
    v-model:items-per-page="pageSize"
    :page="Number(router.currentRoute.value.query.page) || 1"
    :headers="headers"
    :items="serverItems"
    :items-length="totalItems"
    :items-per-page-options="[10, 20, 50, 100]"
    :loading="loading"
    :search="search"
    item-value="name"
    @update:options="loadItems"
  >
    <template #[`item.lastLoginTime`]="{ value }">
      <v-tooltip text="Based on your timezone" location="bottom">
        <template #activator="{ props }">
          <span v-bind="props">
            {{ value ? new Date(value).toLocaleString() : 'Never logged in' }}
          </span>
        </template>
      </v-tooltip>
    </template>
    <template #[`item.roles`]="{ value }">
      <user-badges :roles="value" />
    </template>
    <template #[`item.bannedUntil`]="{ item }">
      <v-chip
        v-if="isBanned(item)"
        :text="`Banned until ${new Date(item.bannedUntil ?? 0).toLocaleString()}, ${item.bannedReason}`"
        color="error"
      />
      <v-chip v-else color="success" text="Not Banned" />
    </template>
    <template #[`item.username`]="{ item }">
      <a :href="`/user/${item.id}`" class="username">
        <v-avatar :image="item.avatarUrl" />
        {{ item.username }}
      </a>
    </template>
    <template #[`item.actions`]="{ item }">
      <AdminEditUserButton :item="item" />
      <AdminBanUserButton :item="item" />
    </template>
  </v-data-table-server>
</template>

<style scoped>
.username {
  font-size: 1.3rem;
  text-decoration: none;
  color: currentColor;
}

.username:hover {
  transition: all 0.5s;
  color: #66ccff;
  text-decoration: underline;
}
</style>
