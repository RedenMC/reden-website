<template>
  <v-navigation-drawer
    v-model="messageStore.drawer"
    location="right"
    temporary
    width="420"
  >
    <v-card-title class="d-flex align-center">
      {{ t('message.list_title') }}
      <v-spacer />
      <v-btn
        v-if="messageStore.unreadCount > 0"
        size="small"
        variant="text"
        color="primary"
        @click="handleMarkAllRead"
      >
        {{ t('message.all_read') }}
      </v-btn>
    </v-card-title>
    <v-divider />

    <v-tabs v-model="filter" density="compact" grow>
      <v-tab value="all">{{ t('message.all') }}</v-tab>
      <v-tab value="unread">{{ t('message.unread') }}</v-tab>
    </v-tabs>
    <v-divider />

    <div v-if="messageStore.loading" class="d-flex justify-center pa-4">
      <v-progress-circular indeterminate />
    </div>

    <template v-else>
      <v-list v-if="displayedNotifications.length > 0" lines="two">
        <v-list-item
          v-for="notification in displayedNotifications"
          :key="notification.id"
          :class="{ 'bg-grey-lighten-4': !notification.read }"
          @click="openDetail(notification)"
          @mouseenter="hoveredId = notification.id"
          @mouseleave="hoveredId = null"
        >
          <template #prepend>
            <v-icon :color="notification.read ? undefined : 'primary'">
              {{ notification.read ? 'mdi-email-open-outline' : 'mdi-email-outline' }}
            </v-icon>
          </template>

          <v-list-item-title class="font-weight-medium">
            {{ notification.subject }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <span class="text-truncate-2lines">{{ stripHtml(notification.message) }}</span>
          </v-list-item-subtitle>

          <template #append>
            <div class="d-flex flex-column align-end">
              <span class="text-caption text-grey">{{ timeSince(notification.createdAt) }}</span>
              <v-btn
                v-if="!notification.read && hoveredId === notification.id"
                size="x-small"
                variant="text"
                color="primary"
                class="mt-1"
                @click.stop="handleMarkRead(notification.id)"
              >
                {{ t('message.mark_as_read') }}
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>

      <v-card-text v-else class="text-center text-grey pa-8">
        <v-icon size="48" color="grey">mdi-bell-off-outline</v-icon>
        <p class="mt-2">{{ t('message.no_notifications') }}</p>
      </v-card-text>
    </template>

    <template v-if="displayedNotifications.length > 0 && !messageStore.loading">
      <v-divider />
      <v-card-actions class="justify-center">
        <v-btn
          variant="text"
          color="primary"
          :to="localePath('/home/notifications')"
          @click="messageStore.drawer = false"
        >
          {{ t('message.view_all') }}
        </v-btn>
      </v-card-actions>
    </template>
  </v-navigation-drawer>

  <!-- 通知详情 Dialog -->
  <v-dialog v-model="detailOpen" max-width="560">
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
</template>

<script lang="ts" setup>
import { timeSince } from '~/utils/constants';
import type { NotificationDto } from '~/utils/notifications';
import { useMessageStore } from '~/store/message';

const { t } = useI18n();
const localePath = useLocalePath();
const messageStore = useMessageStore();

const filter = ref<'all' | 'unread'>('all');
const hoveredId = ref<number | null>(null);
const detailOpen = ref(false);
const selectedNotification = ref<NotificationDto | null>(null);

const displayedNotifications = computed(() => {
  const list = messageStore.notifications;
  if (filter.value === 'unread') {
    return list.filter((n) => !n.read);
  }
  return list;
});

watch(
  () => messageStore.drawer,
  (open) => {
    if (open) {
      messageStore.fetchNotifications(1, 10);
    }
  },
);

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
  await messageStore.markAllAsRead();
}
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
