<script setup lang="ts">
import Null from '/src/assets/null.png';

//import UndoIcon from '../../public/feature/Undo.png';
//import RVCIcon from '../../public/feature/RVC.png';
//import DebuggerIcon from '../../public/feature/Debugger.png';
import NetherPortalVideo from '@/assets/nether_protal.mp4';
import FeatureSection from '@/components/FeatureSection.vue';
import FeatureSectionTitle from '@/components/FeatureSectionTitle.vue';
</script>

<template>
  <div class="boundary height">
    <FeatureSectionTitle :title="$t('reden.home.feature_intro.title')" />
    <v-row>
      <v-col cols="12" md="4">
        <FeatureSection :icon="Null" :video="NetherPortalVideo" link="/feature/undo">
          <template #title> Undo </template>
          <template #text>
            <p>
              {{ $t('reden.home.feature_intro.undo') }}
            </p>
          </template>
        </FeatureSection>
      </v-col>
      <v-col cols="12" md="4">
        <FeatureSection :icon="Null" link="/feature/rvc">
          <template #title> RVC </template>
          <template #text>
            <p>
              {{ $t('reden.home.feature_intro.rvc') }}
            </p>
          </template>
        </FeatureSection>
      </v-col>
      <v-col cols="12" md="4">
        <FeatureSection :icon="Null" link="/feature/debugger">
          <template #title> Reden Debugger </template>
          <template #text>
            <p>
              {{ $t('reden.home.feature_intro.debugger') }}
            </p>
          </template>
        </FeatureSection>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.boundary {
  margin-left: 5%;
  margin-right: 5%;
}

@media (max-width: 600px) {
  .height{
    height: 1450px;
  }
}

@media (min-width: 600px) and (max-width: 960px) {
  .height{
    height: 940px;
  }
}

@media (min-width: 960px) {
  .height{
    height: 620px;
  }
}
</style>
