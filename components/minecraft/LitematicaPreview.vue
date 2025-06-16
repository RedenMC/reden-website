<script lang="ts" setup>
import { assets } from '~/utils/litematica/assets';
import {
  NON_SELF_CULLING,
  OPAQUE_BLOCKS,
  TRANSPARENT_BLOCKS,
} from '~/utils/litematica/opaque';
import textureAtlas from '~/utils/litematica/blocks/atlas.png';
import textureData from '~/utils/litematica/blocks/data.json';
import defaultPropertiesData from '~/utils/litematica/blocks/mc-data-extract.json';

import {
  BlockDefinition,
  BlockModel,
  type BlockPos,
  Identifier,
  ItemModel,
  ItemRenderer,
  type ItemRendererResources,
  ItemStack,
  NbtFile,
  NbtTag,
  type Resources,
  Structure,
  StructureRenderer,
  TextureAtlas,
} from 'deepslate';
import { mat4, vec3 } from 'gl-matrix';
import { Litematic, readLitematicFromNBTData } from '~/utils/litematic-utils';
import { toast } from 'vuetify-sonner';
import { useAppStore } from '~/store/app';

const { t } = useI18n();
const props = defineProps<{
  blob: Blob;
  noKeyListeners?: boolean;
}>();
const emits = defineEmits<{
  'loaded-resources': [Resources & ItemRendererResources];
}>();
const canvas = useTemplateRef<HTMLCanvasElement>('canvas');
let deepslateResources: Resources & ItemRendererResources;
const appStore = useAppStore();

// Position and rotation
let viewDist = 4;
let xOffset = 0;
let yOffset = 0;
let xRotation = 0.8;
let yRotation = 0.5;
let cameraPos: vec3 | null = null;

function upperPowerOfTwo(x: number) {
  x -= 1;
  x |= x >> 1;
  x |= x >> 2;
  x |= x >> 4;
  x |= x >> 8;
  x |= x >> 18;
  x |= x >> 32;
  return x + 1;
}

// Taken from Deepslate examples
function loadResources(textureImage: HTMLImageElement) {
  const blockDefinitions: Record<string, BlockDefinition> = {};
  Object.keys(assets.blockstates).forEach((id) => {
    blockDefinitions['minecraft:' + id] = BlockDefinition.fromJson(
      assets.blockstates[id],
    );
  });

  const blockModels: Record<string, BlockModel> = {};
  Object.keys(assets.models).forEach((id) => {
    blockModels['minecraft:' + id] = BlockModel.fromJson(assets.models[id]);
  });
  Object.values(blockModels).forEach((m) =>
    m.flatten({ getBlockModel: (id) => blockModels[id.toString()] }),
  );
  // const itemModels: Record<string, ItemModel> = {};
  // Object.keys(assets.models)
  //   .filter((id) => id.startsWith('item/') && assets.models[id])
  //   .forEach((id) => {
  //     try {
  //       itemModels['minecraft:' + id] = ItemModel.fromJson(assets.models[id]);
  //     } catch (e) {}
  //   });

  const atlasCanvas = document.createElement('canvas');
  const atlasSize = upperPowerOfTwo(
    textureImage.width >= textureImage.height
      ? textureImage.width
      : textureImage.height,
  );
  atlasCanvas.width = textureImage.width;
  atlasCanvas.height = textureImage.height;

  const atlasCtx = atlasCanvas.getContext('2d')!;
  atlasCtx.drawImage(textureImage, 0, 0);

  const atlasData = atlasCtx.getImageData(0, 0, atlasSize, atlasSize);

  const idMap: Record<
    string,
    [u1: number, v1: number, u2: number, v2: number]
  > = {};

  Object.keys(textureData).forEach((id) => {
    const [u, v, du, dv] = (
      textureData as unknown as Record<string, [number, number, number, number]>
    )[id];
    const dv2 = du !== dv && id.startsWith('block/') ? du : dv;
    idMap['minecraft:' + id] = [
      u / atlasSize,
      v / atlasSize,
      (u + du) / atlasSize,
      (v + dv2) / atlasSize,
    ];
  });

  const textureAtlas = new TextureAtlas(atlasData, idMap);

  deepslateResources = {
    getBlockDefinition(id) {
      return blockDefinitions[id.toString()];
    },
    getBlockModel(id) {
      return blockModels[id.toString()];
    },
    getTextureUV(id) {
      return textureAtlas.getTextureUV(id);
    },
    getTextureAtlas() {
      return textureAtlas.getTextureAtlas();
    },
    getBlockFlags(id) {
      return {
        opaque: OPAQUE_BLOCKS.has(id.toString()),
        self_culling: !NON_SELF_CULLING.has(id.toString()),
        semi_transparent: TRANSPARENT_BLOCKS.has(id.toString()),
      };
    },
    getBlockProperties(id) {
      return null;
    },
    getDefaultBlockProperties(id: Identifier) {
      const props = (
        defaultPropertiesData.defaultProperties as Record<
          string,
          Record<string, string>
        >
      )[id.toString()];
      if (props) {
        return {};
      }
      return props;
    },
    getItemModel(id: Identifier): ItemModel | null {
      return null;
    },
    getItemComponents(id: Identifier): Map<string, NbtTag> {
      return new Map();
    },
  };
  emits('loaded-resources', deepslateResources);
}

