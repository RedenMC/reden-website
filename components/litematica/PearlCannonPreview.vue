<script lang="ts" setup>
// Read-only block-layer preview for Minecraft schematic data.
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CannonBlock, CannonResult } from '~/utils/pearl-cannon/core.mjs';
import { pearlMessages } from '~/utils/pearl-cannon/messages';
import { blockName } from '~/utils/pearl-cannon/block-names';
const props = defineProps<{ result: CannonResult }>();
const { locale } = useI18n();
const copy = computed(() => pearlMessages[locale.value] ?? pearlMessages.en);
const layer = ref(92),
  fit = ref(true);
const hovered = ref<CannonBlock | null>(null);
watch([layer, () => props.result], () => {
  hovered.value = null;
});
function clearMouseHover(event: PointerEvent) {
  if (event.pointerType === 'mouse') hovered.value = null;
}
const layers = [92, 93, 97, 38, 35, 31, 5].map((value) => ({
  title: `Y = ${value}`,
  value,
}));
const selected = computed(() =>
  [...props.result.blocks.values()].filter((b) => b.p[1] === layer.value),
);
const bounds = computed(() => {
  const blocks =
    fit.value && selected.value.length
      ? selected.value
      : [...props.result.blocks.values()];
  const xs = blocks.map((b) => b.p[0]),
    zs = blocks.map((b) => b.p[2]);
  return [
    Math.min(...xs) - 1,
    Math.min(...zs) - 1,
    Math.max(...xs) - Math.min(...xs) + 3,
    Math.max(...zs) - Math.min(...zs) + 3,
  ];
});
const viewBox = computed(() => bounds.value.join(' '));
function color(block: CannonBlock) {
  const name = block.state.Name;
  if (name === 'minecraft:tnt') return '#b64054';
  if (name === 'minecraft:glass') return '#eaf4fb';
  if (name.includes('coral')) return '#926341';
  if (name.includes('glass'))
    return name.includes('black') ? '#4b5563' : '#dae3ec';
  if (
    name.includes('redstone') ||
    name.includes('repeater') ||
    name.includes('comparator')
  )
    return '#a66157';
  if (name.includes('piston')) return '#7c876f';
  if (name.includes('observer')) return '#6b7280';
  if (name.includes('slime')) return '#a1b47b';
  return '#cbd5e1';
}
function letter(block: CannonBlock) {
  const name = block.state.Name;
  if (name === 'minecraft:tnt')
    return block.tntRole === 'propulsion' ? 'B' : 'T';
  if (name === 'minecraft:glass') return 'G';
  if (name.includes('coral')) return 'F';
  if (
    name.includes('redstone') ||
    name.includes('repeater') ||
    name.includes('comparator')
  )
    return 'R';
  if (name.includes('piston')) return 'P';
  if (name.includes('observer')) return 'O';
  if (name.includes('slime')) return 'S';
  return '';
}
</script>
<template>
  <div>
    <v-card-text class="d-flex align-center flex-wrap ga-3">
      <v-select
        id="pearl-layer"
        v-model="layer"
        :items="layers"
        :label="copy.layer"
        density="compact"
        hide-details
        style="max-width: 150px"
      />
      <v-switch
        v-model="fit"
        :label="copy.fit"
        density="compact"
        hide-details
      />
      <span class="text-caption"
        >B {{ copy.boost }} · T {{ copy.payload }} · G {{ copy.glass }}</span
      >
      <span class="text-caption"
        >{{ copy.orientation }} {{ result.plan.degrees }}°{{
          result.plan.mirrorZ ? ' + ' + copy.mirror : ''
        }}</span
      >
    </v-card-text>
    <svg
      :viewBox="viewBox"
      role="img"
      :aria-label="copy.preview"
      class="pearl-layer"
      preserveAspectRatio="xMidYMid meet"
      @pointerleave="clearMouseHover"
    >
      <defs>
        <pattern
          id="pearl-grid"
          width="1"
          height="1"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 1 0 L 0 0 0 1"
            fill="none"
            stroke="#2c4035"
            stroke-width="0.035"
          />
        </pattern>
      </defs>
      <rect
        :x="bounds[0]"
        :y="bounds[1]"
        :width="bounds[2]"
        :height="bounds[3]"
        fill="url(#pearl-grid)"
      />
      <g
        v-for="block in selected"
        :key="block.p.join(',')"
        @pointerenter="hovered = block"
        @pointerdown="hovered = block"
      >
        <title>
          {{ block.p.join(', ') }}: {{ blockName(block.state.Name, locale) }}
          {{ JSON.stringify(block.state.Properties ?? {}) }}
        </title>
        <rect
          :x="block.p[0]"
          :y="block.p[2]"
          width="0.9"
          height="0.9"
          :fill="color(block)"
        />
        <text
          v-if="letter(block)"
          :x="block.p[0] + 0.45"
          :y="block.p[2] + 0.65"
          text-anchor="middle"
          font-size="0.6"
          :fill="block.state.Name === 'minecraft:glass' ? '#455769' : '#fff'"
          pointer-events="none"
        >
          {{ letter(block) }}
        </text>
      </g>
    </svg>
    <v-card-text class="text-caption">
      <div role="status">
        {{
          hovered
            ? `(${hovered.p.join(', ')}) ${blockName(hovered.state.Name, locale)} ${Object.entries(
                hovered.state.Properties ?? {},
              )
                .map(([key, value]) => `${key}=${value}`)
                .join(' ')}`
            : copy.hoverHelp
        }}
      </div>
      <div>
        Y = {{ layer }} · {{ selected.length }} {{ copy.block }} ·
        {{ copy.correction }}
      </div>
    </v-card-text>
  </div>
</template>
<style scoped>
.pearl-layer {
  display: block;
  width: 100%;
  height: min(45vw, 470px);
  min-height: 300px;
  background: #17251f;
  touch-action: manipulation;
}
</style>
