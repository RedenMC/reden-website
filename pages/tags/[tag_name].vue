<script setup lang="ts">
import { useRoute } from '#vue-router';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '~/store/app';
import { ref } from 'vue';

const route = useRoute();
const router = useRouter();
const tagName = route.params.tag_name as string;
const { t, locale } = useI18n();
const localePath = useLocalePath();
const appStore = useAppStore();
</script>

<template></template>

<style scoped></style>
