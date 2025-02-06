<template>
  <v-card class="submission-card" @click="goToSubmissionPage">
    <div
      class="background-image"
      :style="{ backgroundImage: `url(${submission.image})` }"
    >
      <div class="inner-img-container">
        <v-img :aspect-ratio="16 / 9" :src="submission.image" />
      </div>
    </div>
    <div class="card-content">
      <v-card-title class="submission-card__title">{{ submission.name }}</v-card-title>
      <v-card-subtitle class="submission-card__subtitle author">
        {{ $t('reden.card.author') }}:
        <span><v-avatar :image="submission.authorAvatar" size="x-small"></v-avatar></span>
        <span>{{ submission.author }}</span>
      </v-card-subtitle>
      <v-card-subtitle class="submission-card__subtitle downloads">
        {{ $t('reden.card.downloads') }}:
        <v-chip x-small label color="blue lighten-4" text-color="blue darken-2" class="ml-1">
          {{ submission.downloads }}
        </v-chip>
      </v-card-subtitle>
    </div>
  </v-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { defineProps } from 'vue';

const props = defineProps({
  submission: Object
});

const { t } = useI18n();
const router = useRouter();

function goToSubmissionPage() {
  // 跳转到对应的稿件页面逻辑
  console.log('Navigating to submission page');
  // 这里可以根据实际情况添加导航逻辑，例如：
  router.push({ path: props.submission.url });
}
</script>

<style scoped>
.submission-card {
  transition: transform 0.3s, box-shadow 0.3s;
  background: rgb(var(--v-theme-background));
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  border-radius: 0;

}

.submission-card:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

.background-image {
  position: relative;
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
}

.inner-img-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
}

.enlarged-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  opacity: 0;
}

.zoom-enter-active, .zoom-leave-active {
  transition: opacity 0.3s ease;
}

.zoom-enter-to, .zoom-leave-from {
  opacity: 1;
}

.card-content {
  padding: 8px;
}

.submission-card__title {
  font-size: 1.2rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-background));
  margin-bottom: 8px;
}

.submission-card__subtitle {
  font-size: 0.9rem;
  color: rgb(var(--v-theme-on-background));
  font-weight: bold;
}

.overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}

.view-icon {
  cursor: pointer;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>



