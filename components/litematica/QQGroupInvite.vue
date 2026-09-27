<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
</script>

<template>
  <span v-if="locale === 'zh_cn'" class="qq-group-invite text-body-2">
    欢迎加入 Reden QQ 群，前沿生电尽在手中！
    <a
      href="https://qm.qq.com/q/Lkvc9Z39qS"
      target="_blank"
      rel="noopener noreferrer"
      >申请加入</a
    >
  </span>
</template>

<style scoped>
.qq-group-invite {
  color: rgb(var(--v-theme-primary));
  opacity: 0.8;
}

.qq-group-invite a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
