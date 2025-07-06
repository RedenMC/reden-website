<template>
  <v-container>
    <h1 class="text-h4 mb-4">{{ t('tags.title') }}</h1>

    <!-- 标签搜索与过滤 -->
    <v-card class="mb-4">
      <v-card-title>{{ t('tags.filter.title') }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-select
              v-model="selectedLang"
              :items="availableLanguages"
              :label="t('tags.filter.language')"
              @update:model-value="fetchTags"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="selectedTagType"
              :items="tagTypes"
              :label="t('tags.filter.type')"
              @update:model-value="fetchTags"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="searchQuery"
              :label="t('tags.filter.search')"
              variant="outlined"
              density="compact"
              append-icon="mdi-magnify"
              @click:append="fetchTags"
              @keyup.enter="fetchTags"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 标签操作栏 -->
    <v-row class="mb-4">
      <v-col>
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          {{ t('tags.actions.create') }}
        </v-btn>
        <v-btn @click="refresh"> refresh </v-btn>
      </v-col>
    </v-row>

    <!-- 标签列表表格 -->
    <v-card>
      <v-data-table-server
        :headers="headers"
        :items="tags"
        :loading="loading"
        class="elevation-1"
        :items-per-page="pageSize"
        :items-length="totalTags"
        :page="currentPage"
        :no-data-text="t('tags.table.noData')"
      >
        <template v-slot:item.parent="{ item }">
          {{ item.parent ?? '-' }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            color="primary"
            @click="openEditDialog(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="small"
            color="error"
            @click="confirmDelete(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- 创建/编辑标签对话框 -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ isEditing ? t('tags.dialog.edit') : t('tags.dialog.create') }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="formData.language"
                  :items="availableLanguages"
                  :label="t('tags.form.language')"
                  required
                  :disabled="isEditing"
                  :rules="[(v) => !!v || t('tags.form.required')]"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.tag"
                  :label="t('tags.form.tag')"
                  :rules="[(v) => !!v || t('tags.form.required')]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  :label="t('tags.form.name')"
                  :rules="[(v) => !!v || t('tags.form.required')]"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  :label="t('tags.form.description')"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.type"
                  :items="tagTypes"
                  :label="t('tags.form.type')"
                  :rules="[(v) => !!v || t('tags.form.required')]"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  v-model="formData.parent"
                  :items="parentOptions"
                  item-title="name"
                  item-value="id"
                  :label="t('tags.form.parent')"
                  clearable
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="dialog = false">
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            @click="saveTag"
            :disabled="!isFormValid"
            :loading="saving"
          >
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>{{ t('tags.delete.title') }}</v-card-title>
        <v-card-text>
          {{ t('tags.delete.confirm', { tag: selectedTag?.name || '' }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="deleteDialog = false">
            {{ t('common.cancel') }}
          </v-btn>
          <v-btn color="error" @click="deleteTag" :loading="deleting">
            {{ t('common.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { doFetchPost, doFetchDelete } from '~/utils/constants';
import { toast } from 'vuetify-sonner';

// 删除原有的 Tag 接口，直接使用 MultiLanguageTag

interface TagFormData {
  id?: number;
  tag: string;
  name: string;
  description: string;
  type: string;
  parent: string | null;
  language: string;
}

interface TagTypeOption {
  title: string;
  value: string;
}

interface TagLocalization {
  language: string;
  name: string;
  description: string;
  createdAt: number;
  createdBy: number;
}

interface MultiLanguageTag {
  id: number;
  tag: string;
  type: string;
  parent: string | null;
  createdAt: number;
  localizations: TagLocalization[];
}

const { t, availableLocales } = useI18n();

// 计算属性获取可用语言列表
const availableLanguages = computed(() => {
  return availableLocales.map((locale) => {
    const localeTitles: Record<string, string> = {
      en: '英文',
      zh_cn: '简体中文',
      zh_tw: '繁體中文',
      ru: 'Русский',
    };
    return {
      title: localeTitles[locale] || locale,
      value: locale,
    };
  });
});

// 数据状态
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const selectedLang = ref<string>('en');
const searchQuery = ref<string>('');
const selectedTagType = ref<string | null>(null);
const dialog = ref<boolean>(false);
const isEditing = ref<boolean>(false);
const formData = ref<TagFormData>({
  language: selectedLang.value,
  tag: '',
  name: '',
  description: '',
  type: '',
  parent: null,
});
const isFormValid = ref<boolean>(false);
const form = ref(null);
const saving = ref<boolean>(false);
const deleteDialog = ref<boolean>(false);
const selectedTag = ref<MultiLanguageTag | null>(null);
const deleting = ref<boolean>(false);

// 计算属性
const totalPages = computed(() => Math.ceil(totalTags.value / pageSize.value));
const headers = computed(() => [
  { title: t('tags.table.id'), key: 'id', sortable: true, width: '80px' },
  { title: t('tags.table.tag'), key: 'tag', sortable: true, width: '120px' },
  ...availableLanguages.value.map((lang) => ({
    title: lang.title,
    key: `name_${lang.value}`,
    sortable: true,
  })),
  {
    title: t('tags.table.type'),
    key: 'type',
    sortable: true,
    width: '120px',
  },
  {
    title: t('tags.table.parent'),
    key: 'parent',
    sortable: false,
    width: '120px',
  },
  {
    title: t('tags.table.actions'),
    key: 'actions',
    sortable: false,
    width: '100px',
  },
]);

const tagTypes: TagTypeOption[] = [
  { title: t('tags.types.feature'), value: 'Feature' },
  { title: t('tags.types.category'), value: 'Category' },
  { title: t('tags.types.version'), value: 'Version' },
];

// 使用 useAsyncData 和 $fetch 获取所有语言的标签数据
const {
  data: multiLangTagsData,
  pending,
  refresh,
} = useFetch<{
  total: number;
  data: MultiLanguageTag[];
}>(
  () =>
    `/api/mc-services/tags/all-languages?page=${currentPage.value}&pageSize=${pageSize.value}&type=${selectedTagType.value || ''}&search=${searchQuery.value || ''}`,
);

// 将多语言标签数据转换为展示所有语言的格式
const tags = computed(() => {
  if (!multiLangTagsData.value?.data) return [];

  return multiLangTagsData.value.data.map((multiLangTag) => {
    // 创建基础标签对象
    const tag: ExtendedMultiLanguageTag = {
      id: multiLangTag.id,
      tag: multiLangTag.tag,
      type: multiLangTag.type,
      parent: multiLangTag.parent,
      createdAt: multiLangTag.createdAt,
      localizations: multiLangTag.localizations,
    };

    // 为每种语言添加对应的名称字段
    availableLanguages.value.forEach((lang) => {
      const localization = multiLangTag.localizations.find(
        (loc) => loc.language.toLowerCase() === lang.value.toLowerCase(),
      );

      // 如果找到该语言的本地化数据，使用它；否则显示空或占位符
      tag[`name_${lang.value}`] = localization?.name;
    });

    // 设置主要显示名称，优先使用当前选择的语言
    const currentLocalization = multiLangTag.localizations.find(
      (loc) => loc.language.toLowerCase() === selectedLang.value.toLowerCase(),
    );
    tag.name = currentLocalization
      ? currentLocalization.name
      : tag[`name_${availableLanguages.value[0].value}`];

    return tag;
  });
});

const totalTags = computed(() => multiLangTagsData.value?.total || 100);
const loading = computed(() => pending.value);

// 方法
function fetchTags() {
  refresh();
}

const parentOptions = computed(() => {
  // 过滤掉当前编辑的标签（避免自己作为自己的父标签）
  return tags.value
    .filter((tag) => !isEditing.value || tag.id !== formData.value.id)
    .map((tag) => tag.tag);
});

// 监听筛选条件变化
watch([selectedLang, selectedTagType, searchQuery], () => {
  currentPage.value = 1; // 重置到第一页
});

// 初始化
onMounted(() => {
  fetchTags();
});

function findTagName(id: number): string {
  const tag = tags.value.find((t) => t.id === id);
  return tag ? tag.name! : String(id);
}

function openCreateDialog() {
  isEditing.value = false;
  formData.value = {
    tag: '',
    name: '',
    description: '',
    type: 'Feature',
    parent: null,
    language: selectedLang.value,
  };
  dialog.value = true;
}

function openEditDialog(tag: MultiLanguageTag) {
  isEditing.value = true;

  // 基本信息赋值
  formData.value = {
    id: tag.id,
    tag: tag.tag,
    type: tag.type,
    parent: tag.parent,
    language: selectedLang.value,
    name: '', // 将根据选择的语言设置
    description: '', // 将根据选择的语言设置
  };

  // 如果标签有本地化信息，找到当前选择语言的本地化数据
  if (tag.localizations && tag.localizations.length > 0) {
    const currentLocalization = tag.localizations.find(
      (loc) => loc.language.toLowerCase() === selectedLang.value.toLowerCase(),
    );

    // 如果找到当前语言的本地化数据，使用它
    if (currentLocalization) {
      formData.value.name = currentLocalization.name;
      formData.value.description = currentLocalization.description || '';
    } else {
      // 如果当前语言没有本地化数据，使用名称映射或默认值
      const nameKey = `name_${selectedLang.value}` as keyof typeof tag;
      formData.value.name = (tag[nameKey] as string) || '';
      formData.value.description = '';
    }
  }

  dialog.value = true;
}

async function saveTag() {
  if (!isFormValid.value) return;

  saving.value = true;

  try {
    // 无论是创建还是编辑标签，都使用同一个POST接口
    const url = '/api/mc-services/tags';

    // 构造请求体，编辑时包含id字段
    const requestBody = {
      ...formData.value,
      language: selectedLang.value, // 添加当前选择的语言
    };

    const response = await doFetchPost(url, requestBody);

    if (!response.ok) {
      throw new Error(`Failed to save tag: ${response.status}`);
    }

    dialog.value = false;
    refresh(); // 刷新标签列表
    toast.success(t('tags.notifications.saveSuccess'));
  } catch (error) {
    console.error('Error saving tag:', error);
    toast.error(t('tags.notifications.saveError'));
  } finally {
    saving.value = false;
  }
}

function confirmDelete(tag: MultiLanguageTag) {
  selectedTag.value = tag;
  deleteDialog.value = true;
}

async function deleteTag() {
  if (!selectedTag.value) return;

  deleting.value = true;

  try {
    const response = await doFetchDelete(
      `/api/mc-services/tags/${selectedTag.value.id}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to delete tag: ${response.status}`);
    }

    deleteDialog.value = false;
    await refresh(); // 刷新标签列表
    toast.success(t('tags.notifications.deleteSuccess'));
  } catch (error) {
    console.error('Error deleting tag:', error);
    toast.error(t('tags.notifications.deleteError'));
  } finally {
    deleting.value = false;
  }
}

// 扩展的 MultiLanguageTag 接口，处理动态添加的语言属性
interface ExtendedMultiLanguageTag extends MultiLanguageTag {
  // 添加动态语言名称字段
  [key: string]: any;
  name?: string; // 用于显示在表格和UI中的主要名称
}
</script>
