<script lang="ts" setup>
import {ref} from 'vue';
import {useAppStore} from '@/store/app';
import {SubmitEventPromise} from 'vuetify';
import RedenRouter from '@/router/RedenRouter.vue';
import {doFetchGet} from "@/constants";

const xSize = ref(0);
const ySize = ref(0);
const zSize = ref(0);
const loading = ref(false);
const name = ref('yisibite-world-eater');
const xSizeRef = ref()
const ySizeRef = ref()
const zSizeRef = ref()
const inputRefs = {
  x: xSizeRef,
  y: ySizeRef,
  z: zSizeRef,
}

type Machine = {
  name: string;
  hasX?: boolean;
  hasY?: boolean;
  hasZ?: boolean;
  zTitle?: string;
  downloads?: number;
  available?: boolean | null;
  conditions: { [key: string]: (() => any)[] };
};

function min(a: number) {
  return () => xSize.value >= a || `宽度最小${a}`
}

const names = ref<{ [key: string]: Machine }>({
  'yisibite-world-eater': {
    name: '无沟世吞 v3.1 - 火弦月',
    hasX: true,
    hasZ: true,
    zTitle: 'z宽度 （出发和返回站的距离）',
    conditions: {x: [() => xSize.value % 6 == 0 || '宽度必须是6的倍数', min(30)]},
  },
  'yisibite-nether-eater': {
    name: '16高无沟地吞V1.2 - 火弦月',
    hasX: true,
    hasZ: true,
    zTitle: 'z宽度 （出发和返回站的距离）',
    conditions: {
      x: [() => xSize.value % 6 == 0 || '宽度必须是6的倍数'
        , min(30)]
    },
  },
  'yisibite-once-miner': {
    name: '5x3单发盾构 - 火弦月',
    hasX: true,
    hasZ: false,
    conditions: {x: [() => xSize.value % 6 == 1 || '宽度必须是 6n+1', min(19)]},
  },
  'yisibite-3-miner': {
    name: '5x3三连发盾构 - 火弦月',
    hasX: true,
    hasZ: false,
    conditions: {x: [() => xSize.value % 7 == 1 || '宽度必须是 7n+1', min(22)]},
  },
  'yisibite-quarry-z': {
    name: '采矿机-东西方向 - 火弦月',
    hasX: true,
    hasY: true,
    hasZ: true,
    conditions: {},
  },
  'yisibite-quarry-x': {
    name: '采矿机-南北方向 - 火弦月',
    hasX: true,
    hasY: true,
    hasZ: true,
    conditions: {},
  }
});

doFetchGet('/api/mc-services/yisibite/').then(async (res) => {
  if (res.ok) {
    let data: {
      [key: string]: {
        name: string;
        hasX?: boolean;
        hasY?: boolean;
        hasZ?: boolean;
        zTitle?: string;
        downloads?: number;
        available?: boolean | null;
        conditions: { [key: string]: string }
      }
    } = await res.json();
    let newNames: { [key: string]: Machine } = {};
    for (const key in data) {
      let machine: Machine = {
        ...data[key],
        zTitle: data[key].zTitle || names.value[key]?.zTitle,
        conditions: {
          x: [],
          y: [],
          z: [],
          ...names.value[key]?.conditions
        },
      }
      console.log('a')
      for (const input in data[key].conditions) {
        const conditions = data[key].conditions[input];
        console.log(conditions)
        for (const cond of conditions) {
          machine.conditions[input].push(() => eval(cond));
        }
      }
      console.log('b')
      newNames[key] = machine;
    }
    console.log('c', newNames)
    names.value = newNames;
    console.log(names.value)
  }
}).catch(e => console.log(e));

function submit(e: SubmitEventPromise) {
  e.preventDefault();
  e.then((e) => {
    if (e.valid) {
      // open a new window to download
      window.open(
        `/api/mc-services/yisibite/${name.value}?xSize=${xSize.value}&ySize=${ySize.value}&zSize=${zSize.value}`,
      );
    }
  });
}
</script>

<template>
  <v-form class="content-common" @submit="submit">
    <h1>投影在线生成</h1>
    <v-row>
      <v-col style="min-width: 130px">请选择下载的机器</v-col>
      <v-select
        v-model="name"
        :item-title="(item) => names[item]?.name"
        :item-value="(item) => item"
        :items="Object.keys(names)"
        autofocus
      >
        <template #append-inner>
          <v-chip>
            下载人数：{{ names[name]?.downloads }}
            <template v-if="names[name]?.downloads === undefined">
              查询失败
            </template>
          </v-chip>
        </template>
      </v-select>
    </v-row>
    <v-row v-if="names[name]?.hasX">
      <v-col>x宽度</v-col>
      <v-text-field
        v-model="xSize"
        :rules="[(v) => v > 0 || '宽度必须是正数', ...names[name]?.conditions?.x]"
      />
    </v-row>
    <v-row v-if="names[name]?.hasY">
      <v-col>y高度</v-col>
      <v-text-field
        v-model="ySize"
        :rules="[(v) => v > 0 || '宽度必须是正数', ...names[name]?.conditions?.y]"
      />
    </v-row>
    <v-row v-if="names[name]?.hasZ">
      <v-col>
        <template v-if="names[name].zTitle"> {{ names[name].zTitle }}</template>
        <template v-else>z宽度</template>
      </v-col>
      <v-text-field
        v-model="zSize"
        :rules="[(v) => v > 0 || '宽度必须是正数', ...names[name]?.conditions?.z]"
      />
    </v-row>
    <v-row v-if="!useAppStore().logined">
      未登录用户每分钟最多生成5次投影以防范ddos，如果被限制请
      <reden-router to="/login">登录</reden-router>
    </v-row>
    <v-row>
      <v-spacer />
      <v-btn
        :disabled="names[name].available === false"
        :loading="loading"
        color="primary"
        type="submit"
      >
        下载
      </v-btn>
    </v-row>
  </v-form>
</template>

<style scoped>
.v-select__content-item {
  word-wrap: break-word;
}
</style>
