<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useAppStore } from '@/store/app';
import { SubmitEventPromise } from 'vuetify';
import RedenRouter from '@/router/RedenRouter.vue';
import { doFetchGet } from '@/constants';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import LitematicaUpload from '@/views/yisibite/LitematicaUpload.vue';

const route = useRoute();
const router = useRouter();
const xSize = ref(0);
const ySize = ref(0);
const zSize = ref(0);
const loading = ref(false);
const name = ref(route.query.m?.toString() || '');
const { t } = useI18n();

type MachineDef = {
  name: string;
  downloads?: number;
  available?: boolean | null;
  hasX?: boolean;
  hasY?: boolean;
  hasZ?: boolean;
};

type Machine = MachineDef & {
  conditions: { [key: string]: ((v: number) => any)[] };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const min = (size: number) => (v: number) =>
  v >= size || t('litematica_generator.size_min', { size });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const max = (size: number) => (v: number) =>
  v <= size || t('litematica_generator.size_max', { size });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mod = (mod: number, rem: number) => (v: number) =>
  v % mod === rem || t('litematica_generator.size_mod', { mod, rem });

const names = ref<{ [key: string]: Machine }>({});

const updateDownloads = () =>
  doFetchGet('/api/mc-services/yisibite/')
    .then(async (res) => {
      if (res.ok) {
        let data: {
          [key: string]: MachineDef & {
            conditions?: {
              x: string[];
              y: string[];
              z: string[];
            };
          };
        } = await res.json();
        let machines: { [key: string]: Machine } = {};
        for (let key in data) {
          const min = (size: number) => (v: number) =>
            v >= size || t('litematica_generator.size_min', { size });
          const max = (size: number) => (v: number) =>
            v <= size || t('litematica_generator.size_max', { size });
          const mod = (mod: number, rem: number) => (v: number) =>
            v % mod === rem || t('litematica_generator.size_mod', { mod, rem });
          const defaultChecker = [min(0), max(1000), mod(1, 0)];
          machines[key] = {
            ...data[key],
            conditions: {
              x: data[key].conditions?.x?.map((s) => eval(s)) ?? defaultChecker,
              y: data[key].conditions?.y?.map((s) => eval(s)) ?? defaultChecker,
              z: data[key].conditions?.z?.map((s) => eval(s)) ?? defaultChecker,
            },
          };
        }
        names.value = machines;
      }
    })
    .catch((e) => console.error(e));
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

watch(name, () => {
  console.log(names.value[name.value]);
});
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
      <v-col style="min-width: 200px">
        {{ $t('litematica_generator.select') }}
      </v-col>
      <v-select
        v-model="name"
        :item-title="(item) => names[item]?.name"
        :item-value="(item) => item"
        :items="Object.keys(names)"
        autofocus
        @update:model-value="router.replace({ query: { m: name } })"
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
      <v-row>
        <v-col>
          <p>
            {{ $t('litematica_generator.size_description') }}
          </p>
        </v-col>
      </v-row>
    </v-row>
    <v-row v-if="names[name]?.hasX">
      <v-col>
        {{ $t('litematica_generator.size_x') }}
      </v-col>
      <v-text-field v-model="xSize" :rules="names[name]?.conditions?.x || []" />
    </v-row>
    <v-row v-if="names[name]?.hasY">
      <v-col>
        {{ $t('litematica_generator.size_y') }}
      </v-col>
      <v-text-field v-model="ySize" :rules="names[name]?.conditions?.y || []" />
    </v-row>
    <v-row v-if="names[name]?.hasZ">
      <v-col>
        {{ $t('litematica_generator.size_z') }}
      </v-col>
      <v-text-field v-model="zSize" :rules="names[name]?.conditions?.z || []" />
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
        :disabled="names[name]?.available === false"
        :loading="loading"
        color="primary"
        type="submit"
      >
        {{ $t('litematica_generator.download') }}
      </v-btn>
    </v-row>
  </v-form>
  <LitematicaUpload v-if="useAppStore().userCache?.isStaff" />
</template>

<style scoped>
p {
  font-size: 1em;
}
</style>
