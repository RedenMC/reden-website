<script lang="ts" setup>
import { ref } from 'vue';
import { useAppStore } from '~/store/app';
import { type SubmitEventPromise, useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import SizeInput from '~/components/litematica/SizeInput.vue';
import 'assets/main.css';
import type {
  ListLitematicaResponse,
  Machine,
  MachineDef,
} from '~/pages/litematica/index.vue';
import { parseBVID } from '~/utils/constants';
import BottomBarAd from '~/components/ads/BottomBarAd.vue';
import SidebarAd from '~/components/ads/SidebarAd.vue';
import { type Condition, parseCondition } from '~/utils/conditionParser';
import RedenRouter from '~/components/RedenRouter.vue';
import type { VForm } from 'vuetify/components';
import { toast } from 'vuetify-sonner';

const route = useRoute();
const xSize = ref(0);
const ySize = ref(0);
const zSize = ref(0);
const loading = ref(false);
const machineId = route.params.name as string;
const { t, locale } = useI18n();
const localePath = useLocalePath();
const appStore = useAppStore();
const openEditDialog = ref(false);
const backUrl = route.query.backUrl as string;
const { data: localizedData } = useNuxtData<Record<string, MachineDef>>(
  `edit-${machineId}`,
);

const { data: serverResponse } = useNuxtData<ListLitematicaResponse>(
  `generators-${machineId}-${locale.value}`,
);

if (!serverResponse.value) {
  const { data, status, error } = await useFetch<ListLitematicaResponse>(
    `/api/mc-services/yisibite/${machineId}/info/${locale.value}`,
    {
      key: `generators-${machineId}-${locale.value}`,
    },
  );
  serverResponse.value = data.value;
  if (status.value === 'error') {
    console.error(serverResponse.value, status.value, error.value);
    throw createError({
      status: error.value?.statusCode ?? 500,
      message: JSON.stringify(error.value),
    });
  }
}
const { mobile } = useDisplay();
const generators = computed<Record<string, Machine>>(() => {
  if (serverResponse.value) {
    let machines: { [key: string]: Machine } = {};
    for (let key in serverResponse.value.d) {
      const defaultChecker: Condition[] = [() => true];
      const dto: ListLitematicaResponse['d'][''] = serverResponse.value.d[key];
      machines[key] = {
        ...dto,
        conditions: {
          x:
            dto.conditions?.x?.map((s) => parseCondition(s, t)) ??
            defaultChecker,
          y:
            dto.conditions?.y?.map((s) => parseCondition(s, t)) ??
            defaultChecker,
          z:
            dto.conditions?.z?.map((s) => parseCondition(s, t)) ??
            defaultChecker,
        },
      };
    }
    if (!machines[machineId]) {
      throw createError({
        status: 404,
        message: t('litematica_generator.not_found', { name: machineId }),
      });
    }
    useHead({
      title:
        machines[machineId]?.name +
        ' - Reden' +
        t('litematica_generator.title'),
    });
    return Object.keys(machines)
      .sort()
      .reduce((obj: Record<string, Machine>, key) => {
        obj[key] = machines[key];
        return obj;
      }, {});
  }
  return {};
});

async function submit(e: SubmitEventPromise) {
  if ((await e).valid) {
    // open a new window to download
    if (selected.value.type == 'LitematicaGen') {
      window.open(
        `/api/mc-services/yisibite/${machineId}?xSize=${xSize.value}&ySize=${ySize.value}&zSize=${zSize.value}`,
      );
    } else if (
      selected.value.type == 'LitematicaShare' &&
      selected.value.attachments?.length
    ) {
      window.open(`/api/mc-services/yisibite/${machineId}/download/1`);
    }
    setTimeout(() => {
      refreshNuxtData();
    }, 1000);
  }
}

const formRef = useTemplateRef<VForm>('form');

function openMaterials() {
  formRef.value?.validate().then((result) => {
    if (result.valid) {
      window.open(
        `/api/mc-services/yisibite/${machineId}/materials?xSize=${xSize.value}&ySize=${ySize.value}&zSize=${zSize.value}`,
      );
    }
  });
}

const selected = computed(() => generators.value[machineId]);

useSeoMeta({
  title: t('litematica_generator.web_title', {
    name: selected.value.name,
  }),
  ogTitle: t('litematica_generator.web_title', {
    name: selected.value.name,
  }),
  description:
    selected.value.description + t('litematica_generator.og_description'),
  ogDescription:
    selected.value.description + t('litematica_generator.og_description'),
  ogImage: 'https://redenmc.com/reden_256.png',
});
definePageMeta({
  name: 'litematica-name',
});
const biliPlayer = useTemplateRef<HTMLIFrameElement>('biliPlayer');
const bvid = computed(() => parseBVID(selected.value?.link));
const tabs = computed(() => {
  const tabs: {
    key: string;
    title: string;
  }[] = [];
  if (selected.value.imageUrl) {
    tabs.push({
      key: 'picture',
      title: '图片',
    });
  }
  if (bvid.value) {
    tabs.push({
      key: 'bilibili',
      title: 'Bilibili',
    });
  }
  return tabs;
});
const tab = ref(
  import.meta.server ? 'picture' : tabs.value[tabs.value.length - 1]?.key,
);
let blob = ref<Blob[]>([]);

async function loadBlob(index: number) {
  if (blob.value[index]) {
    return;
  }
  const url = selected.value.attachments?.[index]?.url;
  if (!url) {
    toast.error(`No url for index #${index}.`);
    return;
  }
  blob.value[index] = await (
    await fetch(
      url.startsWith('https://reden.oss-cn-shanghai.aliyuncs.com/')
        ? url
        : `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    )
  ).blob();
  if (blob.value[index].size === 0) {
    toast.error(`Blob size is 0 for index #${index}.`);
    debugger;
    return;
  }
  console.log('blob.value[index]', blob.value[index]);
}

async function cancelApproval() {
  if (window.confirm('确定下架？')) {
    const response = await doFetchDelete(
      `/api/mc-services/yisibite/${machineId}/approval`,
    );
    if (response.ok) {
      toast.success('下架成功');
    } else {
      toast.error('出现错误');
    }
  }
}
</script>

<template>
  <v-form ref="form" class="content-common" fast-fail @submit.prevent="submit">
    <v-btn
      :to="backUrl ?? localePath('/litematica')"
      class="mb-3 text-capitalize mr-3"
      prepend-icon="mdi-arrow-left"
      variant="tonal"
    >
      {{ $t('litematica_generator.view_all_designs') }}
    </v-btn>
    <v-btn
      :to="appStore.logined ? undefined : localePath('/login')"
      class="mb-3 text-capitalize"
      color="primary"
      variant="outlined"
      @click="
        () => {
          if (!localizedData && appStore.logined) {
            useFetch(`/api/mc-services/yisibite/${machineId}/info`, {
              key: `edit-${machineId}`,
            });
          }
        }
      "
    >
      {{ $t('litematica_generator.upload.edit_or_improve_translation') }}
      <v-dialog
        v-model="openEditDialog"
        activator="parent"
        close-on-back
        max-width="900"
        persistent
      >
        <v-card variant="flat">
          <LitematicaUpload v-model:machine="localizedData" edit-mode />
          <div class="position-absolute top-0 right-0">
            <v-btn
              icon="mdi-close"
              variant="plain"
              @click="openEditDialog = false"
            />
          </div>
        </v-card>
      </v-dialog>
    </v-btn>
    <v-btn
      v-if="appStore.userCache?.roles?.includes('archiver')"
      color="red"
      @click="cancelApproval"
    >
      下架
    </v-btn>

    <v-row justify="center">
      <h1>
        {{ selected?.name }}
      </h1>
    </v-row>
    <v-row justify="center" style="line-height: 32px">
      {{
        selected.original
          ? $t('litematica_generator.by.author')
          : $t('litematica_generator.by.uploader')
      }}
      <router-link
        v-if="selected.author"
        :to="localePath(`/@${selected.author.username}`)"
        class="d-flex flex-row router"
      >
        <v-avatar v-if="selected.author.avatarUrl" size="32">
          <v-img :src="selected.author.avatarUrl" />
        </v-avatar>
        {{ selected.author.username }}
      </router-link>
      <v-spacer style="max-width: 30px" />
      <v-chip v-if="selected">
        {{
          $t('litematica_generator.download_count', {
            count: selected?.downloads,
          })
        }}
      </v-chip>
    </v-row>
    <div v-if="!selected.original" class="opacity-60 text-body-2 mx-auto mt-3">
      <span class="text-amber-darken-1">
        {{ $t('litematica_generator.by.uploader_not_original_author') }}
      </span>
      {{ $t('litematica_generator.by.reason_uploaded') }}<br />
      {{ $t('litematica_generator.by.reason_uploaded_a') }}<br />
      {{ $t('litematica_generator.by.reason_uploaded_b') }}<br />
      {{ $t('litematica_generator.by.reason_uploaded_c') }}<br />
      {{ $t('litematica_generator.by.complaint') }}
      <a class="router" href="mailto:info@redenmc.com">contact us.</a>
    </div>
    <v-row>
      <v-col v-if="tabs.length !== 0">
        <v-card>
          <v-tabs v-model="tab" color="primary">
            <v-tab v-if="selected.imageUrl" value="picture">图片</v-tab>
            <v-tab v-if="bvid" value="bilibili">
              <v-icon size="lg">custom:Bilibili</v-icon>
              Bilibili
            </v-tab>
          </v-tabs>

          <v-card-text>
            <v-tabs-window v-model="tab">
              <v-tabs-window-item v-if="selected?.imageUrl" value="picture">
                <v-img :src="selected.imageUrl" width="100%" />
              </v-tabs-window-item>

              <v-tabs-window-item v-if="bvid" value="bilibili">
                <div class="bili-player-wrapper">
                  <iframe
                    ref="biliPlayer"
                    :src="`https://player.bilibili.com/player.html?isOutside=true&bvid=${bvid}`"
                    allowfullscreen
                    class="bili-player"
                  />
                </div>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="selected?.link" class="overflow-hidden" cols="12">
        <a v-if="!bvid" :href="selected.link" class="router text-no-wrap">
          <v-icon>mdi-link</v-icon>
          {{ selected.link }}
        </a>
      </v-col>
      <v-col
        v-if="selected?.description"
        class="overflow-hidden text-pre-wrap pa-5"
        cols="12"
      >
        <MDC class="description" :value="selected.description" />
      </v-col>
    </v-row>

    <template v-if="selected.type === 'LitematicaGen'">
      <v-row>
        <v-col>
          <v-card
            v-if="selected?.hasX || selected?.hasY || selected?.hasZ"
            border
          >
            <v-card-subtitle class="text-wrap pa-3">
              {{ $t('litematica_generator.size_description') }}
            </v-card-subtitle>
            <v-card-text>
              <SizeInput
                v-if="selected.hasX"
                v-model="xSize"
                :def="selected"
                xyz="x"
              />
              <SizeInput
                v-if="selected.hasY"
                v-model="ySize"
                :def="selected"
                xyz="y"
              />
              <SizeInput
                v-if="selected.hasZ"
                v-model="zSize"
                :def="selected"
                xyz="z"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-btn
          :loading="loading"
          class="ma-3"
          color="primary"
          type="button"
          variant="outlined"
          @click="openMaterials"
        >
          材料列表
        </v-btn>
        <v-btn :loading="loading" class="ma-3" color="primary" type="submit">
          {{ $t('litematica_generator.download') }}
        </v-btn>
      </v-row>
    </template>
    <template v-if="selected.type === 'LitematicaShare'">
      <h3>下载链接（临时版，每个链接都对应一个不同的文件）</h3>
      <v-list
        v-for="(attachment, index) in selected.attachments"
        :key="attachment.name"
        class="overflow-hidden"
      >
        <v-list-item border>
          <v-list-item-title>
            <p class="text-orange">
              下载链接{{ index + 1 }}
              <a class="router" @click="loadBlob(index)">
                <v-icon size="sm">mdi-eye</v-icon>
                预览
                <v-dialog :max-width="800" activator="parent" close-on-back>
                  <v-card :loading="!blob[index]">
                    <v-card-text>
                      <LitematicaPreview
                        v-if="blob[index]"
                        :blob="blob[index]"
                      />
                      <div v-else>
                        <v-progress-circular color="primary" indeterminate />
                        <span style="font-size: 1.25rem">
                          {{ $t('common.loading___') }}
                        </span>
                      </div>

                      <p
                        class="top-0 right-0 position-absolute mr-6 mt-4 text-white text-caption text-right opacity-60"
                        style="user-select: none; line-height: 0.75rem"
                      >
                        Credit to misode, Ending Credits & Undecentions <br />
                        This Vue component is made by zly2006 and licensed under
                        AGPL v3
                      </p>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </a>
            </p>
            <a
              :href="`/api/mc-services/yisibite/${machineId}/download/${index + 1}`"
              class="router text-no-wrap"
            >
              <v-icon>mdi-download</v-icon>
              {{ attachment.name }}
            </a>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
    <v-row v-if="!useAppStore().logined" class="text-sm-body-1">
      <v-col>
        <reden-router :to="localePath('/login')">
          {{ $t('litematica_generator.not_logged_in') }}
        </reden-router>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>FAQ</h3>
        <h4>17x17的空置域应该输入多少？</h4>
        <p>17x16=272，272的大小包含了两边各一格的铁砧墙宽度。</p>
        <h4>没有找到你想要的机器？</h4>
        <p>
          {{ $t('litematica_generator.contribute') }}
          <a class="router" href="mailto:me@redenmc.com">me@redenmc.com</a>
        </p>
        <br />
        <div class="text-center v-card-subtitle w-100">
          {{
            $t('litematica_generator.total_downloads', [
              serverResponse?.downloads,
            ])
          }}
        </div>
      </v-col>
    </v-row>
    <bottom-bar-ad />
    <bottom-bar-ad v-if="mobile" />
  </v-form>

  <div v-if="!mobile" style="position: absolute; right: 10px; top: 90px">
    <sidebar-ad />
  </div>
</template>

<style scoped>
p {
  font-size: 1em;
}

.bili-player-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
}

.bili-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-width: 0;
}

.description {
}

.description :deep(li) {
  margin-left: 1em;
}
</style>
