<script lang="ts" setup>
import { ref } from 'vue';

const name = ref('');
const isChinese = ref(true);
const chinaId = ref('');
const chinaPhone = ref('');
const chinaAddress = ref('');
const url = ref('');
const content = ref('');
type ViolationType =
  | 'Trademark'
  | 'MinecraftDesign'
  | 'Image'
  | 'Video'
  | 'Other';
const violationType = ref<ViolationType>('Trademark');

const { t } = useI18n();
useHead({
  title: t('reden.title.copyright_complaint'),
  titleTemplate: '%s - Reden',
});
</script>

<template>
  <div class="content-common">
    <v-alert type="warning">
      <v-alert-title>页面还在建设中</v-alert-title>
      此页面还在建设中，如果您有任何问题，请联系我们。邮箱： info@redenmc.com
    </v-alert>
    <v-form>
      Reden
      是在中国大陆运营的网站，我们尊重知识产权，我们也希望用户尊重知识产权。
      Reden 上的内容受到《中华人民共和国著作权法》和其他知识产权法律的保护。
      如果您认为我们的网站上的内容侵犯了您的知识产权，请填写下表，我们会尽快处理。
      <!-- 姓名 -->
      <v-text-field
        v-model="name"
        color="primary"
        density="comfortable"
        label="姓名"
        outlined
      />
      <!-- 你是中华人民共和国公民吗 -->
      <v-radio-group
        v-model="isChinese"
        color="primary"
        density="comfortable"
        label="你是中华人民共和国公民（或法人实体）吗"
      >
        <v-radio :value="true" label="是"></v-radio>
        <v-radio :value="false" label="否"></v-radio>
      </v-radio-group>

      <template v-if="isChinese">
        <!-- 中国大陆身份证号码 -->
        <v-text-field
          v-model="chinaId"
          color="primary"
          density="comfortable"
          label="身份证号码（或统一社会信用代码）"
          outlined
        />
        <!-- 中国大陆手机号码 -->
        <v-text-field
          v-model="chinaPhone"
          color="primary"
          density="comfortable"
          label="手机号码"
          outlined
        />
        <!-- 中国大陆地址 -->
        <v-text-field
          v-model="chinaAddress"
          color="primary"
          density="comfortable"
          label="地址"
          outlined
        />
      </template>

      <!-- 侵权类型 -->
      <v-radio-group
        v-model="violationType"
        color="primary"
        density="comfortable"
        label="侵权类型"
      >
        <v-radio label="商标" value="Trademark"></v-radio>
        <v-radio label="Minecraft 机器设计" value="MinecraftDesign"></v-radio>
        <v-radio label="图片" value="Image"></v-radio>
        <v-radio label="视频" value="Video"></v-radio>
        <v-radio label="其他" value="Other"></v-radio>
      </v-radio-group>

      <!-- 链接 -->
      <v-text-field
        v-model="url"
        color="primary"
        density="comfortable"
        label="侵权页面链接"
        outlined
      />

      <!-- 侵权内容 -->
      <v-textarea
        v-model="content"
        color="primary"
        density="comfortable"
        label="详述侵权内容"
        outlined
      />

      <v-file-input
        color="primary"
        density="comfortable"
        label="附件"
        outlined
      />
      请打包成 zip 文件上传，包含以下内容：
      投诉人的身份证明、权属证明、侵权内容截图、
      授权委托文件（如有委托）、投诉书
    </v-form>
  </div>
</template>

<style scoped></style>
