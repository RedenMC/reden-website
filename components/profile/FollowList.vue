<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();

interface User {
  uid: number;
  username: string;
  isFollowing: boolean;
}

interface FollowList {
  users: User[];
  total: number;
}

interface Props {
  userId: number;
  type: 'followers' | 'following';
}

const props = defineProps<Props>();
const list = ref<User[]>([]);
const total = ref(0);
const loading = ref(false);
const page = ref(1);
const pageSize = 20;

const fetchList = async () => {
  loading.value = true;
  try {
    const endpoint = props.type === 'followers' ? 'followers' : 'following';
    const { data } = await useFetch<FollowList>(
      `/api/user/follow/${endpoint}/${props.userId}?page=${page.value}&pageSize=${pageSize}`,
    );

    if (data.value) {
      list.value = data.value.users;
      total.value = data.value.total;
    }
  } catch (error) {
    console.error('Failed to fetch follow list:', error);
  } finally {
    loading.value = false;
  }
};

const toggleFollow = async (user: User) => {
  try {
    const method = user.isFollowing ? 'DELETE' : 'POST';
    await $fetch(`/api/user/follow/${user.uid}`, { method });
    user.isFollowing = !user.isFollowing;

    useNuxtApp().$toast?.success(
      user.isFollowing ? $t('follow.success') : $t('follow.unfollowSuccess'),
    );
  } catch (error) {
    console.error('Failed to toggle follow:', error);
    useNuxtApp().$toast?.error($t('follow.error'));
  }
};

const totalPages = computed(() => Math.ceil(total.value / pageSize));

watch(page, () => {
  fetchList();
});

onMounted(() => {
  fetchList();
});

const $t = (key: string) => {
  const i18n = useNuxtApp().$i18n;
  return i18n?.t(key) || key;
};
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">
          {{ type === 'followers' ? 'mdi-account-group' : 'mdi-account-heart' }}
        </v-icon>
        {{ $t(`follow.${type}`) }} ({{ total.toLocaleString() }})
      </v-card-title>

      <v-card-text v-if="loading && list.length === 0" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-card-text>

      <v-card-text v-else-if="list.length === 0" class="text-center py-8">
        <v-icon size="64" color="grey">mdi-account-off</v-icon>
        <p class="mt-4 text-body-1">{{ $t('follow.noUsers') }}</p>
      </v-card-text>

      <v-list v-else>
        <v-list-item
          v-for="user in list"
          :key="user.uid"
          :to="`/@${user.username}`"
        >
          <template #prepend>
            <v-avatar color="primary">
              <span class="text-h6">{{ user.username[0].toUpperCase() }}</span>
            </v-avatar>
          </template>

          <v-list-item-title>{{ user.username }}</v-list-item-title>

          <template #append>
            <v-btn
              v-if="appStore.logined && appStore.uid !== user.uid"
              :color="user.isFollowing ? 'default' : 'primary'"
              size="small"
              @click.prevent="toggleFollow(user)"
            >
              <v-icon v-if="user.isFollowing" start>mdi-account-check</v-icon>
              <v-icon v-else start>mdi-account-plus</v-icon>
              {{
                user.isFollowing ? $t('follow.unfollow') : $t('follow.follow')
              }}
            </v-btn>
          </template>
        </v-list-item>
      </v-list>

      <v-card-actions v-if="totalPages > 1" class="justify-center">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="7"
          rounded="circle"
        />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.v-list-item {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.v-list-item:last-child {
  border-bottom: none;
}
</style>