function createRenderer(
  structure: Structure,
  canvas: HTMLCanvasElement,
): () => void {
  // Create canvas and size it appropriately
  function resizeCanvas() {
    // reset canvas size (default 300)
    canvas.width = -1;
    canvas.height = -1;
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
  }
  resizeCanvas();

  let options = {
    chunkSize: 8,
    useInvisibleBlockBuffer: false,
  };
  // Create Deepslate Renderer
  // Need chunksize 8 as seems to be a max number of faces per chunk that will render
  const gl = canvas.getContext('webgl');
  let renderer = new StructureRenderer(
    gl!,
    structure,
    deepslateResources,
    options,
  );

  // Crappy controls
  const size = structure.getSize();
  if (!cameraPos) {
    // init
    cameraPos = vec3.create();
    vec3.set(cameraPos, 0, -size[1] * 3, -size[2] * 1.5);
  }

  // refactor this code to use separate functions for each type of control
  function render() {
    yRotation = yRotation % (Math.PI * 2);
    xRotation = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, xRotation));
    viewDist = Math.max(1, Math.min(20, viewDist));

    const view = mat4.create();
    mat4.rotateX(view, view, xRotation);
    mat4.rotateY(view, view, yRotation);
    mat4.translate(view, view, cameraPos!); //[xOffset, yOffset, -viewDist]);
    //mat4.translate(view, view, );

    renderer.drawStructure(view);
    renderer.drawGrid(view);

    //todo
    if (0) {
      new ItemRenderer(
        gl!,
        new ItemStack(Identifier.parse('minecraft:stone'), 1),
        deepslateResources,
      );
    }
  }

  let redrawHandle: number | undefined;
  let destroy = false;

  function redraw() {
    if (redrawHandle) {
      cancelAnimationFrame(redrawHandle);
    }
    if (destroy) {
      return;
    }
    redrawHandle = requestAnimationFrame(render);
  }

  redraw();

  function move3d(direction: vec3, relativeVertical = true, sensitivity = 1) {
    let offset = vec3.create();
    vec3.set(
      offset,
      direction[0] * sensitivity,
      direction[1] * sensitivity,
      direction[2] * sensitivity,
    );
    if (relativeVertical) {
      vec3.rotateX(offset, offset, [0, 0, 0], -xRotation * sensitivity);
    }
    vec3.rotateY(offset, offset, [0, 0, 0], -yRotation * sensitivity);
    vec3.add(cameraPos!, cameraPos!, offset);
  }

  function pan(direction: [number, number], sensitivity = 1) {
    // seems backwards but is correct
    const multiplier = appStore.invertPreview ? 1 : -1;
    yRotation += multiplier * (direction[0] / 200) * sensitivity;
    xRotation += multiplier * (direction[1] / 200) * sensitivity;
  }

  function move(offset: [number, number], sensitivity: number) {
    xOffset = ((offset[0] * viewDist) / 300) * sensitivity;
    yOffset = ((offset[1] * viewDist) / 300) * sensitivity;
    let offset_vector = vec3.create();
    vec3.set(offset_vector, xOffset, -yOffset, 0);
    vec3.rotateX(offset_vector, offset_vector, [0, 0, 0], -xRotation);
    vec3.rotateY(offset_vector, offset_vector, [0, 0, 0], -yRotation);
    vec3.add(cameraPos!, cameraPos!, offset_vector);
  }

  function runMovementFunction(
    setting: string | never,
    movement: [number, number],
    controls: Record<
      string,
      (movement: [number, number], sensitivity: number) => void
    >,
    _default: string,
  ) {
    const value = 0;
    let sensitivity = 1;
    // if (sensitivitySetting) {
    //   // sensitivity *= parseFloat(localStorage.getItem(sensitivitySetting) ?? 1);
    // }
    // if (invertSetting) {
    //   // const invert =
    //   //   localStorage.getItem(invertSetting) === 'true' ??
    //   //   document.getElementById(invertSetting)?.checked === 'true';
    //   // if (invert) {
    //   //   sensitivity *= -1;
    //   // }
    // }
    controls[_default](movement, sensitivity);
  }

  let middleClickPos: [number, number] | null = null;
  let leftPos: [number, number] | null = null;
  canvas.addEventListener('mousedown', (evt) => {
    if (evt.button === 0) {
      evt.preventDefault();
      leftPos = [evt.clientX, evt.clientY];
    } else if (evt.button === 1) {
      evt.preventDefault();
      middleClickPos = [evt.clientX, evt.clientY];
    }
  });
  document.addEventListener('mousemove', (evt) => {
    if (middleClickPos) {
      const args: [number, number] = [
        evt.clientX - middleClickPos[0],
        evt.clientY - middleClickPos[1],
      ];
      runMovementFunction('middle-click-drag', args, { move, pan }, 'move');
      middleClickPos = [evt.clientX, evt.clientY];
      redraw();
    } else if (leftPos) {
      const args: [number, number] = [
        evt.clientX - leftPos[0],
        evt.clientY - leftPos[1],
      ];
      runMovementFunction('click-drag', args, { move, pan }, 'pan');
      leftPos = [evt.clientX, evt.clientY];
      redraw();
    }
  });
  document.addEventListener('mouseup', (evt) => {
    if ((evt.button === 0 && leftPos) || (evt.button === 1 && middleClickPos)) {
      leftPos = null;
      middleClickPos = null;
      evt.preventDefault();
    }
  });
  canvas.addEventListener('wheel', (evt) => {
    evt.preventDefault();
    move3d([0, 0, -evt.deltaY / 200]);
    redraw();
  });

  const moveDist = 0.2;
  const keyMoves: Record<string, [number, number, number]> = {
    KeyW: [0, 0, moveDist],
    KeyS: [0, 0, -moveDist],
    KeyA: [moveDist, 0, 0],
    KeyD: [-moveDist, 0, 0],
    ArrowUp: [0, 0, moveDist],
    ArrowDown: [0, 0, -moveDist],
    ArrowLeft: [moveDist, 0, 0],
    ArrowRight: [-moveDist, 0, 0],
    ShiftLeft: [0, moveDist, 0],
    Space: [0, -moveDist, 0],
  };
  let pressedKeys = new Set<string>();

  const keyDownListener: (evt: KeyboardEvent) => any = (evt) => {
    if (evt.code in keyMoves) {
      evt.preventDefault();
      pressedKeys.add(evt.code);
    }
  };
  const keyUpListener: (evt: KeyboardEvent) => any = (evt) => {
    if (evt.code in keyMoves) {
      evt.preventDefault();
      pressedKeys.delete(evt.code);
    }
  };
  const resizeListener: (evt: UIEvent) => any = () => {
    // resizeCanvas();
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');
    renderer = new StructureRenderer(
      gl!,
      structure,
      deepslateResources,
      options,
    );
    redraw();
  };
  if (!props.noKeyListeners) {
    document.addEventListener('keydown', keyDownListener);
    document.addEventListener('keyup', keyUpListener);

    window.addEventListener('blur', () => pressedKeys.clear());
  }
  window.addEventListener('resize', resizeListener);

  setInterval(() => {
    if (pressedKeys.size == 0) return;

    let direction = vec3.create();
    for (const key of pressedKeys) {
      vec3.add(direction, direction, keyMoves[key]);
    }
    move3d(direction, false);
    redraw();
  }, 1000 / 60);

  canvas.addEventListener('touchstart', touchHandler);
  canvas.addEventListener('touchmove', touchHandler);
  canvas.addEventListener('touchend', () => {
    middleClickPos = null;
    prevDist = 0;
    prevAvgX = 0;
    prevAvgY = 0;
  });

  const pinchSpeed = 0.015;
  const dragSpeed = 0.01;
  let prevAvgX: number;
  let prevAvgY: number;
  let prevDist: number;

  function touchHandler(evt: TouchEvent) {
    if (evt.touches.length == 1) {
      if (evt.touches && middleClickPos) {
        const dx = evt.touches[0].pageX - middleClickPos[0]; // x movement
        const dy = evt.touches[0].pageY - middleClickPos[1]; // y movement

        pan([dx, dy]);

        redraw();
      }
      middleClickPos = [evt.touches[0].pageX, evt.touches[0].pageY];
      evt.preventDefault();
    } else if (evt.touches.length == 2) {
      // Pinch to move forward/backward
      const dx = evt.touches[0].pageX - evt.touches[1].pageX;
      const dy = evt.touches[0].pageY - evt.touches[1].pageY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (!prevDist) prevDist = dist;

      // Drag to move left/right/up/down
      const avgX = evt.touches[0].pageX + evt.touches[1].pageX / 2;
      const avgY = evt.touches[0].pageY + evt.touches[1].pageY / 2;
      if (!prevAvgX) prevAvgX = avgX;
      if (!prevAvgY) prevAvgY = avgY;
      const distX = (avgX - prevAvgX) * dragSpeed;
      const distY = (prevAvgY - avgY) * dragSpeed;

      move3d([distX, distY, (dist - prevDist) * pinchSpeed]);
      redraw();
      prevDist = dist;
      prevAvgX = avgX;
      prevAvgY = avgY;
      evt.preventDefault();
    }
  }

  return () => {
    destroy = true;
    console.log('Cleaning up renderer', renderer);

    document.removeEventListener('keydown', keyDownListener);
    document.removeEventListener('keyup', keyUpListener);
    window.removeEventListener('resize', resizeListener);

    canvas.removeEventListener('touchstart', touchHandler);
    canvas.removeEventListener('touchmove', touchHandler);
  };
}

