<script lang="ts" setup>
import type { SubmitEventPromise } from 'vuetify';

definePageMeta({
  layout: false,
});

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
}

type Machine = MachineDef & {
  conditions: { [key: string]: ((v: number) => any)[] };
};


const names = ref<{ [key: string]: Machine }>({
  'yisibite-world-eater': {
    name: '无沟世吞v3 by 火弦月',
    conditions: {},
  },
  'yisibite-nether-eater': {
    name: '16高无沟地吞 by 火弦月',
    conditions: {
    },
  },
  'yisibite-once-miner': {
    name: '5x3 单发盾构 by 火弦月',
    conditions: {
    },
  },
  'yisibite-3-miner': {
    name: '5x3 三连发盾构 by 火弦月',
    conditions: {
    },
  },
  'yisibite-quarry-x': {
    name: '采矿机-南北方向 by 火弦月',
    conditions: {
    },
  },
  'yisibite-quarry-z': {
    name: '采矿机-东西方向 by 火弦月',
    conditions: {
    },
  },
});

onMounted(async () => {
  for (const key in names.value) {
    const machine = names.value[key];
    const conditions: Record<string, string[]> = (await (await fetch(`/api/mc-services/yisibite/${key}/info/zh_cn`)).json()).d[0].conditions
    machine.conditions = {
      x: conditions.x?.map(val => parseCondition(val, t)),
      y: conditions.y?.map(val => parseCondition(val, t)),
      z: conditions.z?.map(val => parseCondition(val, t)),
    };
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

watch(name, () => {
  console.log(names.value[name.value])
});
</script>

<template>
  <v-form class="content-common pa-5" @submit="submit" fast-fail>
    <v-row>
      <v-col>
        <h1>
          投影蓝图在线生成器
        </h1>
        <p>
          在这里在线生成《我的世界》投影文件，不管是世界吞噬者、破基岩机还是盾构机，这里都可以生成。任意形状大小。生成全部免费！
        </p>
        <p>
          如果有使用问题请加QQ群<span style="color: red">708842363</span>咨询
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col style="min-width: 200px">
        今天你想生成什么？
      </v-col>
    </v-row>
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
    </v-select>
    <v-row>
      <v-col>
        <p>
          机器的 x, y, z 尺寸。对于世界吞噬者，z 尺寸是出发站和返回站之间的距离。
        </p>
      </v-col>
    </v-row>
    <v-row v-show="names[name]?.conditions?.x?.length">
      <v-col>
        x 方向尺寸
      </v-col>
      <v-text-field
        v-model="xSize"
        :rules="[...(names[name]?.conditions?.x || [])]"
      />
    </v-row>
    <v-row v-show="names[name]?.conditions?.y?.length">
      <v-col>
        y 方向尺寸
      </v-col>
      <v-text-field
        v-model="ySize"
        :rules="[...(names[name]?.conditions?.y || [])]"
      />
    </v-row>
    <v-row v-if="names[name]?.conditions?.z?.length">
      <v-col>
        z 方向尺寸
      </v-col>
      <v-text-field
        v-model="zSize"
        :rules="[...(names[name]?.conditions?.z || [])]"
      />
    </v-row>
    <v-row>
      <v-spacer />
      <v-btn
        :disabled="names[name]?.available === false"
        :loading="loading"
        color="primary"
        type="submit"
      >
        下载
      </v-btn>
    </v-row>
    <v-row>
      备案号： 京ICP备2021010288号-6
    </v-row>
  </v-form>
</template>

<style scoped>
p {
  font-size: 1em;
}
</style>
