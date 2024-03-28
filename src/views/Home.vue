<script setup lang="ts">
import { ref } from 'vue';
import RedStoneSection from '@/components/RedStoneSection.vue';
import RedstoneSectionTitle from '@/components/RedstoneSectionTitle.vue';
import Feature from '@/views/Feature.vue';
import { discordInvite } from '@/constants';
import { useAppStore } from '@/store/app';
import AuiButton from '@/components/ui/AuiButton.vue';


const store = useAppStore()

const introContent = ref<HTMLElement | null>(null);

</script>

<template>
  <template class="main-page relative">
    <div class="w-full flex flex-row justify-between items-center">
      <div class="z-20">
        <div class="text-6xl font-['MinecraftTen'] drop-shadow shadow-white">Reden</div>
        <p style="font-size: larger" class="mt-2">
            {{ $t('reden.description') }}
        </p>
      </div>
      <div :class="store.theme == 'light'? 'before:bg-white':'before:bg-black'" class="absolute right-10 z-0 md:relative md:ml-24 md:before:bg-transparent
before:absolute before:w-full before:h-full before:top-0 before:left-0 before:z-10 before:bg-opacity-45 top-1/2 -translate-y-[40%]">
          <v-img src="/reden_256.png" class="w-56 md:w-[9rem]" />
      </div>
    </div>
    <div class="w-full font-['MinecraftTen'] mt-8 sm:mt-4 flex h-8 flex-col sm:flex-row">
      <RouterLink to="/download">
        <AuiButton class="w-full sm:w-60 text-lg h-8" theme="allow">
          <svg class="w-6 h-6 mt-1.5" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7l7-7zM5 18v2h14v-2H5z" fill="currentColor"></path></svg>
          <div>{{ $t('reden.download') }}</div>
        </AuiButton>
      </RouterLink>
      <div class="sm:ml-5 h-7 sm:h-8 flex gap-2 w-full">
        <a href="https://github.com/zly2006/reden-is-what-we-made"><AuiButton class="h-full" :theme="store.theme == 'light'&&'light'">Github</AuiButton></a>
        <a href="//wiki.redenmc.com"><AuiButton class="h-full" :theme="store.theme == 'light'&&'light'">{{ $t('reden.wiki') }}</AuiButton></a>
      </div>
    </div>
  </template>
<!-- 历史的开始 -->
<!--  <div class="main-page">-->
<!--    <div>-->
<!--      <v-row>-->
<!--        <v-col>-->
<!--          <h1 class="text-h2 font-weight-bold">Reden</h1>-->
<!--          <p style="font-size: larger">-->
<!--            {{ $t('reden.description') }}-->
<!--          </p>-->
<!--        </v-col>-->
<!--        <v-col cols="3" class="icon">-->
<!--          <v-img src="/reden_256.png" width="148" />-->
<!--        </v-col>-->
<!--      </v-row>-->
<!--      <div class="buttons">-->
<!--        <v-btn-->
<!--          class="main-button"-->
<!--          prepend-icon="mdi-download"-->
<!--          size="x-large"-->
<!--          rounded="rounded"-->
<!--          color="primary"-->
<!--          href="/download"-->
<!--        >-->
<!--          {{ $t('reden.download') }}-->
<!--        </v-btn>-->
<!--        <v-btn-->
<!--          class="main-button"-->
<!--          href="https://github.com/zly2006/reden-is-what-we-made"-->
<!--          prepend-icon="mdi-github"-->
<!--          size="x-large"-->
<!--          rounded="rounded"-->
<!--          variant="outlined"-->
<!--        >-->
<!--          Github-->
<!--        </v-btn>-->
<!--        <v-btn-->
<!--          class="main-button"-->
<!--          href="//wiki.redenmc.com"-->
<!--          prepend-icon="mdi-book-open"-->
<!--          size="x-large"-->
<!--          rounded="rounded"-->
<!--          variant="outlined"-->
<!--        >-->
<!--          {{ $t('reden.wiki') }}-->
<!--        </v-btn>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!-- 历史的终末 -->

  <div class="intro-content" ref="introContent">
    <Feature />
    <div class="community-intro content-common">
      <RedstoneSectionTitle :title="$t('reden.home.community_intro.title')" />
      <RedStoneSection :size="3">
        <template #title> Open Source </template>
        <template #text>
          <p>
            {{ $t('reden.home.community_intro.open_source') }}
          </p>
        </template>
        <template #action>
          <v-btn
            href="//github.com/zly2006/reden-is-what-we-made"
            color="primary"
            variant="outlined"
            rounded="rounded"
            class="main-button"
          >
            Github
          </v-btn>
        </template>
      </RedStoneSection>
      <RedStoneSection :size="3">
        <template #title> Sponsors </template>
        <template #text>
          <p>
            {{ $t('reden.home.community_intro.sponsor') }}
          </p>
        </template>
        <template #action>
          <v-btn
            href="/sponsors"
            color="primary"
            variant="outlined"
            rounded="rounded"
            class="main-button"
          >
            Sponsors
          </v-btn>
        </template>
      </RedStoneSection>
      <RedStoneSection :size="3">
        <template #title> Wiki </template>
        <template #text>
          <p>
            {{ $t('reden.home.community_intro.wiki') }}
          </p>
        </template>
        <template #action>
          <v-btn
            href="//wiki.redenmc.com"
            color="primary"
            variant="outlined"
            rounded="rounded"
            class="main-button"
          >
            Wiki
          </v-btn>
        </template>
      </RedStoneSection>
      <RedStoneSection :size="3">
        <template #title> Discord </template>
        <template #text>
          <p>
            {{ $t('reden.home.community_intro.discord') }}
          </p>
        </template>
        <template #action>
          <v-btn
            :href="discordInvite"
            color="primary"
            variant="outlined"
            rounded="rounded"
            class="main-button"
          >
            Discord
          </v-btn>
        </template>
      </RedStoneSection>
    </div>
  </div>
</template>

<style scoped>
body {
  --side-padding: 16px;
}

.main-page {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 64px;
  height: calc(100vh - 120px);
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 750px) {
    .icon {
      display: none;
    }
  }
}

* {
  touch-action: manipulation;
}

.main-button {
  margin: 6px;
}
</style>
