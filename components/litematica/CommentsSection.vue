<template>
  <div class="comments-section">
    <div class="d-flex flex-row align-center justify-space-between mb-4">
      <h3 class="text-h5 font-weight-bold">{{ t('comments.title') }}</h3>
      <span class="text-body-2"
        >{{ totalComments }} {{ t('comments.comments') }}</span
      >
    </div>

    <!-- 评论输入框 -->
    <div v-if="appStore.logined" class="mb-6">
      <v-card variant="flat">
        <v-card-text>
          <v-textarea
            v-model="newCommentContent"
            :label="t('comments.write_comment')"
            :loading="submittingComment"
            rows="3"
            variant="outlined"
            hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="!newCommentContent.trim() || submittingComment"
            :loading="submittingComment"
            color="primary"
            @click="submitComment"
          >
            {{ t('comments.post_comment') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- 未登录提示 -->
    <div v-else class="mb-6">
      <v-card variant="outlined">
        <v-card-text class="text-center">
          <p>{{ t('comments.login_to_comment') }}</p>
          <v-btn :to="localePath('/login')" color="primary">
            {{ t('comments.login') }}
          </v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- 评论列表 -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate />
    </div>

    <div v-else-if="comments?.length === 0" class="text-center py-8">
      <p class="text-body-1 text-medium-emphasis">
        {{ t('comments.no_comments') }}
      </p>
    </div>

    <div v-else>
      <comment-item
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :machine-id="machineId"
        @reply="handleReply"
        @vote="handleVote"
        @load-children="loadChildren"
      />

      <!-- 加载更多按钮 -->
      <div v-if="hasMore" class="text-center mt-4">
        <v-btn :loading="loadingMore" variant="outlined" @click="loadMore">
          {{ t('comments.load_more') }}
        </v-btn>
      </div>
    </div>
    <v-dialog v-model="showPhoneVerificationDialog" max-width="500px">
      <BindPhoneNumberCard
        :show-legal-message="true"
        @close="showPhoneVerificationDialog = false"
      />
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '~/store/app';
import { toast } from 'vuetify-sonner';
import CommentItem from './CommentItem.vue';
import BindPhoneNumberCard from '~/components/profile/BindPhoneNumberCard.vue';

interface RedenUser {
  id: string;
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
  children: CommentDto[];
  myVote?: 'up' | 'down';
}

interface CommentsResponse {
  comments: CommentDto[];
  total: number;
  totalPages: number;
}

interface Props {
  machineId: string;
}

const props = defineProps<Props>();
const { t } = useI18n();
const localePath = useLocalePath();
const appStore = useAppStore();

const comments = ref<CommentDto[]>([]);
const totalComments = ref(0);
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(false);
const currentPage = ref(1);
const pageSize = 12;

const newCommentContent = ref('');
const submittingComment = ref(false);
const showPhoneVerificationDialog = ref(false);

async function loadComments(page = 1, append = false) {
  try {
    if (page === 1) {
      loading.value = true;
    } else {
      loadingMore.value = true;
    }

    const response = await $fetch<CommentsResponse>(
      `/api/mc-services/yisibite/${props.machineId}/comments`,
      {
        query: { page, pageSize },
      },
    );

    if (append) {
      comments.value.push(...response.comments);
    } else {
      comments.value = response.comments;
    }

    totalComments.value = response.total;
    hasMore.value = response.total > page * pageSize;
    currentPage.value = page;
  } catch (error) {
    console.error('Failed to load comments:', error);
    toast.error(t('comments.load_error'));
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

watch(comments, (comments) => {
  console.log('Comments updated:', comments);
});

async function submitComment() {
  if (!newCommentContent.value.trim()) return;

  try {
    submittingComment.value = true;

    const resp = await doFetchPost(
      `/api/mc-services/yisibite/${props.machineId}/comments`,
      {
        content: newCommentContent.value.trim(),
      },
    );

    if (resp.ok) {
      newCommentContent.value = '';
      toast.success(t('comments.comment_posted'));

      // 重新加载评论
      await loadComments(1);
    } else {
      let errorJson: any;
      try {
        errorJson = await resp.json();
      } catch (e) {
        toast.error(t('comments.submit_error'));
        return;
      }

      if (errorJson?.error === 'phone_verification_required') {
        showPhoneVerificationDialog.value = true;
      } else {
        toast.error(t(errorJson?.error ?? 'comments.submit_error'));
      }
    }
  } catch (error) {
    console.error('Failed to submit comment:', error);
    toast.error(t('comments.submit_error'));
  } finally {
    submittingComment.value = false;
  }
}

async function loadMore() {
  await loadComments(currentPage.value + 1, true);
}

async function handleReply(commentId: string, content: string) {
  try {
    await doFetchPost(`/api/mc-services/yisibite/${props.machineId}/comments`, {
      content,
      reply: commentId,
    });

    toast.success(t('comments.reply_posted'));

    // 重新加载评论
    await loadComments(1);
  } catch (error) {
    console.error('Failed to submit reply:', error);
    toast.error(t('comments.submit_error'));
  }
}

async function handleVote(commentId: string, vote: 'up' | 'down' | 'cancel') {
  const comment = findComment(comments.value, commentId);
  if (!comment) return;

  const originalVote = comment.myVote;
  const originalUpVotes = comment.upVotes;

  // Optimistic update
  if (vote === 'cancel') {
    comment.myVote = undefined;
    if (originalVote === 'up') {
      comment.upVotes--;
    } else if (originalVote === 'down') {
      comment.upVotes++;
    }
  } else if (vote === 'up') {
    if (originalVote === 'down') {
      comment.upVotes += 2;
    } else if (originalVote !== 'up') {
      comment.upVotes++;
    }
    comment.myVote = 'up';
  } else if (vote === 'down') {
    if (originalVote === 'up') {
      comment.upVotes -= 2;
    } else if (originalVote !== 'down') {
      comment.upVotes--;
    }
    comment.myVote = 'down';
  }

  try {
    const res = await doFetchPost(
      `/api/mc-services/yisibite/${props.machineId}/comments/${commentId}/vote`,
      { vote },
    );
    if (!res.ok) {
      throw { status: res.status };
    }
  } catch (error: any) {
    // Revert on error
    comment.myVote = originalVote;
    comment.upVotes = originalUpVotes;
    const errorMessage = error.data?.message || t('comments.vote_error');
    toast.error(errorMessage);
    console.error('Failed to vote:', error);
  }
}

function findComment(
  comments: CommentDto[],
  commentId: string,
): CommentDto | undefined {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }
    if (comment.children) {
      const found = findComment(comment.children, commentId);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

async function loadChildren(commentId: string) {
  let target = comments.value.find((c) => c.id === commentId);
  if (!target) {
    console.error('找不到评论 id：', commentId);
    return;
  }
  let page = Math.floor((target.children?.length ?? 0) / pageSize) + 1;
  try {
    const response = await $fetch<CommentsResponse>(
      `/api/mc-services/yisibite/${props.machineId}/comments/${commentId}/children`,
      {
        query: { page, pageSize },
      },
    );

    // 找到对应的评论并更新其子评论
    for (const comment of comments.value) {
      if (comment.id === commentId) {
        if (page === 1) {
          comment.children = response.comments;
        } else {
          comment.children = comment.children ?? [];
          comment.children.push(...response.comments);
        }
        break;
      }
    }
  } catch (error) {
    console.error('Failed to load children comments:', error);
    toast.error(t('comments.load_error'));
  }
}

onMounted(() => {
  if (comments.value.length === 0) {
    loadComments();
  }
});
</script>

<style scoped>
.comments-section {
  margin-top: 32px;
}
</style>
