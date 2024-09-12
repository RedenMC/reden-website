<script setup lang="ts">
import RedStoneSection from '@/components/RedStoneSection.vue';
import RedstoneSectionTitle from '@/components/RedstoneSectionTitle.vue';

const localePath = useLocalePath();
definePageMeta({
  title: 'reden.title.features',
});
</script>

<template>
  <div class="features-intro content-common">
    <RedstoneSectionTitle :title="$t('reden.home.feature_intro.title')" />
    <RedStoneSection video="/video/nether_protal.mp4" :size="3">
      <template #title> Undo </template>
      <template #text>
        <p>
          {{ $t('reden.home.feature_intro.undo') }}
        </p>
      </template>
      <template #action>
        <v-btn
          :to="localePath('/feature/undo')"
          color="primary"
          rounded="rounded"
          variant="outlined"
          class="main-button"
        >
          {{ $t('reden.learn_more') }}
        </v-btn>
      </template>
    </RedStoneSection>
    <RedStoneSection :size="3">
      <template #title> RVC </template>
      <template #text>
        <p>
          {{ $t('reden.home.feature_intro.rvc') }}
        </p>
      </template>
      <template #action>
        <v-btn
          :to="localePath('/feature/rvc')"
          color="primary"
          variant="outlined"
          rounded="rounded"
          class="main-button"
        >
          {{ $t('reden.learn_more') }}
        </v-btn>
      </template>
    </RedStoneSection>
    <RedStoneSection :size="3">
      <template #title> Reden Debugger </template>
      <template #text>
        <p>
          {{ $t('reden.home.feature_intro.debugger') }}
        </p>
      </template>
      <template #action>
        <v-btn
          :to="localePath('/feature/debugger')"
          color="primary"
          variant="outlined"
          rounded="rounded"
          class="main-button"
        >
          {{ $t('reden.learn_more') }}
        </v-btn>
      </template>
    </RedStoneSection>
  </div>
</template>

<style scoped></style>
