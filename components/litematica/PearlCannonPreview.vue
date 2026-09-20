<script lang="ts" setup>
// Read-only block-layer preview for Minecraft schematic data.
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CannonResult } from '~/utils/pearl-cannon/core.mjs';
import { pearlMessages } from '~/utils/pearl-cannon/messages';
import { blockName } from '~/utils/pearl-cannon/block-names';
const props = defineProps<{ result: CannonResult }>();
const { locale } = useI18n();
const copy = computed(() => pearlMessages[locale.value] ?? pearlMessages.en);
const layer = ref(92),
  fit = ref(true);
const layers = [92, 93, 97, 38, 35, 31, 5].map((value) => ({
  title: `Y = ${value}`,
  value,
}));
const selected = computed(() =>
  [...props.result.blocks.values()].filter((b) => b.p[1] === layer.value),
);
const viewBox = computed(() => {
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
  ].join(' ');
});
</script>
<template>
  <div>
    <v-select
      v-model="layer"
      :items="layers"
      :label="copy.layer"
      density="compact"
      variant="underlined"
      hide-details
    />
    <v-checkbox
      v-model="fit"
      :label="copy.fit"
      density="compact"
      hide-details
    />
    <div class="text-caption">
      B: {{ copy.boost }} · T: {{ copy.payload }} · G: {{ copy.glass }}
    </div>
    <svg
      :viewBox="viewBox"
      role="img"
      :aria-label="copy.preview"
      class="pearl-layer border rounded"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        v-for="block in selected"
        :key="block.p.join(',')"
        :class="
          block.state.Name === 'minecraft:tnt'
            ? 'text-error'
            : block.state.Name === 'minecraft:glass'
              ? 'text-primary'
              : 'text-medium-emphasis'
        "
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
          fill="currentColor"
          :fill-opacity="block.state.Name === 'minecraft:glass' ? 0.15 : 0.6"
        />
        <text
          v-if="
            block.state.Name === 'minecraft:tnt' ||
            block.state.Name === 'minecraft:glass'
          "
          :x="block.p[0] + 0.45"
          :y="block.p[2] + 0.65"
          text-anchor="middle"
          font-size="0.6"
          fill="currentColor"
        >
          {{
            block.state.Name === 'minecraft:glass'
              ? 'G'
              : block.tntRole === 'propulsion'
                ? 'B'
                : 'T'
          }}
        </text>
      </g>
    </svg>
    <div class="text-caption">
      Y = {{ layer }} · {{ selected.length }} {{ copy.block }}
    </div>
  </div>
</template>
<style scoped>
.pearl-layer {
  display: block;
  width: 100%;
  height: 340px;
}
</style>
