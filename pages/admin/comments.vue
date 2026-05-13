<script lang="ts" setup>
import { doFetchGet, toastError, type Profile } from '~/utils/constants';

type PostStatus = 'Pending' | 'Approved' | 'Rejected' | 'Deleted' | 'TakenDown';

type AdminComment = {
  id: string;
  source: {
    id: number;
    key: string;
    name?: string | null;
  };
  user: Pick<Profile, 'id' | 'username' | 'avatarUrl' | 'isStaff'>;
  content: string;
  time: number;
  holder?: string | null;
  reply?: string | null;
  status: PostStatus;
  upVotes: number;
  childrenCount: number;
  replyComment?: {
    id: string;
    user: Pick<Profile, 'id' | 'username' | 'avatarUrl' | 'isStaff'>;
    content: string;
    time: number;
    status: PostStatus;
  } | null;
};

type LoadOptions = {
  page: number;
  itemsPerPage: number;
  sortBy: {
    key: string;
    order: 'asc' | 'desc';
  }[];
};

const localePath = useLocalePath();

useHead({
  title: '评论管理',
  titleTemplate: '%s - Reden',
});

definePageMeta({
  needLogin: true,
  needAdmin: true,
});

const page = ref(1);
const pageSize = ref(30);
const totalItems = ref(0);
const serverItems = ref<AdminComment[]>([]);
const loading = ref(false);
const search = ref('');
const status = ref<'All' | PostStatus>('All');
const lastOptions = ref<LoadOptions>({
  page: 1,
  itemsPerPage: pageSize.value,
  sortBy: [],
});

const statusItems = [
  'All',
  'Pending',
  'Approved',
  'Rejected',
  'Deleted',
  'TakenDown',
];

const headers = [
  { title: '时间', key: 'time', minWidth: '170px' },
  { title: '状态', key: 'status', minWidth: '110px' },
  { title: '用户', key: 'user', minWidth: '180px', sortable: false },
  { title: '稿件', key: 'source', minWidth: '220px', sortable: false },
  { title: '内容', key: 'content', sortable: false },
  { title: '赞', key: 'upVotes', align: 'end' },
  { title: '回复', key: 'childrenCount', align: 'end' },
  { title: '操作', key: 'actions', sortable: false, align: 'end' },
];

function statusColor(value: PostStatus) {
  return (
    {
      Pending: 'orange',
      Approved: 'green',
      Rejected: 'red',
      Deleted: 'grey',
      TakenDown: 'deep-orange',
    } satisfies Record<PostStatus, string>
  )[value];
}

async function loadItems(options: LoadOptions) {
  if (!import.meta.client) {
    return;
  }
  lastOptions.value = options;
  loading.value = true;
  const parameters: Record<string, string> = {
    page: String(options.page),
    pageSize: String(options.itemsPerPage),
  };
  if (search.value.trim()) {
    parameters.search = search.value.trim();
  }
  if (status.value !== 'All') {
    parameters.status = status.value;
  }

  const response = await doFetchGet('/api/admin/comments/list', parameters);
  if (response.ok) {
    const data: {
      comments: AdminComment[];
      total: number;
    } = await response.json();
    serverItems.value = data.comments;
    totalItems.value = data.total;
  } else {
    await toastError(response);
  }
  loading.value = false;
}

async function reload() {
  page.value = 1;
  await loadItems({
    ...lastOptions.value,
    page: 1,
    itemsPerPage: pageSize.value,
  });
}
</script>

