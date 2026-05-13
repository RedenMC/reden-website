<script setup lang="ts">
import { doFetchPost, number2text, toastError } from '@/utils/constants';
import { toast } from 'vuetify-sonner';
import type { MachineDef, Tag } from '~/pages/litematica/index.vue';
import { useAppStore } from '~/store/app';

type TagPageData = {
  total: number;
  tag: Tag;
  posts: MachineDef[];
};

type TagPostSort = 'downloads' | 'createdAt';

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const tagName = computed(() => route.params.tag_name as string);
const page = useRouteQuery('page', 1, { transform: Number });
const sortType = useRouteQuery<TagPostSort>('sort', 'downloads');
const pageSize = 12;
const localePath = useLocalePath();
const { t, locale } = useI18n();
const sortTypes: TagPostSort[] = ['downloads', 'createdAt'];
const editDialog = ref(false);
const editSaving = ref(false);
const editFormValid = ref(false);
const editForm = ref({
  name: '',
  description: '',
});

const {
  data: pageData,
  status,
  error,
} = await useFetch<TagPageData>(
  () =>
    `/api/mc-services/tags/${encodeURIComponent(tagName.value)}/posts?page=${page.value}&pageSize=${pageSize}&order=${sortType.value}`,
  { dedupe: 'cancel' },
);

const tag = computed(() => pageData.value?.tag);
const posts = computed(() => pageData.value?.posts ?? []);
const total = computed(() => pageData.value?.total ?? 0);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize)),
);

useHead(() => ({
  title: tag.value ? `#${tag.value.name}` : `#${tagName.value}`,
  titleTemplate: '%s - Reden',
}));

function openPost(post: MachineDef) {
  router.push(postHref(post));
}

function openPostByKeyboard(event: KeyboardEvent, post: MachineDef) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openPost(post);
  }
}

watch(tagName, () => {
  page.value = 1;
});

watch(sortType, () => {
  page.value = 1;
});

function postHref(post: MachineDef) {
  return localePath(`/litematica/${post.key}`);
}

function authorHref(post: MachineDef) {
  return post.author?.username ? localePath(`/@${post.author.username}`) : '';
}

function sortIcon(sort: TagPostSort) {
  return sort === 'downloads' ? 'mdi-download' : 'mdi-clock-outline';
}

function openTagEditDialog() {
  if (!appStore.logined) {
    router.push(localePath('/login'));
    return;
  }
  editForm.value = {
    name: tag.value?.name || '',
    description: tag.value?.description || '',
  };
  editDialog.value = true;
}

function apiLanguage() {
  const code = String(locale.value).toLowerCase();
  if (code.startsWith('zh_tw')) return 'zh_tw';
  if (code.startsWith('zh')) return 'zh_cn';
  if (code.startsWith('ru')) return 'ru';
  if (code.startsWith('es')) return 'es';
  return 'en';
}

async function submitTagEditRequest() {
  if (!tag.value || !editFormValid.value) return;
  if (!appStore.logined) {
    await router.push(localePath('/login'));
    return;
  }
  editSaving.value = true;
  try {
    const response = await doFetchPost(
      `/api/mc-services/tags/${encodeURIComponent(tag.value.tag)}/localization-edit-request`,
      {
        language: apiLanguage(),
        name: editForm.value.name,
        description: editForm.value.description,
      },
    );
    if (!response.ok) {
      await toastError(response, t('tag.edit_request.submit_failed'));
      return;
    }
    editDialog.value = false;
    const responseBody = await response.json().catch(() => null);
    toast.success(
      responseBody?.requiresReview
        ? t('tag.edit_request.submitted')
        : t('tag.edit_request.applied'),
    );
  } catch (error) {
    await toastError(error, t('tag.edit_request.submit_failed'));
  } finally {
    editSaving.value = false;
  }
}
</script>

