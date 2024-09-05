<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useAppStore } from '@/store/app';
import { SubmitEventPromise } from 'vuetify';
import RedenRouter from '@/router/RedenRouter.vue';
import { doFetchGet } from '@/constants';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import LitematicaUpload from '@/views/yisibite/LitematicaUpload.vue';
import SizeInput from '@/views/yisibite/SizeInput.vue';

const route = useRoute();
const router = useRouter();
const xSize = ref(0);
const ySize = ref(0);
const zSize = ref(0);
const loading = ref(false);
const name = ref(route.query.m?.toString() || '');
const { t } = useI18n();

export type MachineDef = {
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

export type Machine = MachineDef & {
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
          const min = (size: number) => {
            const f = (v: number) =>
              v >= size || t('litematica_generator.size_min', { size });
            f.min = size;
            return f;
          };
          const max = (size: number) => {
            const f = (v: number) =>
              v <= size || t('litematica_generator.size_max', { size });
            f.max = size;
            return f;
          };
          const mod = (mod: number, rem: number) => {
            const f = (v: number) =>
              v % mod === rem ||
              t('litematica_generator.size_mod', { mod, rem });
            f.mod = mod;
            f.rem = rem;
            return f;
          };
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
        generators.value = Object.keys(machines)
          .sort()
          .reduce((obj: typeof machines, key) => {
            obj[key] = machines[key];
            return obj;
          }, {});

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
const selected = computed(() => generators.value[name.value]);
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
        autofocus
        density="comfortable"
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
                count: selected?.downloads ?? '查询失败',
              })
            }}
          </v-chip>
        </template>
      </v-select>
      <v-col v-if="selected?.link" cols="12">
        <a :href="selected.link" class="router">
          <v-icon>mdi-link</v-icon>
          {{ selected.link }}
        </a>
      </v-col>
      <v-col v-if="selected?.note" cols="12" v-html="selected.note" />
    </v-row>

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
              :key="selected.name + 'x'"
              v-model="xSize"
              v-if="selected.hasX"
              :def="selected"
              xyz="x"
            />
            <SizeInput
              :key="selected.name + 'y'"
              v-model="ySize"
              v-if="selected.hasY"
              :def="selected"
              xyz="y"
            />
            <SizeInput
              :key="selected.name + 'z'"
              v-model="zSize"
              v-if="selected.hasZ"
              :def="selected"
              xyz="z"
            />
            <v-row>
              <v-spacer />
              <v-btn
                :disabled="selected?.available === false"
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
        <v-row>
          <v-spacer />
          <LitematicaUpload v-if="useAppStore().logined" class="ma-3" />
        </v-row>
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
