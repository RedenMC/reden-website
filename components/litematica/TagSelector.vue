<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { toast } from 'vuetify-sonner';
import { doFetchPost, toastError } from '~/utils/constants';

const { t, locale } = useI18n();

type TagOption = { code: string; name: string };
type TagDto = { tag: string; name: string };

// 已选标签
const selectedTags = defineModel<TagOption[]>();
// 输入关键词
const searchText = ref('');
// 建议标签
const suggestions = ref<TagOption[]>([]);
const strictMatches = ref<TagOption[]>([]);
// popup显示
const showPopup = ref(false);
const loading = ref(false);
const creating = ref(false);
let searchRequestId = 0;

function normalizeTagText(value: string) {
  return value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
}

const normalizedSearchText = computed(() => normalizeTagText(searchText.value));
const hasStrictMatch = computed(() => strictMatches.value.length > 0);
const canCreateTag = computed(
  () =>
    normalizedSearchText.value.length > 0 &&
    !loading.value &&
    !hasStrictMatch.value,
);

function toOption(tag: TagDto): TagOption {
  return {
    code: tag.tag,
    name: tag.name,
  };
}

function mergeTags(...groups: TagOption[][]) {
  const merged = new Map<string, TagOption>();
  for (const group of groups) {
    for (const tag of group) {
      merged.set(tag.code, tag);
    }
  }
  return [...merged.values()];
}

// 查询标签建议
watch(searchText, async (val) => {
  if (!normalizeTagText(val)) {
    suggestions.value = [];
    strictMatches.value = [];
    showPopup.value = false;
    return;
  }
  const requestId = ++searchRequestId;
  loading.value = true;
  try {
    const searchResult = await $fetch<{
      data: TagDto[];
      strictMatches?: TagDto[];
    }>(`/api/mc-services/tags?search=${encodeURIComponent(val)}`, {});
    if (requestId !== searchRequestId) return;
    strictMatches.value = searchResult.strictMatches?.map(toOption) ?? [];
    const fuzzySuggestions = searchResult.data?.map(toOption) ?? [];
    suggestions.value = mergeTags(
      strictMatches.value,
      fuzzySuggestions,
    );
    loading.value = false;
    showPopup.value = suggestions.value.length > 0 || canCreateTag.value;
  } catch (error) {
    if (requestId !== searchRequestId) return;
    suggestions.value = [];
    strictMatches.value = [];
    loading.value = false;
    showPopup.value = canCreateTag.value;
    await toastError(error, t('upload.tags.search_failed'));
  } finally {
    if (requestId === searchRequestId) {
      loading.value = false;
    }
  }
});

// 插入标签
function addTag(tag: TagOption) {
  if (!tag.code) {
    toast.error(t('upload.tags.empty_code'));
  }
  const current = selectedTags.value ?? [];
  if (!current.find((t) => t.code === tag.code)) {
    selectedTags.value = [...current, tag];
  }
  showPopup.value = false;
  searchText.value = '';
}

async function createTag() {
  if (!canCreateTag.value || creating.value) return;
  creating.value = true;
  try {
    const response = await doFetchPost('/api/mc-services/tags/upload-create', {
      name: searchText.value.trim(),
      language: locale.value,
    });
    if (!response.ok) {
      await toastError(response, t('upload.tags.create_failed'));
      return;
    }
    const data = (await response.json()) as { tag: TagDto };
    addTag(toOption(data.tag));
    toast.success(t('upload.tags.create_success'));
  } catch (error) {
    await toastError(error, t('upload.tags.create_failed'));
  } finally {
    creating.value = false;
  }
}

// 移除标签
function removeTag(code: string) {
  selectedTags.value = selectedTags.value?.filter((t) => t.code !== code) ?? [];
}
</script>

<template>
  <div>
    <v-text-field
      v-model="searchText"
      :label="t('upload.tags.input_label')"
      :loading="loading"
      @focus="showPopup = suggestions.length > 0 || canCreateTag"
      id="tag-search-input"
      color="primary"
    >
      <v-menu
        :model-value="showPopup && (suggestions.length > 0 || canCreateTag)"
        :close-on-content-click="false"
        activator="parent"
        offset-y
      >
        <v-list density="compact">
          <v-list-item
            v-for="tag in suggestions"
            :key="tag.code"
            @click="addTag(tag)"
            style="cursor: pointer"
            >{{ tag.name }}</v-list-item
          >
          <v-divider v-if="suggestions.length && canCreateTag" />
          <v-list-item
            v-if="canCreateTag"
            :disabled="creating"
            @click="createTag"
          >
            <template #prepend>
              <v-icon color="primary">mdi-tag-plus</v-icon>
            </template>
            <v-list-item-title>
              {{ t('upload.tags.create_tag', { name: searchText.trim() }) }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ t('upload.tags.create_hint') }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-text-field>
    <v-alert
      v-if="canCreateTag"
      class="mb-2"
      density="compact"
      type="info"
      variant="tonal"
    >
      {{ t('upload.tags.strict_no_match') }}
    </v-alert>
    <!-- 已选标签 -->
    <div style="margin: 8px 0">
      <v-chip
        v-for="tag in selectedTags"
        :key="tag.code"
        closable
        @click:close="removeTag(tag.code)"
        style="margin-right: 4px"
        >{{ tag.name }}</v-chip
      >
    </div>
  </div>
</template>

<style scoped></style>
