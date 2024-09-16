<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useAppStore } from '~/store/app';
import { type SubmitEventPromise } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import LitematicaUpload from '~/components/yisibite/LitematicaUpload.vue';
import SizeInput from '~/components/yisibite/SizeInput.vue';
import 'assets/main.css';
import { useFetch } from 'nuxt/app';

const route = useRoute();
const router = useRouter();
const xSize = ref(0);
const ySize = ref(0);
const zSize = ref(0);
const loading = ref(false);
const name = ref(route.query.m?.toString() || '');
const { t } = useI18n();
const localePath = useLocalePath();
useSeoMeta({
  title: t('litematica_generator.title'),
  ogTitle: t('litematica_generator.title'),
  description: t('litematica_generator.og_description'),
  ogDescription: t('litematica_generator.og_description'),
  ogImage: 'https://redenmc.com/reden_256.png',
});

const selecting = ref(true);
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

const { data: total } = await useFetch('/api/mc-services/yisibite/total');

const { data: serverResponse } = await useFetch<{
  [key: string]: MachineDef & {
    conditions?: {
      x: string[];
      y: string[];
      z: string[];
    };
  };
}>('/api/mc-services/yisibite/');
const generators = computed(() => {
  if (serverResponse.value) {
    let machines: { [key: string]: Machine } = {};
    for (let key in serverResponse.value) {
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
          v % mod === rem || t('litematica_generator.size_mod', { mod, rem });
        f.mod = mod;
        f.rem = rem;
        return f;
      };
      const defaultChecker = [min(0), max(1000), mod(1, 0)];
      machines[key] = {
        ...serverResponse.value[key],
        conditions: {
          x:
            serverResponse.value[key].conditions?.x?.map((s) => eval(s)) ??
            defaultChecker,
          y:
            serverResponse.value[key].conditions?.y?.map((s) => eval(s)) ??
            defaultChecker,
          z:
            serverResponse.value[key].conditions?.z?.map((s) => eval(s)) ??
            defaultChecker,
        },
      };
    }
    return Object.keys(machines)
      .sort()
      .reduce((obj: Record<string, Machine>, key) => {
        obj[key] = machines[key];
        return obj;
      }, {});
  }
});
console.log(serverResponse.value, generators.value, typeof total.value);

function submit(e: SubmitEventPromise) {
  e.preventDefault();
  e.then((e) => {
    if (e.valid) {
      // open a new window to download
      window.open(
        `/api/mc-services/yisibite/${name.value}?xSize=${xSize.value}&ySize=${ySize.value}&zSize=${zSize.value}`,
      );
      setTimeout(() => {
        refreshNuxtData();
      }, 1000);
    }
  });
}

if (import.meta.client) {
  refreshNuxtData();
}

if (generators.value && !generators.value[name.value])
  name.value = Object.keys(generators.value)[0];
const selected = computed(() => (generators.value ?? {})[name.value]);

const meta = {
  description: t('litematica_generator.description'),
  keywords: [
    'minecraft',
    'litematica',
    '投影',
    'generator',
    '生成器',
    '世吞',
    'world eater',
    'redstone',
    'slimestone',
  ],
};
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
        :item-title="(item) => (generators ?? {})[item]?.name"
        :item-value="(item) => item"
        :items="Object.keys(generators ?? {})"
        density="comfortable"
        hide-details
        active
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
      <v-col cols="12" v-if="false">
        <v-card border>
          <v-card-actions>
            {{ selected.name }}
            <v-spacer />
            <v-btn
              :icon="selecting ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              @click="selecting = !selecting"
            ></v-btn>
          </v-card-actions>
        </v-card>
        <v-expand-transition v-show="selecting">
          <v-radio-group
            v-model="name"
            @update:model-value="router.replace({ query: { m: name } })"
          >
            <v-radio
              v-for="key in Object.keys(generators ?? {})"
              :key="key"
              :value="key"
            >
              <template #label>
                {{ (generators ?? {})[key]?.name }}
                <v-chip>
                  {{
                    $t('litematica_generator.download_count', {
                      count: (generators ?? {})[key]?.downloads ?? '查询失败',
                    })
                  }}
                </v-chip>
              </template>
            </v-radio>
          </v-radio-group>
        </v-expand-transition>
      </v-col>
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
              v-if="selected.hasX"
              :key="selected.name + 'x'"
              v-model="xSize"
              :def="selected"
              xyz="x"
            />
            <SizeInput
              v-if="selected.hasY"
              :key="selected.name + 'y'"
              v-model="ySize"
              :def="selected"
              xyz="y"
            />
            <SizeInput
              v-if="selected.hasZ"
              :key="selected.name + 'z'"
              v-model="zSize"
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
          <LitematicaUpload v-if="useAppStore().logined" class="ma-4" />
        </v-row>
      </v-col>
    </v-row>
    <v-row v-if="!useAppStore().logined" class="text-sm-body-1">
      <v-col>
        <reden-router :to="localePath('/login')">
          {{ $t('litematica_generator.not_logged_in') }}
        </reden-router>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        {{ $t('litematica_generator.contribute') }}
        <a class="router" href="mailto:me@redenmc.com">me@redenmc.com</a>
        <br />
        <div class="text-center v-card-subtitle w-100">
          {{ $t('litematica_generator.total_downloads', [total]) }}
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<style scoped>
p {
  font-size: 1em;
}
</style>
