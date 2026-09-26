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
  <div class="pearl-preview">
    <div class="view-controls">
      <label for="pearl-layer">{{ copy.layer }}</label>
      <select id="pearl-layer" v-model.number="layer" :aria-label="copy.layer">
        <option v-for="item in layers" :key="item.value" :value="item.value">
          {{ item.title }}
        </option>
      </select>
      <label class="fit-label"
        ><input v-model="fit" type="checkbox" />{{ copy.fit }}</label
      >
      <div class="legend">
        <span><b class="t-legend">B</b>{{ copy.boost }}</span
        ><span><b class="t-legend">T</b>{{ copy.payload }}</span
        ><span><b class="g-legend">G</b>{{ copy.glass }}</span>
      </div>
      <span class="direction"
        >{{ copy.orientation }}
        <strong
          >{{ result.plan.degrees }}°{{
            result.plan.mirrorZ ? ' + ' + copy.mirror : ''
          }}</strong
        ></span
      >
    </div>
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
    <div class="hover" role="status">
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
    <div class="caption">
      Y = {{ layer }} · {{ selected.length }} {{ copy.block }} ·
      {{ copy.correction }}
    </div>
  </div>
</template>
<style scoped>
.pearl-layer {
  display: block;
  width: 100%;
  height: 470px;
  background: #17251f;
  touch-action: manipulation;
}
.view-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 16px;
  border-bottom: 1px solid #d5dcd2;
  color: #5f6d62;
  font-size: 12px;
}
.view-controls select {
  width: auto;
  max-width: 100%;
  padding: 6px 9px;
  font-size: 12px;
  min-height: 34px;
  flex: 0 1 auto;
  background: #fff;
  color: #26352b;
  border: 1px solid #b5c0b2;
  border-radius: 4px;
}
.fit-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.fit-label input {
  accent-color: #32623c;
}
.legend {
  display: flex;
  gap: 8px 14px;
  align-items: center;
  flex-wrap: wrap;
  margin-left: auto;
  font-size: 11px;
}
.legend span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.legend b {
  display: inline-grid;
  place-items: center;
  width: 15px;
  height: 15px;
  font-size: 9px;
}
.t-legend {
  background: #b64054;
  color: #fff;
}
.g-legend {
  background: #eaf4fb;
  border: 1px solid #8297ad;
  color: #455769;
}
.direction {
  white-space: nowrap;
}
.direction strong {
  color: #435c47;
}
.hover {
  padding: 10px 16px;
  font-size: 11px;
  color: #5f6d62;
  border-top: 1px solid #d5dcd2;
  min-height: 38px;
  overflow-wrap: anywhere;
}
.caption {
  padding: 0 16px 12px;
  color: #5f6d62;
  font-size: 11px;
  line-height: 1.6;
}
@media (max-width: 1150px) {
  .pearl-layer {
    height: 450px;
  }
  .legend {
    margin-left: 0;
  }
}
@media (max-width: 800px) {
  .view-controls {
    padding: 9px 12px;
    gap: 8px;
  }
  .view-controls select {
    flex: 1;
    max-width: 220px;
  }
  .legend {
    flex-basis: 100%;
  }
  .pearl-layer {
    height: 370px;
  }
}
</style>
