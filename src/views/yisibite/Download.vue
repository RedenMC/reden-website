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

type Machine = {
  name: string;
  hasX?: boolean;
  hasY?: boolean;
  hasZ?: boolean;
  zTitle?: string;
  downloads?: number;
  available?: boolean | null;
  conditions: (() => any)[];
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
    conditions: [() => xSize.value % 6 == 0 || '宽度必须是6的倍数', min(30)],
  },
  'yisibite-nether-eater': {
    name: '16高无沟地吞V1.2 - 火弦月',
    hasX: true,
    hasZ: true,
    zTitle: 'z宽度 （出发和返回站的距离）',
    conditions: [() => xSize.value % 6 == 0 || '宽度必须是6的倍数', min(30)],
  },
  'yisibite-once-miner': {
    name: '5x3单发盾构 - 火弦月',
    hasX: true,
    hasZ: false,
    conditions: [() => xSize.value % 6 == 1 || '宽度必须是 6n+1', min(19)],
  },
  'yisibite-3-miner': {
    name: '5x3三连发盾构 - 火弦月',
    hasX: true,
    hasZ: false,
    conditions: [() => xSize.value % 7 == 1 || '宽度必须是 7n+1', min(22)],
  },
  'yisibite-quarry-z': {
    name: '采矿机-东西方向 - 火弦月',
    hasX: true,
    hasY: true,
    hasZ: true,
    conditions: [],
  },
  'yisibite-quarry-x': {
    name: '采矿机-南北方向 - 火弦月',
    hasX: true,
    hasY: true,
    hasZ: true,
    conditions: [],
  }
});

doFetchGet('/api/mc-services/yisibite/').then(async (res) => {
  if (res.ok) {
    let data: { [key: string]: Machine } = await res.json();
    for (const key in names.value) {
      if (data[key]) {
        if (!data[key].conditions) {
          data[key].conditions = names.value[key].conditions;
        } else {
          data[key].conditions = data[key].conditions.map((c: any) => {
            return Function(c) as any;
          });
        }
      }
    }
    names.value = data;
    console.log(names.value)
  }
});

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
            下载人数：{{ names[name]?.downloads?.toString() || '查询失败' }}
          </v-chip>
        </template>
      </v-select>
    </v-row>
    <v-row v-if="names[name]?.hasX">
      <v-col>x宽度</v-col>
      <v-text-field
        v-model="xSize"
        :rules="[(v) => v > 0 || '宽度必须是正数', ...names[name]?.conditions]"
      />
    </v-row>
    <v-row v-if="names[name]?.hasY">
      <v-col>y高度</v-col>
      <v-text-field
        v-model="ySize"
        :rules="[(v) => v > 0 || '宽度必须是正数', ...names[name]?.conditions]"
      />
    </v-row>
    <v-row v-if="names[name]?.hasZ">
      <v-col>
        <template v-if="names[name].zTitle"> {{ names[name].zTitle }}</template>
        <template v-else>z宽度</template>
      </v-col>
      <v-text-field
        v-model="zSize"
        :rules="[(v) => v > 0 || '宽度必须是正数', ...names[name]?.conditions]"
      />
    </v-row>
    <v-row v-if="!useAppStore().logined">
      未登录用户每分钟最多生成5次投影以防范ddos，如果被限制请
      <reden-router to="/login">登录</reden-router>
    </v-row>
    <v-row>
      <v-spacer />
      <v-btn
        :loading="loading"
        color="primary"
        type="submit"
        :disabled="names[name].available === false"
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
