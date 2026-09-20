<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const frame = ref<HTMLIFrameElement | null>(null);
const height = ref(1600);
const baseURL = useRuntimeConfig().app.baseURL.replace(/\/$/, '');
const source = `${baseURL}/generators/pearl-cannon-v9.html`;
const copy = computed(() => {
  if (locale.value === 'zh_cn')
    return {
      title: '按 X / Z 位移生成珍珠炮（试验功能）',
      note: '单 TNT 精度、双阵列、零轴省料。42.2 格/TNT 为标称换算，实际落点需核对；已知故障及历史测试限制见工具内提示。下方传统尺寸生成器保持可用。',
      open: '单独打开生成器',
    };
  if (locale.value === 'zh_tw')
    return {
      title: '依 X / Z 位移生成珍珠炮（試驗功能）',
      note: '單 TNT 精度、雙陣列、零軸省料。42.2 格/TNT 為標稱換算，實際落點需核對；已知故障及歷史測試限制見工具內提示。下方傳統尺寸生成器保持可用。',
      open: '單獨開啟生成器',
    };
  return {
    title: 'Generate a pearl cannon from X / Z displacement (experimental)',
    note: 'Single-TNT precision, two arrays per axis and zero-axis omission. The tool currently uses Simplified Chinese. 42.2 blocks/TNT is nominal; landing positions need verification. Known failures are shown in the tool. The original size-based generator remains available below.',
    open: 'Open generator separately',
  };
});

function resize(event: MessageEvent) {
  // The sandbox has an opaque origin. Also verify the sending window.
  if (event.source !== frame.value?.contentWindow || event.origin !== 'null')
    return;
  const data = event.data;
  if (!data || data.type !== 'pearl-cannon:resize') return;
  if (typeof data.height !== 'number' || !Number.isFinite(data.height)) return;
  height.value = Math.max(600, Math.min(10000, Math.ceil(data.height)));
}
onMounted(() => window.addEventListener('message', resize));
onBeforeUnmount(() => window.removeEventListener('message', resize));
</script>

<template>
  <v-expansion-panels>
    <v-expansion-panel :title="copy.title">
      <v-expansion-panel-text>
        <p class="mb-3">{{ copy.note }}</p>
        <a :href="source" target="_blank" rel="noopener noreferrer">{{
          copy.open
        }}</a>
        <iframe
          ref="frame"
          :src="source"
          :title="copy.title"
          :height="height"
          class="pearl-cannon-frame"
          sandbox="allow-scripts allow-downloads"
          referrerpolicy="no-referrer"
          loading="lazy"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<style scoped>
.pearl-cannon-frame {
  display: block;
  width: 100%;
  border: 0;
  margin-top: 12px;
}
</style>
