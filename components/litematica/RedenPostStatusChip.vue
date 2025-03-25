<template>
  <v-chip :color="colorMap[value]">
    {{ t('reden.post.status.' + String(value).toLowerCase()) }}
    <v-tooltip
      location="top"
      v-if="value === PostStatus.Approved"
      activator="parent"
    >
      审核通过仅表示此内容符合社区规定，不代表内容的真实性和著作权有效。<br />
      如有侵权请联系我们。
    </v-tooltip>
  </v-chip>
</template>
<script lang="ts" setup>
const props = defineProps<{
  value: PostStatus;
}>();
const { t } = useI18n();

const colorMap: Record<PostStatus, string> = {
  Pending: 'grey',
  Approved: 'green',
  Rejected: 'red',
  Deleted: 'red',
  TakenDown: 'red',
};
</script>
