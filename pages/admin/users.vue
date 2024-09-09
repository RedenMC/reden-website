<script lang="ts" setup>
import { ref } from 'vue';
import {
  doFetchGet,
  type ErrorResponse,
  type Profile,
  toastError,
} from '~/utils/constants';
import UserBadges from '~/components/UserBadges.vue';
import AdminEditUserButton from '~/components/admin/AdminEditUserButton.vue';
import AdminBanUserButton from '~/components/admin/AdminBanUserButton.vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import clientOnly from '#app/components/client-only';

const router = useRouter();
type Parameter = {
  search: string;
  pageSize: string;
  page: string;
  sort: string;
  order: 'asc' | 'desc';
};
const query = { ...useRoute().query } as Parameter;
const page = ref(Number(query.page) || 1);
const pageSize = ref(Number(query.pageSize) || 10);
const totalItems = ref(10000000); // use a very large number to avoid reload
const serverItems = ref<Profile[]>([]);
const loading = ref(false);
const search = ref(query.search || '');
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
  if (import.meta.client) {
    loading.value = true;
    console.log(options);
    const parameters: Parameter = {
      page: String(options.page),
      search: search.value || '',
      pageSize: String(options.itemsPerPage),
      sort: options.sortBy[0]?.key || '',
      order: options.sortBy[0]?.order || '',
    };
    router.replace({ query: parameters });
    console.log(parameters);
    const response = await doFetchGet(`/api/admin/user/list`, parameters);
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
  }
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
    v-model:page="page"
    :headers="headers"
    :items="serverItems"
    :items-length="totalItems"
    :items-per-page-options="[10, 20, 50, 100]"
    :loading="loading"
    :search="search"
    :sort-by="[{ key: query.sort, order: query.order }]"
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