function structureFromLitematic(litematic: Litematic) {
  let height = 0;
  let depth = 0;
  let width = 0;
  let global_y = Infinity;
  let global_z = Infinity;
  let global_x = Infinity;

  for (const region of litematic.regions) {
    global_x = Math.min(global_x, region.x, region.x + region.width);
    global_y = Math.min(global_y, region.y, region.y + region.height);
    global_z = Math.min(global_z, region.z, region.z + region.depth);
    width = Math.max(width, region.x, region.x + region.width);
    height = Math.max(height, region.y, region.y + region.height);
    depth = Math.max(depth, region.z, region.z + region.depth);
  }

  const structure = new Structure([
    width - global_x,
    height - global_y,
    depth - global_z,
  ]);

  // Add blocks from litematic NBT
  console.log('Building', litematic.regions.length, 'regions');
  for (let region of litematic.regions) {
    console.log('Building region start.');
    // When lazy to do anything so just unpack
    const {
      x: origin_x,
      y: origin_y,
      z: origin_z,
      blocks,
      blockPalette,
    } = region;
    let blockCount = 0; // What do we do with this?

    // Unless there's a way to do this easier
    const dx = region.width > 0 ? 1 : -1;
    const dy = region.height > 0 ? 1 : -1;
    const dz = region.depth > 0 ? 1 : -1;
    const start_x = Math.min(0, region.width);
    const start_y = Math.min(0, region.height);
    const start_z = Math.min(0, region.depth);

    // One reason js is annoying... the funny thing is that
    // this whole thing can be done easily with Python's
    // negative indicies for negative region sizes
    for (let x = start_x; x < Math.max(0, region.width); x++) {
      for (let y = start_y; y < Math.max(0, region.height); y++) {
        for (let z = start_z; z < Math.max(0, region.depth); z++) {
          const blockID = blocks[x - start_x][y - start_y][z - start_z];
          const position: BlockPos = [
            x + origin_x - global_x,
            y + origin_y - global_y,
            z + origin_z - global_z,
          ];
          if (blockID > 0) {
            // Skip air-blocks
            if (blockID < blockPalette.length) {
              const blockInfo = blockPalette[blockID];
              const blockName = blockInfo.Name;
              blockCount++;

              if (blockInfo.hasOwnProperty('Properties')) {
                structure.addBlock(position, blockName, blockInfo.Properties);
              } else {
                structure.addBlock(position, blockName);
              }
            } else {
              // Something obvious so we know when things go wrong
              // Why not throw some error or something
              structure.addBlock(position, 'minecraft:stone');
            }
          }
        }
      }
    }
    console.log('Region done.', blockCount, 'blocks created.');
  }
  console.log('Done!');

  return structure;
}