<template>
  <v-container class="tag-page py-10 py-md-12">
    <div v-if="error && status === 'error'" class="tag-state-card">
      <v-icon size="42" color="red-lighten-2">mdi-tag-off-outline</v-icon>
      <h1>{{ t('tag.not_found') }}</h1>
      <p>{{ t('tag.not_found_description', { tag: tagName }) }}</p>
      <v-btn
        :to="localePath('/litematica')"
        color="primary"
        prepend-icon="mdi-arrow-left"
        variant="tonal"
      >
        {{ t('reden.home.go_litematica') }}
      </v-btn>
    </div>

    <template v-else>
      <section class="tag-hero">
        <div class="tag-hero-bg"></div>
        <div class="tag-hero-content">
          <div>
            <div class="tag-kicker">
              <v-icon size="18">mdi-tag-multiple</v-icon>
              <span>{{ tag?.tag || tagName }}</span>
            </div>
            <h1>#{{ tag?.name || tagName }}</h1>
            <p>
              {{ tag?.description || t('tag.loading') }}
            </p>
          </div>
          <div class="tag-hero-actions">
            <v-btn
              color="cyan"
              prepend-icon="mdi-pencil-outline"
              variant="flat"
              :disabled="!tag"
              @click="openTagEditDialog"
            >
              {{ t('tag.edit_request.action') }}
            </v-btn>
          </div>
        </div>
      </section>

      <section class="tag-toolbar">
        <h2>{{ t('tag.posts_with_tag', { tag: tag?.name || tagName }) }}</h2>
        <v-btn-toggle
          v-model="sortType"
          class="tag-sort-toggle"
          color="primary"
          density="comfortable"
          divided
          mandatory
          rounded="lg"
          variant="tonal"
        >
          <v-btn v-for="sort in sortTypes" :key="sort" :value="sort">
            <v-icon size="18">{{ sortIcon(sort) }}</v-icon>
            <span class="tag-sort-label">
              {{ t(`litematica_generator.sort.${sort}`) }}
            </span>
          </v-btn>
        </v-btn-toggle>
      </section>

      <div v-if="status === 'pending'" class="tag-post-grid">
        <v-skeleton-loader
          v-for="i in pageSize"
          :key="i"
          class="tag-post-card"
          type="image, article"
        />
      </div>

      <div v-else-if="posts.length > 0" class="tag-post-grid">
        <article
          v-for="post in posts"
          :key="post.key"
          class="tag-post-card"
          role="link"
          tabindex="0"
          @click="openPost(post)"
          @keydown="openPostByKeyboard($event, post)"
        >
          <div class="tag-post-preview">
            <v-img
              :src="post.thumbnailUrl || '/image/default-preview.png'"
              aspect-ratio="16/9"
              class="tag-post-image"
              cover
            />
            <div class="tag-post-overlay">
              <span>
                <v-icon size="small">mdi-download</v-icon>
                {{ number2text(post.downloads ?? 0) }}
              </span>
              <span>
                <v-icon size="small">mdi-heart</v-icon>
                {{ number2text(post.upVotes ?? 0) }}
              </span>
            </div>
          </div>
          <div class="tag-post-body">
            <h3>{{ post.name }}</h3>
            <NuxtLink
              v-if="post.author?.username"
              :to="authorHref(post)"
              class="tag-author"
              @click.stop
            >
              <v-avatar size="22" class="tag-author-avatar">
                <v-img
                  v-if="post.author.avatarUrl"
                  :src="post.author.avatarUrl"
                  :alt="post.author.username"
                />
                <v-icon v-else size="14">mdi-account</v-icon>
              </v-avatar>
              <span>{{ post.author.username }}</span>
            </NuxtLink>
          </div>
        </article>
      </div>

      <div v-else class="tag-state-card">
        <v-icon size="42" color="cyan">mdi-tag-hidden</v-icon>
        <h2>{{ t('tag.no_posts_with_tag', { tag: tag?.name || tagName }) }}</h2>
      </div>

      <div v-if="totalPages > 1" class="tag-pagination">
        <v-pagination
          v-model="page"
          :length="totalPages"
          density="comfortable"
          rounded="circle"
          total-visible="7"
        />
      </div>

      <v-dialog v-model="editDialog" max-width="620">
        <v-card class="tag-edit-dialog">
          <v-card-title>{{ t('tag.edit_request.title') }}</v-card-title>
          <v-card-text>
            <v-form v-model="editFormValid" @submit.prevent="submitTagEditRequest">
              <v-text-field
                v-model="editForm.name"
                :label="t('common.name')"
                :rules="[(value) => !!value || t('tags.form.required')]"
                maxlength="255"
                counter
                variant="outlined"
              />
              <v-textarea
                v-model="editForm.description"
                :label="t('common.description')"
                rows="5"
                variant="outlined"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="editDialog = false">
              {{ t('common.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!editFormValid"
              :loading="editSaving"
              @click="submitTagEditRequest"
            >
              {{ t('tag.edit_request.submit') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-container>
</template>

<style scoped>
.tag-page {
  color: white;
}

.tag-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(75, 85, 99, 0.34);
  border-radius: 16px;
  background: linear-gradient(135deg, #111827e6, #1f2937e6);
  box-shadow: 0 16px 44px rgba(15, 23, 42, 0.18);
}

.tag-hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 14% 24%, rgba(20, 184, 166, 0.18), transparent 34%),
    radial-gradient(circle at 88% 12%, rgba(96, 165, 250, 0.18), transparent 36%),
    linear-gradient(45deg, transparent 42%, rgba(148, 163, 184, 0.06) 50%, transparent 58%);
}

.tag-hero-content {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 32px;
}

.tag-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  margin-bottom: 14px;
  color: rgba(125, 211, 252, 0.86);
  font-size: 0.82rem;
  font-weight: 700;
}

.tag-kicker span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 4.2rem);
  font-weight: 800;
  line-height: 1;
}

