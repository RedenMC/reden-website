<script lang="ts" setup>
import { assets } from '~/utils/litematica/assets';

import textureAtlas from '~/utils/litematica/blocks/atlas.png';
import textureDataBlock from '~/utils/litematica/blocks/data.json';

const props = defineProps<{
  id: string;
  scale?: number;
}>();
const texture = computed(() => {
  const models: Record<string, { textures: Record<string, string> }> =
    assets['models'];

  const textures =
    models[`item/${props.id}`]?.textures ??
    models[`block/${props.id}`]?.textures;
  if (!textures) {
    console.error(`Model textures not found: ${props.id}`);
    return;
  }

  const texture = (textures['side'] ?? Object.values(textures)[0])?.replace(
    'minecraft:',
    '',
  );
  if (!texture) {
    console.error(`Texture not found: ${props.id}`);
    return;
  }
  return texture;
});

const textureData = computed(() => {
  const textureData: [number, number, number, number] = (
    textureDataBlock as unknown as Record<
      string,
      [number, number, number, number]
    >
  )[texture.value ?? ''];
  if (!textureData) {
    console.error(`Texture data not found: ${texture}`);
    return [];
  }
  return textureData;
});

const x = computed(() => textureData.value[0]);
const y = computed(() => textureData.value[1]);
const width = computed(() => textureData.value[2]);
const height = computed(() => textureData.value[3]);
</script>

<template>
  <div
    :data-texture-id="texture"
    v-if="texture"
    :style="{
      width: `${16 * (scale ?? 1)}px`,
      height: `${16 * (scale ?? 1)}px`,
      overflow: 'hidden',
    }"
  >
    <img
      :alt="id"
      :height="height"
      :src="textureAtlas"
      :style="{
        userSelect: 'none',
        objectPosition: `-${x}px -${y}px`,
        objectFit: 'none',
        imageRendering: 'pixelated',
        transformOrigin: 'top left',
        transform: `scale(${scale ?? 1})`,
      }"
      :width="width"
    />
  </div>
</template>

<style scoped></style>
