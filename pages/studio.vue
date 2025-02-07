<script lang="ts" setup>
import { NbtCompound, NbtFile, NbtList } from 'deepslate';

const blob = ref<File>();
const nbt = computedAsync(async () => {
  if (!blob.value) return;
  const promise = new Promise<NbtCompound>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob.value!);
    reader.onload = () => {
      const buff = new Uint8Array(reader.result as ArrayBuffer);
      console.log('buffer[before un-gzip]', buff);

      const nbt = NbtFile.read(buff, {
        compression: 'gzip',
      });
      console.log('Loaded litematic with NBT data:', nbt);
      resolve(nbt.root);
    };
    reader.onerror = reject;
  });

  return await promise;
});
const existingBlocks = computed(() => {
  if (!nbt.value) return [];
  const regions = nbt.value.get('Regions') as NbtCompound;
  const blocks = new Set<string>();
  for (const name of regions.keys()) {
    const region = regions.get(name) as NbtCompound;
    const palette = region.get('BlockStatePalette') as NbtList;
    for (const blockNbt of palette.getItems() as NbtCompound[]) {
      const name = blockNbt.get('Name')?.getAsString();
      if (name) {
        blocks.add(name);
      }
    }
  }
  return [...blocks];
});

watch(existingBlocks, (blocks) => {
  console.log('Existing blocks:', blocks);
});
</script>

<template>
  <v-file-input v-model="blob" accept=".litematic" label="Upload Litematic" />
  <LitematicaPreview v-if="blob" :blob="blob" />
</template>

<style scoped></style>
