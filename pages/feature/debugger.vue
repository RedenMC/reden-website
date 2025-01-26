<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
useHead({
  title: t('reden.title.debugger'),
  titleTemplate: '%s - Reden',
});
</script>

<template></template>

<style scoped></style>
