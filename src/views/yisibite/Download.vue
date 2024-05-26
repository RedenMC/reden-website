<script lang="ts" setup>
import { ref } from 'vue';
import { useAppStore } from '@/store/app';
import { SubmitEventPromise } from 'vuetify';
import RedenRouter from '@/router/RedenRouter.vue';
import { doFetchGet } from '@/constants';
import { useI18n } from 'vue-i18n';

const xSize = ref(0);
const ySize = ref(0);
const zSize = ref(0);
const loading = ref(false);
const name = ref('yisibite-world-eater');
const { t } = useI18n();

type Machine = {
  name: string;
  downloads?: number;
  available?: boolean | null;
  conditions: { [key: string]: ((v: number) => any)[] };
};

const min = (size: number) => (v: number) =>
  v >= size || t('litematica_generator.size_min', { size });
const max = (size: number) => (v: number) =>
  v <= size || t('litematica_generator.size_max', { size });
const mod = (mod: number, rem: number) => (v: number) =>
  v % mod === rem || t('litematica_generator.size_mod', { mod, rem });

const names = ref<{ [key: string]: Machine }>({
  'yisibite-world-eater': {
    name: '无沟世吞 / Trenchless World Eater v3.1 by 火弦月',
    conditions: {
      x: [mod(6, 0), min(30), max(1000)],
      z: [min(130), max(1000)],
    },
  },
  'yisibite-nether-eater': {
    name: '16高无沟地吞 / Trenchless Nether world eater (16 high) v1.2 by 火弦月',
    conditions: {
      x: [mod(6, 0), min(30), max(1000)],
      z: [min(130), max(1000)],
    },
  },
  'yisibite-once-miner': {
    name: '5x3 单发盾构 / tunnelbores by 火弦月',
    conditions: {
      x: [mod(6, 1), min(19), max(1000)],
    },
  },
  'yisibite-3-miner': {
    name: '5x3 三连发盾构 / triple shot tunnelbore by 火弦月',
    conditions: {
      x: [mod(7, 1), min(22), max(1000)],
    },
  },
  'yisibite-quarry-z': {
    name: '采矿机-东西方向 / Quarry east-west direction by 火弦月',
    conditions: {
      y: [mod(2, 1), min(129), max(320)],
      z: [mod(42, 6), min(174), max(1000)],
    },
  },
  'yisibite-quarry-x': {
    name: '采矿机-南北方向 / Quarry north-south direction by 火弦月',
    conditions: {
      y: [mod(2, 1), min(129), max(320)],
      x: [mod(42, 6), min(174), max(1000)],
    },
  },
});

const updateDownloads = () =>
  doFetchGet('/api/mc-services/yisibite/')
    .then(async (res) => {
      if (res.ok) {
        let data: {
          [key: string]: {
            downloads?: number;
          };
        } = await res.json();
        for (let key in names.value) {
          if (key in data) {
            names.value[key].downloads = data[key].downloads;
          }
        }
      }
    })
    .catch((e) => console.log(e));
updateDownloads();

function submit(e: SubmitEventPromise) {
  e.preventDefault();
  e.then((e) => {
    if (e.valid) {
      // open a new window to download
      window.open(
        `/api/mc-services/yisibite/${name.value}?xSize=${xSize.value}&ySize=${ySize.value}&zSize=${zSize.value}`,
      );
      setTimeout(() => {
        updateDownloads();
      }, 1000);
    }
  });
}
</script>

<template>
  <v-form class="content-common" @submit="submit" fast-fail>
    <v-row>
      <v-col>
        <h1>
          {{ $t('litematica_generator.title') }}
        </h1>
        <p>
          {{ $t('litematica_generator.description') }}
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col style="min-width: 130px">
        {{ $t('litematica_generator.select') }}
      </v-col>
      <v-select
        v-model="name"
        :item-title="(item) => names[item]?.name"
        :item-value="(item) => item"
        :items="Object.keys(names)"
        autofocus
      >
        <template #selection="{ item }">
          {{ item.title }}
        </template>
        <template #append-inner>
          <v-chip>
            {{
              $t('litematica_generator.download_count', {
                count: names[name]?.downloads ?? '查询失败',
              })
            }}
          </v-chip>
        </template>
      </v-select>
    </v-row>
    <v-row>
      <v-col>
        <p>
          {{ $t('litematica_generator.size_description') }}
        </p>
      </v-col>
    </v-row>
    <v-row v-if="names[name]?.conditions?.x">
      <v-col>
        {{ $t('litematica_generator.size_x') }}
      </v-col>
      <v-text-field
        v-model="xSize"
        :rules="[...(names[name]?.conditions?.x || [])]"
      />
    </v-row>
    <v-row v-if="names[name]?.conditions?.y">
      <v-col>
        {{ $t('litematica_generator.size_y') }}
      </v-col>
      <v-text-field
        v-model="ySize"
        :rules="[...(names[name]?.conditions?.y || [])]"
      />
    </v-row>
    <v-row v-if="names[name]?.conditions?.z">
      <v-col>
        {{ $t('litematica_generator.size_z') }}
      </v-col>
      <v-text-field
        v-model="zSize"
        :rules="[...(names[name]?.conditions?.z || [])]"
      />
    </v-row>
    <v-row v-if="!useAppStore().logined">
      <reden-router to="/login">
        {{ $t('litematica_generator.not_logged_in') }}
      </reden-router>
    </v-row>
    <v-row>
      {{ $t('litematica_generator.contribute') }}
    </v-row>
    <v-row>
      <v-spacer />
      <v-btn
        :disabled="names[name].available === false"
        :loading="loading"
        color="primary"
        type="submit"
      >
        {{ $t('litematica_generator.download') }}
      </v-btn>
    </v-row>
  </v-form>
</template>

<style scoped>
p {
  font-size: 1em;
}
</style>
