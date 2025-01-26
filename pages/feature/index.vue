<script lang="ts" setup>
import RedStoneSection from '@/components/RedStoneSection.vue';
import RedstoneSectionTitle from '@/components/RedstoneSectionTitle.vue';
import { useI18n } from 'vue-i18n';

const localePath = useLocalePath();
const { t } = useI18n();
useHead({
  // title: t('reden.title.features'),
  titleTemplate: '%s - Reden',
});
</script>

<template>
  <div class="features-intro content-common">
    <RedstoneSectionTitle :title="$t('reden.home.feature_intro.title')">
      <template #default="{ leverOn }">
        <RedStoneSection
          :lever-on="leverOn"
          :size="3"
          video="/video/nether_portal.mp4"
        >
          <template #title> Undo</template>
          <template #text>
            <p>
              {{ $t('reden.home.feature_intro.undo') }}
            </p>
          </template>
          <template #action>
            <v-btn
              :to="localePath('/feature/undo')"
              class="main-button"
              color="primary"
              rounded="rounded"
              variant="outlined"
            >
              {{ $t('reden.learn_more') }}
            </v-btn>
          </template>
        </RedStoneSection>
        <RedStoneSection :lever-on="leverOn" :size="3">
          <template #title> RVC</template>
          <template #text>
            <p>
              {{ $t('reden.home.feature_intro.rvc') }}
            </p>
          </template>
          <template #action>
            <v-btn
              :to="localePath('/feature/rvc')"
              class="main-button"
              color="primary"
              rounded="rounded"
              variant="outlined"
            >
              {{ $t('reden.learn_more') }}
            </v-btn>
          </template>
        </RedStoneSection>
        <RedStoneSection :lever-on="leverOn" :size="3">
          <template #title> Reden Debugger</template>
          <template #text>
            <p>
              {{ $t('reden.home.feature_intro.debugger') }}
            </p>
          </template>
          <template #action>
            <v-btn
              :to="localePath('/feature/debugger')"
              class="main-button"
              color="primary"
              rounded="rounded"
              variant="outlined"
            >
              {{ $t('reden.learn_more') }}
            </v-btn>
          </template>
        </RedStoneSection>
      </template>
    </RedstoneSectionTitle>
  </div>
</template>

<style scoped></style>
