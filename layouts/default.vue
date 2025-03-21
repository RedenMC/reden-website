<script lang="ts" setup>
import '@mdi/font/css/materialdesignicons.css';
import { VSonner } from 'vuetify-sonner';
import { onMounted, ref } from 'vue';
import { useTheme } from 'vuetify';
import { useAppStore } from '~/store/app';
import '@/assets/main.css';
import { globalTheme } from '@/utils/constants';
import LayoutHeader from '~/components/layout/Header.vue';
import LayoutFooter from '~/components/layout/footer.vue';

import { useI18n } from 'vue-i18n';

const localePath = useLocalePath();

const { t } = useI18n();

const theme = useTheme();
const appStore = useAppStore();
watch(globalTheme, () => {
  console.log('[layouts/default] theme changed', appStore.theme);
  if (import.meta.client) {
    document.body.style.backgroundColor =
      theme.themes.value[appStore.theme]!.colors.background;
  }
});
onMounted(() => {
  // 初始化未读消息数量
  messageStore.initMessageList();
  drawer.value = false;

  const colors: Record<string, string> =
    theme.themes.value[appStore.theme]!.colors;
  const css: string[] = [];
  let themeText = `[onMounted layouts/default] theme: ${theme.name.value} app: ${appStore.theme}\n`;
  globalTheme.value = appStore.theme;
  for (const key in colors) {
    themeText += `%c ${key} %c${colors[key]}`;
    css.push('color:unset;');
    css.push(`background:${colors[key]}`);
  }
  console.log(themeText, ...css);
});

function toggleTheme() {
  appStore.theme = appStore.theme === 'light' ? 'dark' : 'light';
  globalTheme.value = appStore.theme;
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

import { useMessageStore } from '~/store/message';

const messageStore = useMessageStore();
const drawer = ref(false);
const { drawer: storeDrawer } = storeToRefs(messageStore);
// 当 storeDrawer 变化时，更新 drawer 的值
watchEffect(() => {
  drawer.value = storeDrawer.value;
});

// 当前过滤器状态
let filter = ref('all');

// 计算属性：根据过滤器返回消息列表
const filteredMessages = computed(() => {
  if (filter.value === 'unread') {
    return messageStore.unreadMessages;
  }
  return messageStore.messages;
});

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toISOString().replace('T', ' ').slice(0, 19);
};

// 标记所有消息为已读
function markAllAsRead() {
  doFetchPost(`/api/account/notifications/read-all`, '').then((response) => {
    if (response.ok) {
      messageStore.initMessageList();
    } else {
      toastError(response);
    }
  });
}

// 标记当前消息为已读
function markAsRead(id: number) {
  doFetchPost(`/api/account/notifications/${id}/read`, '').then((response) => {
    if (response.ok) {
      messageStore.initMessageList();
    } else {
      toastError(response);
    }
  });
}

let selectedMessage = ref<Object | null>(null);
const dialog = ref(false);

function showMessageDetailDialog(message: any) {
  message.read = true;
  selectedMessage.value = message;
  dialog.value = true;
  markAsRead(message.id);
}

let page = 1;
let pageSize = 10;
let isFinish = ref(false);

// 加载消息
function loadMessages() {
  page++;
  doFetchGet(`/api/account/notifications/all?page=${page}&pageSize=${pageSize}`)
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        if (!data || data.length < pageSize) {
          isFinish.value = true;
        }
        messageStore.messages.push(...data);
      } else {
        console.error(
          'Failed to fetch all notifications:',
          response.statusText,
        );
      }
    })
    .catch((e) => toastError(e, 'Failed to fetch all notifications'));
}
</script>

<template>
  <Html :lang="localeHead.htmlAttrs.lang">
    <Head>
      <Meta content="38f365878eac2da0ab1c69a63a130ade" name="monetag" />
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
  <v-app :theme="globalTheme">
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

    <VSonner :expand="true" :position="'top-right'" />
    <v-main class="router" style="--v-layout-top: 64px">
      <slot />
    </v-main>

    <v-navigation-drawer
      v-model="drawer"
      v-show="drawer"
      location="right"
      temporary
      width="512"
    >
      <v-card-title>{{ t('message.list_title') }}</v-card-title>
      <v-divider></v-divider>

      <v-container>
        <!-- 过滤选项和全部已读按钮 -->
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <v-tabs>
            <v-tab @click="filter = 'all'">{{ t('message.all') }}</v-tab>
            <v-tab @click="filter = 'unread'">{{ t('message.unread') }}</v-tab>
          </v-tabs>
          <v-btn
            variant="text"
            color="primary"
            @click="markAllAsRead"
            style="margin-left: 16px"
          >
            {{ t('message.all_read') }}
          </v-btn>
        </div>

        <!-- 消息列表 -->
        <v-list dense>
          <v-infinite-scroll
            height="100%"
            :items="filteredMessages"
            @load="loadMessages"
            mode="manual"
          >
            <template v-for="(message, index) in filteredMessages" :key="index">
              <v-list-item
                class="message-item cursor-pointer"
                :class="{ 'unread-class': !message.read }"
                @click="showMessageDetailDialog(message)"
              >
                <template v-slot:prepend>
                  <v-icon>{{
                    message.read ? 'mdi-email-open' : 'mdi-email'
                  }}</v-icon>
                </template>
                <div style="flex: 1">
                  <div class="message-header">
                    <v-list-item-title class="text-truncate">{{
                      message.subject
                    }}</v-list-item-title>
                    <span
                      class="text-blue cursor-pointer mark-as-read-class"
                      @click.stop="markAsRead(message.id)"
                      >{{ t('message.mark_as_read') }}</span
                    >
                  </div>
                  <v-list-item-subtitle>
                    <div class="text-truncate-2lines">
                      {{ message.message }}
                    </div>
                    <div class="text-right mt-1" style="color: #000000">
                      {{ formatDate(message.createdAt) }}
                    </div>
                  </v-list-item-subtitle>
                </div>
              </v-list-item>
            </template>
            <template v-slot:loading>
              <div v-if="!isFinish">Loading ...</div>
            </template>
          </v-infinite-scroll>
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
          <div class="text-right mt-2">
            {{ formatDate(selectedMessage.createdAt) }}
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" color="primary" @click="dialog = false">{{
            t('$vuetify.close')
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <layout-footer />
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

.mark-as-read-class {
  display: none;
  transition: transform 0.2s ease; /* 添加过渡效果 */
}

.mark-as-read-class:hover {
  transform: translateY(-3px);
}

.unread-class:hover .mark-as-read-class {
  display: block;
}
</style>
