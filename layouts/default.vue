<script lang="ts" setup>
import '@mdi/font/css/materialdesignicons.css';
import {VSonner} from 'vuetify-sonner';
import {onMounted, ref} from 'vue';
import {useTheme} from 'vuetify';
import {useAppStore} from '~/store/app';
import '@/assets/main.css';
import LayoutHeader from '~/components/layout/Header.vue';
import LayoutFooter from '~/components/layout/footer.vue';

import {useI18n} from 'vue-i18n';

const localePath = useLocalePath();

const {t} = useI18n();

const theme = useTheme();
const ourTheme = ref<'light' | 'dark'>('light');
const appStore = useAppStore();
watch(
  () => appStore.theme,
  () => {
    console.log('[layouts/default] theme changed', appStore.theme);
    if (import.meta.client) {
      document.body.style.backgroundColor =
        theme.themes.value[appStore.theme]!.colors.background;
    }
  },
);
onMounted(() => {
  const colors: Record<string, string> =
    theme.themes.value[appStore.theme]!.colors;
  const css: string[] = [];
  let themeText = `[onMounted layouts/default] theme: ${theme.name.value} app: ${appStore.theme}\n`;
  ourTheme.value = appStore.theme;
  for (const key in colors) {
    themeText += `%c ${key} %c${colors[key]}`;
    css.push('color:unset;');
    css.push(`background:${colors[key]}`);
  }
  console.log(themeText, ...css);
});

function toggleTheme() {
  appStore.theme = appStore.theme === 'light' ? 'dark' : 'light';
  ourTheme.value = appStore.theme;
  if (import.meta.client) {
    document.body.style.backgroundColor =
      theme.themes.value[appStore.theme]!.colors.background;
  }
  appStore.save();
}

const localeHead = useLocaleHead({
  addSeoAttributes: {
    canonicalQueries: ['page', 'q'],
  },
});

import {useMessageStore} from '~/store/message'; // 确保路径正确
const messageStore = useMessageStore();
const { unreadCount, drawer} = storeToRefs(messageStore);

const messages = [
  {
    "id": 1,
    "subject": "Your Post Rejected",
    "message": "Your post https://redenmc.com/litematica/dd8ab23b-0f61-4eb9-850f-9c784623fc36 (Internal ID: 123) has been rejected, reason: no perm by Scorpio",
    "language": "en",
    "sent": false,
    "recalled": false,
    "read": false,
    "createdAt": 1737787279420,
    "readAt": null
  },
  {
    "id": 2,
    "subject": "你的稿件审核未通过",
    "message": "你的稿件 https://redenmc.com/litematica/2033d77a-0d7c-480d-b454-31239e309fbc (内部ID：205) 未通过审核，原因：no perm by Scorpio",
    "language": "zh_cn",
    "sent": false,
    "recalled": false,
    "read": false,
    "createdAt": 1737787353872,
    "readAt": null
  },
  {
    "id": 3,
    "subject": "你的稿件审核未通过",
    "message": "你的稿件 https://redenmc.com/litematica/3ca30d3c-d9a7-4a11-bb0a-f75ce5cbd068 (内部ID：368) 未通过审核，原因：no perm by Scorpio",
    "language": "zh_cn",
    "sent": false,
    "recalled": false,
    "read": false,
    "createdAt": 1737787947969,
    "readAt": null
  },

]

// 当前过滤器状态
let filter = ref('all');

// 记录当前悬停的item id
let hoveredItemId = ref(null);

// 计算属性：根据过滤器返回消息列表
const filteredMessages = computed(() => {
  if (filter.value === 'unread') {
    return messages.filter(m => !m.read);
  }
  return messages;
});

function reduceUnreadCount() {
  messageStore.decrementUnreadCount();
}

// 标记为已读
function markAsRead(message) {
  message.read = true;
  reduceUnreadCount();
}

// 鼠标进入事件处理函数
function onMouseEnter(id) {
  hoveredItemId.value = id;
}

// 鼠标离开事件处理函数
function onMouseLeave() {
  hoveredItemId.value = null;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toISOString().replace('T', ' ').slice(0, 19);
};

// 标记所有消息为已读
function markAllAsRead() {
  messages.forEach(message => {
    if (!message.read) {
      message.read = true;
      reduceUnreadCount();

    }
  });
}

