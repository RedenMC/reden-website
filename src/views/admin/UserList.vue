<script lang="ts" setup>
import { Ref, ref } from 'vue';
import { doFetchGet, ErrorResponse, Profile, toastError } from '@/constants';
import UserBadges from '@/components/UserBadges.vue';
import AdminEditUserButton from '@/views/admin/AdminEditUserButton.vue';
import AdminBanUserButton from '@/views/admin/AdminBanUserButton.vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const page = ref(Number(useRoute().query.page) || 1);
const pageSize = ref(10);
const totalItems = ref(10000000); // use a very large number to avoid reload
const serverItems: Ref<Profile[]> = ref([]);
const loading = ref(false);
const search = ref();
const { locale } = useI18n();

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
  const response = await doFetchGet(
    `/api/admin/user/list?page=${options.page}&pageSize=${options.itemsPerPage}&sort=${options.sortBy[0]?.key || ''}&order=${options.sortBy[0]?.order || ''}&search=${search.value || ''}`,
  );
  if (response.ok) {
    const data: {
      users: Profile[];
      total: number;
    } = await response.json();
    totalItems.value = data.total;
    serverItems.value = data.users;
  } else {
    const error: ErrorResponse = await response.json();
    await toastError(error);
  }
  loading.value = false;
  // console.log('before router.push')
  router.replace({ query: { page: options.page, search: search.value } });
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

console.log('router page', router.currentRoute.value.query.page);
</script>

<template>
  <v-data-table-server
    v-model:items-per-page="pageSize"
    v-model:page="page"
    :headers="headers"
    :items="serverItems"
    :items-length="totalItems"
    :items-per-page-options="[10, 20, 50, 100]"
    :loading="loading"
    :search="search"
    item-value="name"
    @update:options="loadItems"
  >
    <template v-slot:loading>
      <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
    </template>
    <template #top>
      <v-card border elevation="0">
        <v-btn color="primary">
          Create

          <v-dialog activator="parent">
            <v-card>
              <v-card-title>New User</v-card-title>
              <v-form @submit="(e) => console.log(e)">
                <!-- username -->
                <!-- email -->
                <!-- password -->
              </v-form>
            </v-card>
          </v-dialog>
        </v-btn>
      </v-card>
    </template>
    <template #[`item.lastLoginTime`]="{ value }">
      <v-tooltip location="bottom" text="Based on your timezone">
        <template #activator="{ props }">
          <span v-bind="props">
            {{ value ? new Date(value).toLocaleString() : 'Never logged in' }}
          </span>
        </template>
      </v-tooltip>
    </template>
    <template #[`item.lastLoginIp`]="{ item, value }">
      <span title="">
        {{ value }}
        <template v-if="locale === 'zh_CN'">
          <br />
          {{ item.mmRecord?.country_zh ?? item.mmRecord?.country }}
          {{ item.mmRecord?.subdivision_zh ?? item.mmRecord?.subdivision }}
          {{ item.mmRecord?.city_zh ?? item.mmRecord?.city }}
        </template>
      </span>
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
      <router-link :to="`/user/${item.id}`" class="username">
        <v-avatar :image="item.avatarUrl" />
        {{ item.username }}
      </router-link>
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