.tag-hero p {
  max-width: 760px;
  margin: 16px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1rem;
  line-height: 1.75;
}

.tag-hero-metrics {
  flex: 0 0 auto;
}

.tag-hero-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-end;
}

.tag-metric {
  min-width: 132px;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(10px);
}

.tag-metric strong {
  display: block;
  margin-top: 8px;
  color: white;
  font-size: 1.8rem;
  line-height: 1;
}

.tag-metric span {
  display: block;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.75rem;
}

.tag-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 28px 0 18px;
  backdrop-filter: blur(10px);
}

.tag-toolbar h2 {
  margin: 0;
  color: white;
  font-size: 1.35rem;
  font-weight: 700;
}

.tag-toolbar p {
  margin: 5px 0 0;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.86rem;
}

.tag-sort-toggle {
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.36);
}

.tag-sort-toggle :deep(.v-btn) {
  min-width: 112px;
  color: rgba(255, 255, 255, 0.78);
}

.tag-sort-label {
  margin-left: 6px;
  font-size: 0.82rem;
  font-weight: 700;
}

.tag-post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.tag-post-card {
  overflow: hidden;
  border: 1px solid rgba(75, 85, 99, 0.28);
  border-radius: 14px;
  background: rgba(31, 41, 55, 0.78);
  color: inherit;
  cursor: pointer;
  text-decoration: none;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.tag-post-card:hover {
  transform: translateY(-2px);
  border-color: rgba(45, 212, 191, 0.35);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.24);
}

.tag-post-card:focus-visible {
  outline: 2px solid rgba(45, 212, 191, 0.72);
  outline-offset: 3px;
}

.tag-post-preview {
  position: relative;
  overflow: hidden;
}

.tag-post-image {
  height: 150px;
  transition:
    transform 0.3s ease,
    filter 0.3s ease;
}

.tag-post-card:hover .tag-post-image {
  transform: scale(1.04);
  filter: saturate(1.12);
}

.tag-post-overlay {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 9px;
  display: flex;
  gap: 12px;
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
  opacity: 0;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
  transition: opacity 0.25s ease;
}

.tag-post-card:hover .tag-post-overlay {
  opacity: 1;
}

.tag-post-overlay span,
.tag-author {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.tag-post-body {
  padding: 14px;
}

.tag-post-body h3 {
  display: -webkit-box;
  min-height: 42px;
  margin: 0 0 12px;
  overflow: hidden;
  color: white;
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.tag-author {
  max-width: 100%;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
}

.tag-author:hover {
  color: white;
}

.tag-author span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-author-avatar {
  flex: 0 0 22px;
  background: rgba(148, 163, 184, 0.18);
}

.tag-state-card {
  display: flex;
  min-height: 320px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 32px;
  border: 1px solid rgba(75, 85, 99, 0.3);
  border-radius: 16px;
  background: linear-gradient(135deg, #111827cc, #1f2937cc);
  color: white;
  text-align: center;
}

.tag-state-card h1,
.tag-state-card h2 {
  margin: 0;
  font-size: 1.6rem;
}

.tag-state-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
}

.tag-pagination {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

@media (max-width: 760px) {
  .tag-hero-content {
    flex-direction: column;
    align-items: stretch;
    padding: 24px;
  }

  .tag-hero-metrics {
    width: 100%;
  }

  .tag-hero-actions {
    width: 100%;
  }

  .tag-hero-actions :deep(.v-btn) {
    width: 100%;
  }

  .tag-metric {
    min-width: 0;
  }

  .tag-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .tag-post-grid {
    grid-template-columns: 1fr;
  }
}
</style>