let selectedMessage = ref<Object | null>(null);
const dialog = ref(false);

function showMessageDetailDialog(message: Object) {
  message.read = true
  selectedMessage.value = message;
  dialog.value = true
  reduceUnreadCount();

}
</script>

<template>
  <Html :lang="localeHead.htmlAttrs.lang">
  <Head>
    <template v-for="link in localeHead.link" :key="link.hid">
      <Link
        :id="link.hid"
        :href="link.href"
        :hreflang="link.hreflang"
        :rel="link.rel"
      />
    </template>
    <template v-for="meta in localeHead.meta" :key="meta.hid">
      <Meta
        :id="meta.hid"
        :content="meta.content"
        :property="meta.property"
      />
    </template>
  </Head>
  </Html>
  <v-app :theme="ourTheme">
    <layout-header>
      <template #desktop-append>
        <v-btn
          :icon="
            appStore.theme === 'light'
              ? 'mdi-weather-night'
              : 'mdi-weather-sunny'
          "
          title="Toggle Theme"
          @click="toggleTheme"
        />
      </template>
      <template #mobile-menu-append>
        <v-list-item
          :prepend-icon="
            appStore.theme === 'light'
              ? 'mdi-weather-night'
              : 'mdi-weather-sunny'
          "
          @click="toggleTheme"
        >
          <v-list-item-title>
            {{ appStore.theme === 'light' ? 'Light Mode' : 'Dark Mode' }}
          </v-list-item-title>
        </v-list-item>
      </template>
    </layout-header>

    <VSonner :expand="true" :position="'top-right'"/>
    <v-main class="router" style="--v-layout-top: 64px">
      <slot/>
    </v-main>

    <v-navigation-drawer
      v-model="drawer"
      location="right"
      temporary
      width="512"
    >
      <v-card-title>{{ t('message.list_title') }}</v-card-title>
      <v-divider></v-divider>

      <v-container>
        <!-- 过滤选项和全部已读按钮 -->
        <div style="display: flex; align-items: center; justify-content: space-between">
          <v-tabs>
            <v-tab @click="filter = 'all'">{{ t('message.all') }}</v-tab>
            <v-tab @click="filter = 'unread'">{{ t('message.unread') }}</v-tab>
          </v-tabs>
          <v-btn variant="text" color="primary" @click="markAllAsRead" style="margin-left: 16px;">
            {{ t('message.all_read') }}
          </v-btn>
        </div>

        <!-- 消息列表 -->
        <v-list dense>
          <v-list-item v-for="message in filteredMessages" :key="message.id"
                       @mouseenter="onMouseEnter(message.id)"
                       @mouseleave="onMouseLeave()"
                       class="message-item cursor-pointer"
                       @click="showMessageDetailDialog(message)"
          >
            <template v-slot:prepend>
              <v-icon>{{ message.read ? 'mdi-email-open' : 'mdi-email' }}</v-icon>
            </template>
            <div style="flex: 1;">
              <div class="message-header">
                <v-list-item-title class="text-truncate">{{ message.subject }}</v-list-item-title>
                <span class="text-blue cursor-pointer" v-if="!message.read && hoveredItemId === message.id"
                      @click.stop="markAsRead(message)">{{ t('message.mark_as_read') }}</span>
              </div>
              <v-list-item-subtitle>
                <div class="text-truncate-2lines">{{ message.message }}</div>
                <div class="text-right mt-1" style="color: #000000">{{ formatDate(message.createdAt) }}</div>
              </v-list-item-subtitle>
            </div>
          </v-list-item>
        </v-list>
      </v-container>
    </v-navigation-drawer>

    <!-- 对话框组件 -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-toolbar color="primary" dark>
          <v-toolbar-title>{{ selectedMessage.subject }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <div class="message-content">{{ selectedMessage.message }}</div>
          <div class="text-right mt-2">{{ formatDate(selectedMessage.createdAt)}}</div>

        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" color="primary" @click="dialog = false">{{ t("$vuetify.close") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <layout-footer/>
  </v-app>
</template>

<style scoped>
/* 自定义样式 */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-truncate-2lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: auto;
}

.message-item:hover {
}
</style>
