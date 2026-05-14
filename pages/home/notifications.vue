<template>
  <v-container class="py-6" style="max-width: 800px">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 font-weight-bold">{{ t('message.list_title') }}</h1>
      <v-btn
        v-if="messageStore.unreadCount > 0"
        color="primary"
        variant="text"
        :loading="markingAllRead"
        @click="handleMarkAllRead"
      >
        {{ t('message.all_read') }}
      </v-btn>
    </div>

    <v-tabs v-model="filter" density="compact" class="mb-4">
      <v-tab value="all">{{ t('message.all') }}</v-tab>
      <v-tab value="unread">{{ t('message.unread') }}</v-tab>
    </v-tabs>

    <v-progress-linear
      v-if="messageStore.loading"
      indeterminate
      class="mb-4"
    />

    <template v-else>
      <v-card v-if="displayedNotifications.length > 0">
        <v-list lines="three">
          <v-list-item
            v-for="notification in displayedNotifications"
            :key="notification.id"
            :class="{ 'bg-grey-lighten-4': !notification.read }"
            @click="openDetail(notification)"
          >
            <template #prepend>
              <v-icon
                :color="notification.read ? undefined : 'primary'"
                size="24"
              >
                {{ notification.read ? 'mdi-email-open-outline' : 'mdi-email-outline' }}
              </v-icon>
            </template>

            <v-list-item-title class="font-weight-bold">
              {{ notification.subject }}
              <v-chip
                v-if="!notification.read"
                size="x-small"
                color="primary"
                variant="tonal"
                class="ml-2"
              >
                {{ t('message.unread') }}
              </v-chip>
            </v-list-item-title>

            <v-list-item-subtitle class="mt-1">
              <div class="text-body-2 text-truncate-2lines">{{ stripHtml(notification.message) }}</div>
              <div class="d-flex align-center justify-space-between mt-2">
                <span class="text-caption text-grey">
                  {{ formatDate(notification.createdAt) }}
                </span>
                <v-btn
                  v-if="!notification.read"
                  size="x-small"
                  variant="text"
                  color="primary"
                  @click.stop="handleMarkRead(notification.id)"
                >
                  {{ t('message.mark_as_read') }}
                </v-btn>
              </div>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-divider />

        <v-card-actions class="justify-center pa-4">
          <v-pagination
            v-if="totalPages > 1"
            v-model="page"
            :length="totalPages"
            :total-visible="5"
            @update:model-value="onPageChange"
          />
        </v-card-actions>
      </v-card>

      <v-card v-else class="pa-16 text-center">
        <v-icon size="64" color="grey">mdi-bell-off-outline</v-icon>
        <p class="text-h6 text-grey mt-4">{{ t('message.no_notifications') }}</p>
      </v-card>
    </template>

    <!-- 通知详情 Dialog -->
    <v-dialog v-model="detailOpen" max-width="640">
      <v-card v-if="selectedNotification">
        <v-card-title class="d-flex align-center">
          {{ selectedNotification.subject }}
          <v-spacer />
          <v-btn
            v-if="!selectedNotification.read"
            size="small"
            variant="text"
            color="primary"
            @click="markSelectedRead"
          >
            {{ t('message.mark_as_read') }}
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <div class="notification-body" v-html="selectedNotification.message" />
        </v-card-text>
        <v-divider />
        <v-card-text class="text-caption text-grey">
          {{ formatDate(selectedNotification.createdAt) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detailOpen = false">
            {{ t('$vuetify.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import type { NotificationDto } from '~/utils/notifications';
import { useMessageStore } from '~/store/message';

definePageMeta({ needLogin: true });

const { t } = useI18n();
const messageStore = useMessageStore();

const filter = ref<'all' | 'unread'>('all');
const page = ref(1);
const pageSize = 20;
const markingAllRead = ref(false);
const detailOpen = ref(false);
const selectedNotification = ref<NotificationDto | null>(null);

const displayedNotifications = computed(() => {
  const list = messageStore.notifications;
  if (filter.value === 'unread') {
    return list.filter((n) => !n.read);
  }
  return list;
});

const totalPages = computed(() => {
  if (filter.value === 'unread') {
    return 1;
  }
  return Math.max(1, Math.ceil(messageStore.total / pageSize));
});

watch(filter, () => {
  page.value = 1;
  if (filter.value === 'unread') {
    messageStore.fetchUnreadNotifications();
  } else {
    messageStore.fetchNotifications(1, pageSize);
  }
});

function onPageChange(newPage: number) {
  messageStore.fetchNotifications(newPage, pageSize);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

function openDetail(notification: NotificationDto) {
  selectedNotification.value = notification;
  detailOpen.value = true;
}

async function markSelectedRead() {
  if (!selectedNotification.value) return;
  await messageStore.markAsRead(selectedNotification.value.id);
  selectedNotification.value.read = true;
}

async function handleMarkRead(id: number) {
  await messageStore.markAsRead(id);
}

async function handleMarkAllRead() {
  markingAllRead.value = true;
  await messageStore.markAllAsRead();
  markingAllRead.value = false;
}

useHead({
  title: t('message.list_title'),
  titleTemplate: '%s - Reden',
});

onMounted(() => {
  messageStore.fetchNotifications(page.value, pageSize);
});
</script>

<style scoped>
.text-truncate-2lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.notification-body) {
  line-height: 1.7;
}

:deep(.notification-body a) {
  color: rgb(var(--v-theme-primary));
}
</style>
