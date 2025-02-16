<script lang="ts" setup>
import { ref } from 'vue';
import RedStoneSection from '@/components/RedStoneSection.vue';
import RedstoneSectionTitle from '@/components/RedstoneSectionTitle.vue';
import Feature from '@/pages/feature/index.vue';

import {
  discordInvite,
  doFetchGet,
  githubLink,
  toastError,
} from '@/utils/constants';
import '@/assets/main.css';
import { useBackendMeta } from '~/store/meta';
import { toast } from 'vuetify-sonner';
import { useAppStore } from '~/store/app';
import type {
  ListLitematicaResponse,
  LitematicaAuthorProfile,
  MachineDef,
} from '~/pages/litematica/index.vue';
import RedstonePostCard from '~/components/homePage/RedstonePostCard.vue';

const appStore = useAppStore();
const introContent = ref<HTMLElement | null>(null);
const localePath = useLocalePath();

const { t, locale } = useI18n();
useHead({
  title: t('reden.title.home_full'),
  titleTemplate: '%s - Reden',
});
useSeoMeta({
  description: t('reden.description'),
});

const backendInfo = useBackendMeta();
const topRedstonePosts = ref<MachineDef[]>([]);
const topAuthorIds = [
  '%E7%81%AB%E5%BC%A6%E6%9C%88',
  'Scorpio',
  'Menggui233',
  '%E9%87%91%E5%90%88%E6%AC%A2%E9%85%B1',
  'Molforte',
];
const { data: topAuthors } = useAsyncData<LitematicaAuthorProfile[]>(
  async () => {
    const authors = [];
    for (const id of topAuthorIds) {
      try {
        const { data } = await useFetch<LitematicaAuthorProfile>(
          `/api/mc-services/litematica/profile/${id}?lang=${locale.value}`,
        );
        authors.push(data.value!);
      } catch (error) {
        console.error(`Error fetching data for id ${id}:`, error);
      }
    }
    return authors;
  },
);

const idList = [
  'b76c2b70-90d2-425e-b007-1d2e56f6fae5',
  'fe80a637-821f-4f7b-ae89-f8b6fc9fffd0',
  'pdc-stack-raid-farm-v7',
  '919a63d1-da48-4406-964a-ea354dacfdf8',
  'MultipleParallelDuplicateLineMachines',
];
for (const id of idList) {
  try {
    const { data } = await useFetch<ListLitematicaResponse>(
      `/api/mc-services/yisibite/${id}/info/${locale.value}`,
      {
        key: `generators-${id}-${locale.value}`,
      },
    );
    topRedstonePosts.value.push(data.value!.d[0]);
  } catch (error) {
    console.error(`Error fetching data for id ${id}:`, error);
  }
}
</script>

