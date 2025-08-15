<script lang="ts" setup>
import { ref, watch } from 'vue';
import { toast } from 'vuetify-sonner';

// 已选标签
const selectedTags = defineModel<{ code: string; name: string }[]>();
// 输入关键词
const searchText = ref('');
// 建议标签
const suggestions = ref<{ code: string; name: string }[]>([]);
// popup显示
const showPopup = ref(false);

// 查询标签建议
watch(searchText, async (val) => {
  if (!val) {
    suggestions.value = [];
    showPopup.value = false;
    return;
  }
  const { data } = await $fetch<{ data: { tag: string; name: string }[] }>(
    `/api/mc-services/tags?search=${val}`,
    {},
  );
  suggestions.value =
    data?.map((tag) => ({
      ...tag,
      code: tag.tag,
    })) || [];
  showPopup.value = suggestions.value.length > 0;
});

// 插入标签
function addTag(tag: { code: string; name: string }) {
  if (!tag.code) {
    toast.error('标签代码不能为空');
  }
  selectedTags.value = selectedTags.value ?? [];
  if (!selectedTags.value!.find((t) => t.code === tag.code)) {
    selectedTags.value!.push(tag);
  }
  showPopup.value = false;
  searchText.value = '';
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
      label="输入标签关键词"
      @focus="showPopup = suggestions.length > 0"
      id="tag-search-input"
      color="primary"
    >
      <v-menu
        :model-value="suggestions.length > 0"
        :close-on-content-click="false"
        activator="parent"
        offset-y
      >
        <v-list>
          <v-list-item
            v-for="tag in suggestions"
            :key="tag.code"
            @click="addTag(tag)"
            style="cursor: pointer"
            >{{ tag.name }}</v-list-item
          >
        </v-list>
      </v-menu>
    </v-text-field>
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
