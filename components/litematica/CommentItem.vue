<template>
  <v-card class="mb-4" variant="flat">
    <v-card-text
      :class="{
        'pa-0': isChild,
      }"
    >
      <div class="d-flex align-start">
        <!-- 用户头像 -->
        <v-avatar class="mr-3" size="40">
          <v-img v-if="comment.user.avatarUrl" :src="comment.user.avatarUrl" />
          <v-icon v-else>mdi-account-circle</v-icon>
        </v-avatar>

        <div class="flex-grow-1">
          <!-- 用户名和时间 -->
          <div class="d-flex align-center mb-2">
            <reden-router
              :to="localePath(`/@${comment.user.username}`)"
              class="font-weight-medium text-decoration-none"
            >
              {{ comment.user.username }}
            </reden-router>
            <span class="text-body-2 text-medium-emphasis ml-2">
              {{ formatTime(comment.time) }}
            </span>
            <reden-post-status-chip
              v-if="comment.status !== 'Approved'"
              :value="comment.status as PostStatus"
              class="ml-2"
              size="small"
            />
          </div>

          <!-- 评论内容 -->
          <div class="text-body-1 mb-3">
            <MDC :value="comment.content" class="comment-content" />
          </div>

          <!-- 操作按钮 -->
          <div class="d-flex align-center" style="gap: 8px">
            <v-btn
              :disabled="appStore.uid === comment.user.id"
              :color="comment.myVote === 'up' ? 'primary' : 'default'"
              :variant="comment.myVote === 'up' ? 'elevated' : 'text'"
              size="small"
              @click="
                $emit(
                  'vote',
                  comment.id,
                  comment.myVote === 'up' ? 'cancel' : 'up',
                )
              "
            >
              <v-icon size="16">mdi-thumb-up-outline</v-icon>
              <span class="ml-1">{{ comment.upVotes }}</span>
            </v-btn>

            <v-btn
              :disabled="appStore.uid === comment.user.id"
              :color="comment.myVote === 'down' ? 'primary' : 'default'"
              :variant="comment.myVote === 'down' ? 'elevated' : 'text'"
              size="small"
              @click="
                $emit(
                  'vote',
                  comment.id,
                  comment.myVote === 'down' ? 'cancel' : 'down',
                )
              "
            >
              <v-icon size="16">mdi-thumb-down-outline</v-icon>
            </v-btn>

            <v-btn
              v-if="appStore.logined"
              size="small"
              variant="text"
              @click="toggleReply"
            >
              <v-icon size="16">mdi-reply</v-icon>
              <span class="ml-1">{{ t('comments.reply') }}</span>
            </v-btn>
          </div>

          <!-- 回复输入框 -->
          <div v-if="showReplyInput" class="mt-3">
            <v-textarea
              v-model="replyContent"
              :label="t('comments.write_reply')"
              :loading="submittingReply"
              rows="2"
              variant="outlined"
              hide-details
            />
            <div class="d-flex justify-end mt-2" style="gap: 8px">
              <v-btn size="small" variant="text" @click="cancelReply">
                {{ t('common.cancel') }}
              </v-btn>
              <v-btn
                :disabled="!replyContent.trim()"
                :loading="submittingReply"
                color="primary"
                size="small"
                @click="submitReply"
              >
                {{ t('comments.post_reply') }}
              </v-btn>
            </div>
          </div>

          <!-- 子评论 -->
          <div v-if="(comment.children?.length ?? 0) > 0" class="mt-4">
            <comment-item
              v-for="child in comment.children"
              :key="child.id"
              :comment="child"
              :machine-id="machineId"
              :is-child="true"
              @reply="$emit('reply', $event, replyContent)"
              @vote="(id, action) => $emit('vote', id, action)"
            />
          </div>

          <!-- 加载更多子评论 -->
          <div
            v-if="comment.childrenCount > (comment.children?.length ?? 0)"
            class="mt-3"
          >
            <v-btn
              :loading="loadingChildren"
              size="small"
              variant="text"
              @click="loadMoreChildren"
            >
              {{
                t('comments.load_more_replies', {
                  count:
                    comment.childrenCount - (comment.children?.length ?? 0),
                })
              }}
            </v-btn>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '~/store/app';
import RedenRouter from '~/components/RedenRouter.vue';
import RedenPostStatusChip from '~/components/litematica/RedenPostStatusChip.vue';
import { PostStatus } from '~/utils/constants';

interface RedenUser {
  id: number;
  username: string;
  avatarUrl?: string;
}

interface CommentDto {
  id: string;
  sourceId: number;
  user: RedenUser;
  content: string;
  time: number;
  reply?: string;
  status: string;
  upVotes: number;
  childrenCount: number;
  children?: CommentDto[];
  myVote?: 'up' | 'down';
}

interface Props {
  comment: CommentDto;
  machineId: string;
  isChild?: boolean;
}

interface Emits {
  reply: [commentId: string, content: string];
  vote: [commentId: string, vote: 'up' | 'down' | 'cancel'];
  loadChildren: [commentId: string];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
const localePath = useLocalePath();
const appStore = useAppStore();

const showReplyInput = ref(false);
const replyContent = ref('');
const submittingReply = ref(false);
const loadingChildren = ref(false);

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return t('comments.time.just_now');
  } else if (minutes < 60) {
    return t('comments.time.minutes_ago', { count: minutes });
  } else if (hours < 24) {
    return t('comments.time.hours_ago', { count: hours });
  } else if (days < 7) {
    return t('comments.time.days_ago', { count: days });
  } else {
    return date.toLocaleDateString();
  }
}

function toggleReply() {
  showReplyInput.value = !showReplyInput.value;
  if (!showReplyInput.value) {
    replyContent.value = '';
  }
}

function cancelReply() {
  showReplyInput.value = false;
  replyContent.value = '';
}

async function submitReply() {
  if (!replyContent.value.trim()) return;

  try {
    submittingReply.value = true;
    emit('reply', props.comment.id, replyContent.value.trim());
    replyContent.value = '';
    showReplyInput.value = false;
  } finally {
    submittingReply.value = false;
  }
}

async function loadMoreChildren() {
  try {
    loadingChildren.value = true;
    emit('loadChildren', props.comment.id);
  } finally {
    loadingChildren.value = false;
  }
}
</script>

<style scoped>
.comment-content {
  word-break: break-word;
}

.comment-content :deep(p) {
  margin: 0;
}

.comment-content :deep(p + p) {
  margin-top: 8px;
}
</style>
