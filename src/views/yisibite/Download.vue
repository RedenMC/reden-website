<script lang="ts" setup>
import { ref } from 'vue';
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
  note?: string;
  link?: string;
  linkChina?: string;
};

type Machine = MachineDef & {
  conditions: { [key: string]: ((v: number) => any)[] };
};

const generators = ref<{ [key: string]: Machine }>({});

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
        generators.value = machines;
        if (name.value === '') name.value = Object.keys(generators.value)[0];
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
</script>

<template>
  <v-form class="content-common" fast-fail @submit="submit">
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
        :item-title="(item) => generators[item]?.name"
        :item-value="(item) => item"
        :items="Object.keys(generators)"
        density="comfortable"
        autofocus
        hide-details
        @update:model-value="router.replace({ query: { m: name } })"
      >
        <template #selection="{ item }">
          {{ item.title }}
        </template>
        <template #append-inner>
          <v-chip>
            {{
              $t('litematica_generator.download_count', {
                count: generators[name]?.downloads ?? '查询失败',
              })
            }}
          </v-chip>
        </template>
      </v-select>
      <v-col cols="12" v-if="generators[name]?.link">
        <a class="router" :href="generators[name]?.link">
          <v-icon>mdi-link</v-icon>
          {{ generators[name]?.link }}
        </a>
      </v-col>
      <v-col v-html="generators[name]?.note"
        cols="12"
        v-if="generators[name]?.note"
      />
    </v-row>

    <v-row>
      <v-col>
        <v-card
          border
          v-if="
            generators[name]?.hasX ||
            generators[name]?.hasY ||
            generators[name]?.hasZ
          "
        >
          <v-card-subtitle class="text-wrap pa-3">
            {{ $t('litematica_generator.size_description') }}
          </v-card-subtitle>
          <v-card-text>
            <v-row v-if="generators[name]?.hasX">
              <v-col class="text-md-body-1">
                {{ $t('litematica_generator.size_x') }}
              </v-col>
              <v-text-field
                density="compact"
                variant="underlined"
                v-model="xSize"
                :rules="generators[name]?.conditions?.x || []"
              />
            </v-row>
            <v-row v-if="generators[name]?.hasY">
              <v-col class="text-md-body-1">
                {{ $t('litematica_generator.size_y') }}
              </v-col>
              <v-text-field
                density="compact"
                variant="underlined"
                v-model="ySize"
                :rules="generators[name]?.conditions?.y || []"
              />
            </v-row>
            <v-row v-if="generators[name]?.hasZ">
              <v-col class="text-md-body-1">
                {{ $t('litematica_generator.size_z') }}
              </v-col>
              <v-text-field
                density="compact"
                variant="underlined"
                v-model="zSize"
                :rules="generators[name]?.conditions?.z || []"
              />
            </v-row>
            <v-row>
              <v-spacer />
              <LitematicaUpload class="ma-3" />
              <v-btn
                :disabled="generators[name]?.available === false"
                :loading="loading"
                class="ma-3"
                color="primary"
                type="submit"
              >
                {{ $t('litematica_generator.download') }}
              </v-btn>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="!useAppStore().logined" class="text-sm-body-1">
      <reden-router to="/login">
        {{ $t('litematica_generator.not_logged_in') }}
      </reden-router>
    </v-row>
    <v-row>
      {{ $t('litematica_generator.contribute') }}
    </v-row>
  </v-form>
</template>

<style scoped>
p {
  font-size: 1em;
}
</style>
