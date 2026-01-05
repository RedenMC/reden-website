<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

definePageMeta({
  needLogin: true,
});

interface Notification {
  id: number;
  subject: string;
  message: string;
  read: boolean;
  createdAt: number;
  readAt: number | null;
}

interface NotificationList {
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
}

const { t } = useI18n();
const loading = ref(false);
const notifications = ref<Notification[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 10;

useHead({
  title: t('notifications.title'),
  titleTemplate: '%s - Reden',
});

const fetchNotifications = async () => {
  loading.value = true;
  try {
    const { data } = await useFetch<NotificationList>(
      `/api/account/notifications/all?page=${page.value}&size=${pageSize}`,
    );
    if (data.value) {
      notifications.value = data.value.notifications;
      total.value = data.value.total;
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  } finally {
    loading.value = false;
  }
};

const markAsRead = async (id: number) => {
  try {
    await $fetch(`/api/account/notifications/${id}/read`, { method: 'POST' });
    const notif = notifications.value.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      notif.readAt = Date.now();
    }
  } catch (error) {
    console.error('Failed to mark as read:', error);
  }
};

const markAllAsRead = async () => {
  try {
    await $fetch('/api/account/notifications/read-all', { method: 'POST' });
    notifications.value.forEach((n) => {
      n.read = true;
      n.readAt = Date.now();
    });
  } catch (error) {
    console.error('Failed to mark all as read:', error);
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const totalPages = computed(() => Math.ceil(total.value / pageSize));

watch(page, () => {
  fetchNotifications();
});

onMounted(() => {
  fetchNotifications();
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-bell</v-icon>
              <span>{{ $t('notifications.title') }}</span>
            </div>
            <v-btn
              v-if="notifications.some((n) => !n.read)"
              color="primary"
              size="small"
              variant="outlined"
              @click="markAllAsRead"
            >
              {{ $t('notifications.markAllRead') }}
            </v-btn>
          </v-card-title>

          <v-card-text v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="64" />
          </v-card-text>

          <v-card-text v-else-if="notifications.length === 0" class="text-center py-8">
            <v-icon size="64" color="grey">mdi-bell-off</v-icon>
            <p class="mt-4 text-body-1">{{ $t('notifications.empty') }}</p>
          </v-card-text>

          <v-list v-else>
            <v-list-item
              v-for="notification in notifications"
              :key="notification.id"
              :class="{ 'unread-notification': !notification.read }"
              @click="!notification.read && markAsRead(notification.id)"
            >
              <template #prepend>
                <v-icon
                  :color="notification.read ? 'grey' : 'primary'"
                  size="large"
                >
                  {{
                    notification.read ? 'mdi-email-open' : 'mdi-email'
                  }}
                </v-icon>
              </template>

              <v-list-item-title>{{ notification.subject }}</v-list-item-title>
              <v-list-item-subtitle>
                <div class="notification-message">{{ notification.message }}</div>
              </v-list-item-subtitle>
              
              <template #append>
                <div class="text-caption text-right">
                  {{ formatDate(notification.createdAt) }}
                </div>
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
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.unread-notification {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.notification-message {
  margin-top: 8px;
  white-space: pre-wrap;
}

.v-list-item {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  cursor: pointer;
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
}

.v-list-item:last-child {
  border-bottom: none;
}
</style>
