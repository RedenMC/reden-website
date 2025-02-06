<script lang="ts" setup>
import {ref} from 'vue';
import RedStoneSection from '@/components/RedStoneSection.vue';
import RedstoneSectionTitle from '@/components/RedstoneSectionTitle.vue';
import Feature from '@/pages/feature/index.vue';
import RedstoneSubmissionCard from '@/components/homePage/RedstoneSubmissionCard.vue';

import {
  discordInvite,
  doFetchGet,
  githubLink,
  toastError,
} from '@/utils/constants';
import '@/assets/main.css';
import {useBackendMeta} from '~/store/meta';
import {toast} from 'vuetify-sonner';
import {useAppStore} from '~/store/app';
import {useRouter} from "vue-router";
import type {ListLitematicaResponse} from '~/pages/litematica/index.vue';

const appStore = useAppStore();
const introContent = ref<HTMLElement | null>(null);
const localePath = useLocalePath();

const {t} = useI18n();
useSeoMeta({
  title: t('reden.title.home_full') + ' - Reden',
  description: t('reden.description'),
});

const backendInfo = useBackendMeta();

let topRedstoneSubmissions = ref([]);

const topAuthors = [
  // 同样，这里应该是从数据库或API获取的数据
  {
    avatar: 'https://avatars.githubusercontent.com/u/88337896?v=4',
    name: '咕咕咕',
    totalSubmissions: 462,
    totalFavorites: 50,
    totalDownloads: 1992,
    desc: "作者描述作者描述",
    url: '/@金合欢酱'
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/88337896?v=4',
    name: '咯咯哒',
    totalSubmissions: 78,
    totalFavorites: 50,
    totalDownloads: '12k',
    desc: "作者描述作者描述",
    url: '/@金合欢酱'
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/88337896?v=4',
    name: '哥哥哥哥',
    totalSubmissions: 45,
    totalFavorites: 50,
    totalDownloads: '27k',
    desc: "作者描述作者描述",
    url: '/@金合欢酱'
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/88337896?v=4',
    name: 'kemoji',
    totalSubmissions: 62,
    totalFavorites: 50,
    totalDownloads: '996',
    desc: "作者描述作者描述",
    url: '/@金合欢酱'
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/88337896?v=4',
    name: 'kemoji',
    totalSubmissions: 62,
    totalFavorites: 50,
    totalDownloads: '996',
    desc: "作者描述作者描述",
    url: '/@金合欢酱'
  },
]

const router = useRouter();

function viewAuthor(path: any) {
  console.log(path)
  router.push({path: path});
}

const {locale} = useI18n()

const idList = ["b76c2b70-90d2-425e-b007-1d2e56f6fae5", "fe80a637-821f-4f7b-ae89-f8b6fc9fffd0", "pdc-stack-raid-farm-v7", "919a63d1-da48-4406-964a-ea354dacfdf8", "MultipleParallelDuplicateLineMachines"];
for (const id of idList) {
  try {
    const {data, status, error} = await useFetch<ListLitematicaResponse>(
      `/api/mc-services/yisibite/${id}/info/${locale.value}`,
      {
        key: `generators-${id}-${locale.value}`,
      },
    );
    console.log("newData,", data.value);
    const realData = data.value.d[0]
    topRedstoneSubmissions.value.push({
      image: realData.imageUrl,
      name: realData.name,
      author: realData.author.username,
      authorAvatar: realData.author.avatarUrl,
      downloads: realData.downloads,
      url: '/litematica/' + id
    });
  } catch (error) {
    console.error(`Error fetching data for id ${id}:`, error);
  }
}

</script>

<template>
  <div v-if="backendInfo.developmentMode">
    <v-alert closable close-label="关闭" icon="mdi-alert">
      <v-alert-title> 开发模式选项</v-alert-title>
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
          <v-img class="d-none d-sm-block" src="/reden_256.png" width="148"/>
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
    <v-container class="parent-container">
      <v-row class="card-row" no-gutters>
        <v-col cols="12" md="6" class="card-column">
          <v-card class="redstone-machine-card ma-4 ">
            <v-card-title class="text-h5 text-sm-h4 font-weight-semibold card-title">
              {{ $t('reden.card.redStoneTitle') }}
            </v-card-title>
            <v-container class="submissions-list inner-container" fluid>
              <v-carousel hide-delimiters cycle>
                <v-carousel-item v-for="(submission, index) in topRedstoneSubmissions" :key="index"
                                 style="height: 100% !important;">
                  <RedstoneSubmissionCard :submission="submission"/>
                </v-carousel-item>
              </v-carousel>
            </v-container>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" class="card-column">
          <v-card class="redstone-machine-card ma-4 ">
            <v-card-title class="text-h5 text-sm-h4 font-weight-semibold card-title">
              {{ $t('reden.card.subscribeTitle') }}
            </v-card-title>
            <v-container class="authors-list inner-container" fluid>
              <v-expansion-panels class="my-4" variant="accordion">
                <v-expansion-panel class="author-panel"
                                   v-for="(item, index) in topAuthors" :key="index"
                >
                  <v-expansion-panel-title class="author-item-title">
                    <span @click.stop="viewAuthor(item.url)" class="author-item-flex-col">
                      <v-avatar :image="item.avatar" size="small"></v-avatar>
                      <span class="author-subItem author-name">{{ item.name }}</span>
                    </span>

                    <span class="ml-4 author-item-flex-col">
                      <v-icon color="warning" icon="mdi-file-document" size="small"/>
                      <span class="author-subItem">{{ item.totalSubmissions }}</span>
                    </span>
                    <span class="ml-4 author-item-flex-col">
                      <v-icon color="error" icon="mdi-heart" size="small"/>
                      <span class="author-subItem">{{ item.totalFavorites }}</span>
                    </span>
                    <span class="ml-4 author-item-flex-col">
                      <v-icon color="info" icon="mdi-download" size="small"/>
                      <span class="author-subItem">{{ item.totalDownloads }}</span>
                    </span>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    {{ item.desc }}
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
    <Feature/>
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

.buttons {
  flex-direction: row;
  flex-wrap: wrap;

  @media (max-width: 400px) {
    flex-direction: column;
    margin: 0 auto;
    max-width: 240px;
  }
}

* {
  touch-action: manipulation;
}

.min-w-380 {
  min-width: 380px;
}

.parent-container {
}

.card-row {
  display: flex;
  justify-content: space-between;
}

.redstone-machine-card,
.favorite-authors-card {
  background-size: cover;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.redstone-machine-card:hover,
.favorite-authors-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.redstone-machine-card {
  background: linear-gradient(135deg, #4c9eff, #a3c7ff); /* 蓝白渐变 */
}


.favorite-authors-card {
  background: linear-gradient(135deg, #33b5e5, #0099cc);
}

.card-title {
  color: white;
  padding: 1rem;
  text-align: center;
}

.submissions-list,
.authors-list {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-subItem {
  margin-left: 12px;
}

/* 确保在移动设备上有良好的响应性 */
@media (max-width: 768px) {
  .card-row {
    flex-direction: column;
  }

  .author-item-flex-col {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 48px;
  }

  .author-subItem {
    margin-top: 4px;
    margin-left: 0;
  }

  .author-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ::v-deep .v-window__controls {
    display: none !important;
  }

  .author-panel:last-child {
    display: none;
  }
}

.v-window {
  height: 100% !important;
  overflow: hidden;
}


.author-item-title {
  display: flex;
  align-items: center;
}

.inner-container {
  height: 360px;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.v-expansion-panel {
  border-radius: 0;
}
</style>
