<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const localePath = useLocalePath();

const { t } = useI18n();
useHead({
  title: t('admin.title.admin'),
  titleTemplate: '%s - Reden',
});
definePageMeta({
  needLogin: true,
  needAdmin: true,
});
</script>

<template>
  <v-container class="content-common">
    <v-row>
      <v-col>
        <v-card :to="localePath('/admin/users')" min-width="200">
          <v-card-title> User List </v-card-title>
        </v-card>
      </v-col>
      <v-col>
        <v-card :to="localePath('/admin/security-logs')" min-width="200">
          <v-card-title> Security Logs </v-card-title>
        </v-card>
      </v-col>
      <v-col>
        <v-card :to="localePath('/admin/comments')" min-width="200">
          <v-card-title> 评论管理 </v-card-title>
          <v-card-text> 查看全站评论 </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card :to="localePath('/admin/device-clients')" min-width="200">
          <v-card-title> Device Flow Clients </v-card-title>
          <v-card-text> Manage 3rd party app authentication </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card :to="localePath('/litematica/review')" min-width="200">
          <v-card-title> 投影审核后台 </v-card-title>
        </v-card>
      </v-col>
      <v-col>
        <v-card :to="localePath('/tags')" min-width="200">
          <v-card-title> {{ t('tags.title') }} </v-card-title>
          <v-card-text> {{ t('tags.admin.description') }} </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card href="/api/quark" min-width="200">
          <v-card-title> Quark </v-card-title>
          <v-card-text> Quark Maintenance </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card href="/api/admin/litematica/stat" min-width="200">
          <v-card-title> 投影下载使用统计 </v-card-title>
          <v-card-text> 上一周投影下载使用情况统计 </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