<template>
  <div v-if="backendInfo.developmentMode">
    <v-alert closable close-label="关闭" icon="mdi-alert">
      <v-alert-title>开发模式选项</v-alert-title>
      <v-btn
        color="primary"
        @click="
          doFetchGet('/api/account/login-test-account').then((res) => {
            if (res.ok) {
              appStore.login('test', 1);
              toast.success('登录成功');
            } else {
              toastError(res);
            }
          })
        "
      >
        登录测试账号
      </v-btn>
    </v-alert>
  </div>
  <div class="main-page">
    <div>
      <v-row>
        <v-col>
          <h1 class="text-h2 text-md-h1 font-weight-bold">Reden</h1>
          <p class="opacity-80 text-h5">
            {{ $t('reden.description') }}
          </p>
        </v-col>
        <v-col class="icon" cols="3">
          <v-img class="d-none d-sm-block" src="/reden_256.png" width="148" />
        </v-col>
      </v-row>
      <div class="d-flex buttons">
        <v-btn
          :to="localePath('/litematica')"
          class="ma-2 text-none"
          color="primary"
          prepend-icon="mdi-download"
          rounded="rounded"
          size="x-large"
        >
          {{ t('reden.home.go_litematica') }}
        </v-btn>
        <v-btn
          :href="githubLink"
          class="ma-2"
          prepend-icon="mdi-github"
          rounded="rounded"
          size="x-large"
          variant="outlined"
        >
          Github
        </v-btn>
        <v-btn
          class="ma-2"
          href="https://wiki.redenmc.com"
          prepend-icon="mdi-book-open"
          rounded="rounded"
          size="x-large"
          variant="outlined"
        >
          {{ $t('reden.wiki') }}
        </v-btn>
      </div>
    </div>
  </div>
  <div class="d-flex flex-wrap">
    <v-container>
      <v-row class="ma-n2" no-gutters>
        <v-col class="pa-2" cols="12" md="6">
          <v-card class="card-hover rounded-lg overflow-hidden">
            <v-card-title
              class="text-h5 text-sm-h4 font-weight-semibold text-center text-white pa-4"
            >
              {{ $t('reden.card.redStoneTitle') }}
            </v-card-title>
            <v-container class="pa-5" fluid>
              <v-carousel cycle hide-delimiters>
                <v-carousel-item
                  v-for="(post, index) in topRedstonePosts"
                  :key="index"
                  class="h-100"
                >
                  <RedstonePostCard :post="post" />
                </v-carousel-item>
              </v-carousel>
            </v-container>
          </v-card>
        </v-col>

        <v-col class="pa-2" cols="12" md="6">
          <v-card class="card-hover rounded-lg overflow-hidden">
            <v-card-title
              class="text-h5 text-sm-h4 text-center text-white pa-4"
            >
              {{ $t('reden.card.subscribeTitle') }}
            </v-card-title>
            <v-container class="pa-5" fluid>
              <v-expansion-panels variant="accordion">
                <v-expansion-panel
                  v-for="(item, index) in topAuthors"
                  :key="index"
                  class="rounded-0"
                >
                  <v-expansion-panel-title
                    class="d-flex flex-row justify-space-between"
                    style="line-height: 32px"
                  >
                    <span class="mr-3">
                      <v-avatar :image="item.author.avatarUrl" :size="32" />
                      {{ item.author.username }}
                    </span>

                    <span v-if="false" class="align-center">
                      <v-icon
                        color="warning"
                        icon="mdi-file-document"
                        size="small"
                      />
                      <!--    书签还没做好-->
                      {{ item.totalBookmarks }}
                    </span>
                    <span class="align-center">
                      <v-icon color="error" icon="mdi-heart" size="small" />
                      {{ item.totalVoteUps }}
                    </span>
                    <span class="align-center">
                      <v-icon color="info" icon="mdi-download" size="small" />
                      {{ item.totalDownloads }}
                    </span>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-btn
                      :to="localePath(`/@${item.author.username}`)"
                      color="primary"
                      rounded="rounded"
                    >
                      {{ $t('reden.card.viewProfile') }}
                    </v-btn>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <div ref="introContent" class="intro-content">
    <div class="content-common">
      <p>
        Reden 的名字来自于 Redstone Eden，意为红石伊甸园。我们希望 Reden
        能成为一个 Minecraft
        红石爱好者的乐园，为玩家提供丰富的红石机器、配置、教程等资源。
        我们致力于打造一个开放、友好的社区，欢迎各位加入我们！
      </p>
      <p>
        Reden 本是我的模组的名字，同时也是这个社区的名字。
        不管是我的模组还是这个社区，都是为了让玩家更好地享受游戏，更好地创造。
        Reden 承载着通过代码与技术方便玩家的初衷，也指引着我们的社区朝着更开放、
        包容、高技术力量的方向发展。
      </p>
      <p>
        从专门生成世吞等机器的专用网站，到现在的红石爱好者社区，Reden
        一直在不断发展。到2025年2月，Reden已经拥有数百个红石机器，和数万次下载，成为了
        Minecraft 红石社区中的一股新力量。 Reden
        拥有多项独创性技术正在开发或已经上线，包括：更好的投影预览功能，
        红石机器产物速率标注功能，红石机器的自动化生成，投影在线编辑技术，基于游戏内模组的机器一键下载一键使用等等。
      </p>
      <p>下面是对于模组功能和社区组成部分的介绍</p>
    </div>
    <Feature />
    <div class="content-common">
      <v-row class="community-intro">
        <v-col>
          <v-card color="light-blue">
            <v-card-title>
              {{ $t('litematica_generator.title') }}
            </v-card-title>
            <v-card-text>
              {{ $t('litematica_generator.description') }}
            </v-card-text>
            <v-card-actions>
              <v-btn :to="localePath('/litematica')" color="White">Go</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col>
          <v-card color="orange">
            <v-card-title>Github 同步</v-card-title>
            <v-card-text>
              绑定 GitHub Apps，同步机器、配置、你关注的仓库和创作者：你的世界！
            </v-card-text>
            <v-card-actions>
              <v-btn :to="localePath('/home')" color="White">点击前往</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <RedstoneSectionTitle :title="$t('reden.home.community_intro.title')">
        <template #default="{ leverOn }">
          <RedStoneSection :lever-on="leverOn" :size="3">
            <template #title> Open Source</template>
            <template #text>
              <p>
                {{ $t('reden.home.community_intro.open_source') }}
              </p>
            </template>
            <template #action>
              <v-btn
                :href="githubLink"
                class="ma-2"
                color="primary"
                rounded="rounded"
                variant="outlined"
              >
                Github
              </v-btn>
            </template>
          </RedStoneSection>
          <RedStoneSection :lever-on="leverOn" :size="3">
            <template #title> Sponsors</template>
            <template #text>
              <p>
                {{ $t('reden.home.community_intro.sponsor') }}
              </p>
            </template>
            <template #action>
              <v-btn
                :to="localePath('/sponsors')"
                class="ma-2"
                color="primary"
                rounded="rounded"
                variant="outlined"
              >
                Sponsors
              </v-btn>
            </template>
          </RedStoneSection>
          <RedStoneSection :lever-on="leverOn" :size="3">
            <template #title> Wiki</template>
            <template #text>
              <p>
                {{ $t('reden.home.community_intro.wiki') }}
              </p>
            </template>
            <template #action>
              <v-btn
                class="ma-2"
                color="primary"
                href="//wiki.redenmc.com"
                rounded="rounded"
                variant="outlined"
              >
                Wiki
              </v-btn>
            </template>
          </RedStoneSection>
          <RedStoneSection :lever-on="leverOn" :size="3">
            <template #title> Discord</template>
            <template #text>
              <p>
                {{ $t('reden.home.community_intro.discord') }}
              </p>
            </template>
            <template #action>
              <v-btn
                :href="discordInvite"
                class="ma-2"
                color="primary"
                rounded="rounded"
                variant="outlined"
              >
                Discord
              </v-btn>
            </template>
          </RedStoneSection>
        </template>
      </RedstoneSectionTitle>
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
  height: 70vh;
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  @media (max-width: 560px) {
    .icon {
      display: none;
    }
  }
}

.card-hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  background: linear-gradient(135deg, #4c9eff, #a3c7ff);
}

.card-hover:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.v-window {
  height: 100% !important;
  overflow: hidden;
}
</style>