<template>
  <v-data-table-server
    v-model:items-per-page="pageSize"
    v-model:page="page"
    :headers="headers"
    :items="serverItems"
    :items-length="totalItems"
    :items-per-page-options="[10, 30, 50, 100]"
    :loading="loading"
    item-value="id"
    @update:options="loadItems"
  >
    <template #top>
      <v-toolbar density="compact" flat>
        <v-toolbar-title>评论管理</v-toolbar-title>
        <v-spacer />
        <v-text-field
          v-model="search"
          class="comments-filter"
          density="compact"
          hide-details
          label="搜索"
          placeholder="内容、用户、稿件路径"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          @keydown.enter="reload"
        />
        <v-select
          v-model="status"
          class="comments-status"
          density="compact"
          hide-details
          :items="statusItems"
          label="状态"
          variant="outlined"
          @update:model-value="reload"
        />
        <v-btn icon title="刷新" @click="reload">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-toolbar>
    </template>
    <template #loading>
      <v-skeleton-loader type="table-row@10" />
    </template>
    <template #[`item.time`]="{ value }">
      {{ new Date(value).toLocaleString() }}
    </template>
    <template #[`item.status`]="{ value }">
      <v-chip :color="statusColor(value)" size="small" variant="flat">
        {{ value }}
      </v-chip>
    </template>
    <template #[`item.user`]="{ item }">
      <router-link
        :to="localePath(`/@${item.user.username}`)"
        class="user-link"
      >
        <v-avatar :image="item.user.avatarUrl" size="28" />
        <span>{{ item.user.username }}</span>
      </router-link>
    </template>
    <template #[`item.source`]="{ item }">
      <router-link
        :to="localePath(`/litematica/${item.source.key}`)"
        class="source-link"
      >
        {{ item.source.name || item.source.key }}
      </router-link>
      <div class="source-key">
        {{ item.source.key }} · #{{ item.source.id }}
      </div>
    </template>
    <template #[`item.content`]="{ item }">
      <div class="comment-excerpt">{{ item.content }}</div>
      <div v-if="item.replyComment" class="reply-context">
        <div class="reply-meta">
          回复
          <router-link
            :to="localePath(`/@${item.replyComment.user.username}`)"
            class="reply-user"
          >
            {{ item.replyComment.user.username }}
          </router-link>
          · {{ new Date(item.replyComment.time).toLocaleString() }}
        </div>
        <div class="reply-content">
          {{ item.replyComment.content }}
        </div>
      </div>
    </template>
    <template #[`item.actions`]="{ item }">
      <v-btn icon size="small" title="查看详情" variant="text">
        <v-icon>mdi-eye</v-icon>
        <v-dialog activator="parent" max-width="760">
          <v-card>
            <v-card-title>评论详情</v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    :model-value="item.id"
                    label="评论 ID"
                    readonly
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    :model-value="item.source.key"
                    label="稿件路径"
                    readonly
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    :model-value="item.holder || '-'"
                    label="父级评论"
                    readonly
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    :model-value="item.reply || '-'"
                    label="回复目标"
                    readonly
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    :model-value="item.content"
                    label="内容"
                    readonly
                    rows="6"
                  />
                </v-col>
                <v-col v-if="item.replyComment" cols="12">
                  <div class="dialog-reply-context">
                    <div class="reply-meta">
                      被回复评论 · {{ item.replyComment.user.username }} ·
                      {{ new Date(item.replyComment.time).toLocaleString() }}
                    </div>
                    <div class="reply-content">
                      {{ item.replyComment.content }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-btn>
    </template>
  </v-data-table-server>
</template>

<style scoped>
.comments-filter {
  max-width: 320px;
}

.comments-status {
  max-width: 150px;
  margin-inline-start: 12px;
}

.user-link,
.source-link {
  color: currentColor;
  text-decoration: none;
}

.user-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.user-link:hover,
.source-link:hover {
  color: #66ccff;
  text-decoration: underline;
}

.source-key {
  margin-top: 2px;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.8rem;
}

.comment-excerpt {
  max-width: 520px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reply-context,
.dialog-reply-context {
  max-width: 520px;
  margin-top: 8px;
  border-inline-start: 3px solid rgba(var(--v-theme-primary), 0.65);
  padding: 6px 10px;
  background: rgba(var(--v-theme-surface-variant), 0.45);
}

.dialog-reply-context {
  max-width: none;
}

.reply-meta {
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.78rem;
}

.reply-user {
  color: currentColor;
}

.reply-content {
  margin-top: 2px;
  overflow: hidden;
  color: rgba(var(--v-theme-on-surface), 0.82);
  font-size: 0.88rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
