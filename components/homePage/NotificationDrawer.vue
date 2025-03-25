<template>
  <v-no-ssr>
    <v-navigation-drawer
      v-show="drawer"
      v-model="drawer"
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
            color="primary"
            style="margin-left: 16px"
            variant="text"
            @click="markAllAsRead"
          >
            {{ t('message.all_read') }}
          </v-btn>
        </div>

        <!-- 消息列表 -->
        <v-list dense>
          <v-infinite-scroll
            :items="filteredMessages"
            height="100%"
            mode="manual"
            @load="loadMessages"
          >
            <template v-for="(message, index) in filteredMessages" :key="index">
              <v-list-item
                :class="{ 'unread-class': !message.read }"
                class="message-item cursor-pointer"
                @click="showMessageDetailDialog(message)"
              >
                <template v-slot:prepend>
                  <v-icon
                    >{{ message.read ? 'mdi-email-open' : 'mdi-email' }}
                  </v-icon>
                </template>
                <div style="flex: 1">
                  <div class="message-header">
                    <v-list-item-title class="text-truncate"
                      >{{ message.subject }}
                    </v-list-item-title>
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

                <!-- 对话框组件 -->
                <v-dialog
                  #default="{ isActive }"
                  activator="parent"
                  max-width="500px"
                >
                  <v-card>
                    <v-toolbar color="primary" dark>
                      <v-toolbar-title>{{ message.subject }}</v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                      <div class="message-content">
                        {{ message.message }}
                      </div>
                      <div class="text-right mt-2">
                        {{ formatDate(message.createdAt) }}
                      </div>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="primary"
                        variant="text"
                        @click="isActive.value = false"
                        >{{ t('$vuetify.close') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-list-item>
            </template>
            <template v-slot:empty>
              <v-alert variant="tonal" type="warning">{{
                t('message.no_message')
              }}</v-alert>
            </template>
            <template v-slot:load-more="{ props }">
              <v-btn v-bind="props" variant="outlined">
                {{ t('message.load_more') }}
              </v-btn>
            </template>
          </v-infinite-scroll>
        </v-list>
      </v-container>
    </v-navigation-drawer>
  </v-no-ssr>
</template>

<script lang="ts" setup>
import type { VInfiniteScroll } from 'vuetify/components';

import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { useMessageStore } from '~/store/message';

const { t } = useI18n();

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

const dialog = ref(false);

function showMessageDetailDialog(message: any) {
  message.read = true;
  dialog.value = true;
  markAsRead(message.id);
}

let page = 1;
let pageSize = 10;

// 加载消息
const loadMessages: VInfiniteScroll['$props']['onLoad'] = ({ done }) => {
  console.log('loadMessage');
  page++;
  doFetchGet(`/api/account/notifications/all?page=${page}&pageSize=${pageSize}`)
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        if (!data || data.length == 0) {
          done('empty');
          return;
        }
        done('ok');
        messageStore.messages.push(...data);
      } else {
        console.error(
          'Failed to fetch all notifications:',
          response.statusText,
          done('empty'),
        );
      }
    })
    .catch((e) => toastError(e, 'Failed to fetch all notifications'));
};

onMounted(() => {
  // 初始化未读消息数量
  messageStore.initMessageList();
  drawer.value = false;
});
</script>

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

.v-navigation-drawer {
  /*appbar的z-index是1006，所以这里设置为1007*/
  z-index: 1007 !important;
  height: 100% !important;
  top: 0 !important;
}
</style>
