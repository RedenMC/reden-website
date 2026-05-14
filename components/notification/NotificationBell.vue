<template>
  <v-btn
    icon
    :title="t('message.list_title')"
    @click="messageStore.toggleDrawer()"
  >
    <v-badge
      v-if="messageStore.unreadCount > 0"
      :content="messageStore.unreadCount"
      :max="99"
      color="error"
      floating
    >
      <v-icon>mdi-bell</v-icon>
    </v-badge>
    <v-icon v-else>mdi-bell</v-icon>
  </v-btn>
</template>

<script lang="ts" setup>
import { useMessageStore } from '~/store/message';

const { t } = useI18n();
const messageStore = useMessageStore();
</script>
