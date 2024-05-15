<script lang="ts" setup>
import { ref } from 'vue';
import { useAppStore } from '@/store/app';
import { SubmitEventPromise } from 'vuetify';
import { useRouter } from 'vue-router';

const router = useRouter();
const xSize = ref(0);
const zSize = ref(0);
const loading = ref(false);

type Machine = {
  name: string;
  hasX: boolean;
  hasZ: boolean;
  conditions: (() => any)[];
};

const names: { [key: string]: Machine } = {
  'yisibite-world-eater': {
    name: '6宽无沟世吞x3.1 - 火弦月',
    hasX: true,
    hasZ: true,
    conditions: [() => xSize.value % 6 == 0 || '宽度必须是6的倍数'],
  },
  'yisibite-nether-eater': {
    name: '16高无沟地吞V1.2 - 火弦月',
    hasX: true,
    hasZ: true,
    conditions: [() => xSize.value % 6 == 0 || '宽度必须是6的倍数'],
  },
  'yisibite-once-miner': {
    name: '5x3单发盾构 - 火弦月',
    hasX: true,
    hasZ: false,
    conditions: [() => xSize.value % 6 == 1 || '宽度必须是 6n+1'],
  },
  'yisibite-3-miner': {
    name: '5x3三连发盾构 - 火弦月',
    hasX: true,
    hasZ: false,
    conditions: [() => xSize.value % 7 == 1 || '宽度必须是 7n+1'],
  },
};

const name = ref('yisibite-world-eater');

function submit(e: SubmitEventPromise) {
  e.preventDefault();
  e.then((e) => {
    if (e.valid) {
      const req = {
        name: name.value,
        xSize: xSize.value,
        zSize: zSize.value,
      };
      // open a new window to download
      window.open(
        `/api/mc-services/yisibite/${name.value}?xSize=${xSize.value}&zSize=${zSize.value}`,
      );
    }
  });
}
</script>

<template>
  <v-form class="content-common" @submit="submit">
    <h1>投影在线生成</h1>
    <v-row>
      <v-col> 请选择下载的机器 </v-col>
      <v-combobox
        v-model="name"
        :item-title="(item) => names[item]?.name"
        :items="Object.keys(names)"
        autofocus
      />
    </v-row>
    <v-row v-if="names[name]?.hasX">
      <v-col> x宽度 </v-col>
      <v-text-field
        v-model="xSize"
        :rules="[(v) => v > 0 || '宽度必须是整数', ...names[name]?.conditions]"
      />
    </v-row>
    <v-row v-if="names[name]?.hasZ">
      <v-col> z宽度 （出发和返回站的距离） </v-col>
      <v-text-field
        v-model="zSize"
        :rules="[(v) => v > 0 || '宽度必须是整数']"
      />
    </v-row>
    <v-row v-if="!useAppStore().logined">
      未登录用户每分钟最多生成5次投影以防范ddos，如果被限制请
      <a href="/login">登录</a>
    </v-row>
    <v-row>
      <v-spacer />
      <v-btn :loading="loading" color="primary" type="submit"> 下载 </v-btn>
    </v-row>
  </v-form>
</template>

<style scoped></style>
