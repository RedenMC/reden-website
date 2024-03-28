<script setup lang="ts">
import NetherPortalVideo from '@/assets/nether_protal.mp4';
import RedStoneSection from '@/components/RedStoneSection.vue';
import RedstoneSectionTitle from '@/components/RedstoneSectionTitle.vue';
import AuiButton from '@/components/ui/AuiButton.vue';
</script>

<template>
<!--  <div class="features-intro content-common">-->
    <RedstoneSectionTitle :title="$t('reden.home.feature_intro.title')" />
    <RedStoneSection :video="NetherPortalVideo" :size="3">
      <template #title> Undo </template>
      <template #text>
        <p>
          {{ $t('reden.home.feature_intro.undo') }}
        </p>
      </template>
      <template #action>
        <RouterLink to="/feature/undo">
          <AuiButton class="w-32">{{ $t('reden.learn_more') }}</AuiButton>
        </RouterLink>
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
        <RouterLink to="/feature/rvc">
          <AuiButton class="w-32">{{ $t('reden.learn_more') }}</AuiButton>
        </RouterLink>
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
        <RouterLink to="/feature/debugger">
          <AuiButton class="w-32">{{ $t('reden.learn_more') }}</AuiButton>
        </RouterLink>
      </template>
    </RedStoneSection>
<!--  </div>-->
</template>

<style scoped></style>