let destroy = () => {};

function readFile(file: Blob) {
  if (!deepslateResources) {
    throw createError('Resources not loaded yet');
  }
  let reader = new FileReader();
  reader.readAsArrayBuffer(file);
  console.log(reader.result);

  reader.onload = () => {
    try {
      const buff = new Uint8Array(reader.result as ArrayBuffer);
      console.log('buffer[before un-gzip]', buff);

      const nbtdata = NbtFile.read(buff, {
        compression: 'gzip',
      }).toJson(); //.result; // Don't care about .compressed
      console.log('Loaded litematic with NBT data:', nbtdata);
      const litematic = readLitematicFromNBTData(nbtdata);

      destroy();

      const cvs = canvas.value!;
      destroy = createRenderer(structureFromLitematic(litematic), cvs);
    } catch (e) {
      console.error(e);
      toast.error(t('litematica_generator.failed_preview_load'), {
        duration: 5000,
      });
    }
  };

  reader.onerror = function () {
    toast.error(t('litematica_generator.failed_preview_load'), {
      duration: 5000,
    });
    console.log(reader.error);
  };
}

let imageLoaded: (image: HTMLImageElement) => void;
const resourceLoading = new Promise((resolve) => (imageLoaded = resolve));

onMounted(async () => {
  const image = document.getElementById('atlas') as HTMLImageElement;
  if (image.complete) {
    loadResources(image);
    imageLoaded(image);
  } else {
    image.addEventListener('load', () => {
      loadResources(image);
      imageLoaded(image);
    });
  }
  if (!props.blob) {
    console.error('[LitematicaPreview] No blob provided:', props.blob);
    toast.error(t('litematica_generator.failed_preview_load'), {
      duration: 5000,
    });
    return;
  }
  if (props.blob.size === 0) {
    toast.error('失败：文件为空', {
      duration: 5000,
    });
  }
  try {
    await resourceLoading;
    readFile(props.blob);
  } catch (e) {
    toast.error(t('litematica_generator.failed_preview_load'), {
      duration: 5000,
    });
    console.error(e);
  }
});
onUnmounted(() => {
  console.log('Unmounting');
  destroy();
});
watch(
  () => props.blob,
  () => {
    console.log('Blob changed', props.blob);
    resourceLoading.then(() => readFile(props.blob));
  },
);
</script>

<template>
  <div style="background: #333; height: 100%">
    <!-- Texture atlas -->
    <img
      id="atlas"
      alt="Texture atlas"
      crossorigin="anonymous"
      hidden
      :src="textureAtlas"
    />

    <canvas ref="canvas" class="w-100 h-100" @contextmenu.prevent=""></canvas>
  </div>
</template>

<style scoped></style>
