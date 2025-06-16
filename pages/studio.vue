<script lang="ts" setup>
import {
  Identifier,
  type ItemRendererResources,
  NbtCompound,
  NbtFile,
  NbtInt,
  NbtList,
  NbtString,
  type Resources,
} from 'deepslate';
import selectableModels from '~/utils/litematica/models_selectable.json';
import * as localforage from 'localforage';
import { delay } from 'unicorn-magic';

type Tool = 'replace_blocks' | 'convert_version';
const tools: Tool[] = ['replace_blocks', 'convert_version'];
const currentTool = ref<Tool>('replace_blocks');
const { t } = useI18n();
const versionToDataVersion = {
  '1.12': 1343,
  '1.13': 1631,
  '1.14': 1952,
  '1.15': 2230,
  '1.16': 2586,
  '1.17': 2724,
  '1.18': 2860,
  '1.19': 3105,
  '1.20': 3463,
};

function translateMinecraft(id: string) {
  const key = 'minecraft.' + id;
  const translated = t(key, '', {
    default: '',
  });
  if (translated === key) {
    return id;
  }
  return translated;
}

useServerSeoMeta({
  title: t('studio.title'),
  titleTemplate: '%s - Reden',
  ogTitle: t('studio.litematica_studio'),
  ogDescription: t('studio.title'),
});

const replacements = ref<{ block: string; replacement: string }[]>([
  { replacement: '', block: '' },
]);
const targetVersion = ref('');
const uploadedFile = ref<File>();
const previewBlob = ref<Blob>();
watch(uploadedFile, (file) => {
  previewBlob.value = file;
});
if (import.meta.client) {
  localforage.getItem<Blob>('litematica-studio').then(async (blob) => {
    if (blob) {
      uploadedFile.value = new File(
        [await blob.arrayBuffer()],
        'redenmc.com-在线编辑.litematic',
      );
    }
  });
}
const resources = ref<Resources & ItemRendererResources>();
const fileUpload = useTemplateRef('fileUpload');
const nbt = computedAsync(async () => {
  if (!uploadedFile.value) return;
  const promise = new Promise<NbtCompound>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(uploadedFile.value!);
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
        blocks.add(name.replace('minecraft:', ''));
      }
    }
  }
  return [...blocks];
});

const applySuccess = ref<'idle' | 'working' | 'done'>('idle');

async function applyTool() {
  if (currentTool.value === 'replace_blocks') {
    console.log('Replacing blocks:', replacements.value);

    const nbtCompound = NbtCompound.fromJson(nbt.value!.toJson());
    const regions = nbtCompound.get('Regions') as NbtCompound;
    applySuccess.value = 'working';
    await delay({ milliseconds: 100 });
    for (const name of regions.keys()) {
      const region = regions.get(name) as NbtCompound;
      const palette = region.get('BlockStatePalette') as NbtList;
      for (const index in palette.getItems()) {
        const blockNbt = palette.getItems()[index] as NbtCompound;
        const name = blockNbt
          .get('Name')
          ?.getAsString()
          ?.replace('minecraft:', '');
        if (name) {
          const replacement = ((s?: string) => {
            if (!s) return;
            return s.includes(':') ? s : 'minecraft:' + s;
          })(replacements.value.find((r) => r.block === name)?.replacement);
          if (replacement) {
            console.log(
              'Replacing',
              blockNbt.toSimplifiedJson(),
              'with',
              replacement,
              'index',
              index,
            );
            blockNbt.set('Name', new NbtString(replacement));
            if (resources.value) {
              const defaultBlockProperties =
                resources.value.getDefaultBlockProperties(
                  Identifier.parse(replacement),
                ) ?? {};
              const propertiesNbt = blockNbt.get('Properties') as
                | NbtCompound
                | undefined;
              const resultNbt = new NbtCompound();
              for (const key of Object.keys(defaultBlockProperties)) {
                if (propertiesNbt && propertiesNbt.has(key)) {
                  resultNbt.set(key, propertiesNbt.get(key)!);
                } else {
                  const value = defaultBlockProperties[key];
                  resultNbt.set(key, new NbtString(value));
                }
              }
              blockNbt.set('Properties', resultNbt);
              console.log(resultNbt);
            } else {
              console.error('[studio.vue] resource not loaded');
            }
            console.log('post apply', blockNbt);
          }
        }
      }
    }
    console.log('New NBT:', nbtCompound.toJson());
    const newFile = new NbtFile(
      '1.litematic',
      nbtCompound,
      'gzip',
      false,
      undefined,
    );
    previewBlob.value = new Blob([newFile.write()], {
      type: 'application/octet-stream',
    });
    setTimeout(() => {
      applySuccess.value = 'done';
      setTimeout(() => {
        applySuccess.value = 'idle';
      }, 1000);
    }, 500);
  } else if (currentTool.value === 'convert_version') {
    console.log('Converting version');
  }
}

async function convertTo(blob: Blob, to: number) {
  const nbtCompound = await new Promise<NbtCompound>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
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
  if (to < 3953) {
    nbtCompound.set('Version', new NbtInt(6));
  }
  nbtCompound.set('MinecraftDataVersion', new NbtInt(to));
  const newFile = new NbtFile(
    'redenmc.com-版本转换.litematic',
    nbtCompound,
    'gzip',
    false,
    undefined,
  );
  return new Blob([newFile.write()], {
    type: 'application/octet-stream',
  });
}

function downloadBlob(_blob: Blob) {
  const url = URL.createObjectURL(_blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${uploadedFile.value?.name}.来自redenmc.com在线编辑.litematic`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div>
    <h1
      class="text-h4 text-sm-h3 text-md-h2 text-center"
      style="font-weight: bold"
    >
      {{ t('studio.litematica_studio') }}
    </h1>
    <p class="mx-5 mt-3">{{ t('studio.edit_your_litematica_file_here') }}</p>
    <v-col>
      <v-file-input
        ref="fileUpload"
        v-model="uploadedFile"
        accept=".litematic"
        label="Upload Litematic"
      />
    </v-col>
    <v-row v-if="previewBlob" class="flex-row-reverse">
      <v-col cols="12" lg="4" md="6">
        <v-sheet>
          <h3 class="text-h4 pa-4">{{ t('studio.toolbox') }}</h3>
          <div class="flex-wrap">
            <v-btn
              v-for="tool in tools"
              :key="tool"
              :active="currentTool === tool"
              :text="t('studio.' + tool)"
              :value="tool"
              active-color="primary"
              class="ma-2"
              height="36"
              rounded="large"
              variant="outlined"
              @click="currentTool = tool"
            />
          </div>

          <v-tabs-window v-model="currentTool" class="pt-5">
            <v-tabs-window-item :value="'replace_blocks'">
              <v-data-table
                :cell-props="{
                  class: 'px-3',
                }"
                :header-props="{
                  style: 'height: 24px',
                }"
                :headers="[
                  {
                    key: 'item',
                    title: t('studio.block_to_replace'),
                    sortable: false,
                  },
                  {
                    key: 'replace',
                    title: t('studIo.replacement'),
                    sortable: false,
                  },
                  { key: 'op', title: '', sortable: false, width: '96px' },
                ]"
                :items="replacements"
                :items-per-page="100"
                hide-default-footer
              >
                <template #[`item.item`]="{ index }" class="px-2">
                  <v-combobox
                    v-model="replacements[index].block"
                    :item-title="(id) => translateMinecraft(id)"
                    :item-value="(id) => id"
                    :items="existingBlocks"
                    color="secondary"
                    density="compact"
                    hide-details
                  >
                    <template #prepend-inner>
                      <minecraft-item-display
                        :id="replacements[index].block"
                        :scale="2"
                      />
                    </template>
                    <template #item="{ item, props }">
                      <v-list-item density="compact" v-bind="props">
                        <template #prepend>
                          <minecraft-item-display :id="item.value" :scale="2" />
                        </template>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </template>
                <template #[`item.replace`]="{ index }" class="px-2">
                  <v-combobox
                    v-model="replacements[index].replacement"
                    :item-title="(id) => translateMinecraft(id)"
                    :item-value="(id) => id"
                    :items="selectableModels"
                    color="secondary"
                    density="compact"
                    hide-details
                  >
                    <template #prepend-inner>
                      <minecraft-item-display
                        :id="replacements[index].replacement"
                        :scale="2"
                      />
                    </template>
                    <template #item="{ item, props }">
                      <v-list-item density="compact" v-bind="props">
                        <template #prepend>
                          <minecraft-item-display :id="item.value" :scale="2" />
                        </template>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </template>
                <template #[`item.op`]="{ index }">
                  <v-btn
                    :disabled="replacements.length <= 1"
                    color="error"
                    icon
                    size="36"
                    @click="replacements.splice(index, 1)"
                  >
                    <v-tooltip activator="parent" text="删除替换规则" />
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  <v-btn
                    color="primary"
                    icon
                    size="36"
                    @click="replacements.push({ replacement: '', block: '' })"
                  >
                    <v-tooltip activator="parent" text="新增替换规则" />
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </template>
              </v-data-table>

              <v-btn
                :color="applySuccess === 'done' ? 'success' : 'primary'"
                :loading="applySuccess === 'working'"
                :prepend-icon="
                  applySuccess === 'done' ? 'mdi-check' : 'mdi-cog-sync'
                "
                :text="t('studio.apply')"
                class="ma-4"
                variant="elevated"
                @click="async () => applyTool()"
              />
              <v-btn
                :disabled="!previewBlob"
                :text="t('litematica_generator.download')"
                class="ma-4"
                color="primary"
                variant="elevated"
                @click="downloadBlob(previewBlob!)"
              />
            </v-tabs-window-item>
            <v-tabs-window-item :value="'convert_version'" class="px-3">
              <!-- Please select the version you want to convert to:-->
              <div class="text-body-2">
                注意要先进行方块替换并应用后，如需转换版本再使用本工具。<br />
                此转换为<span class="text-orange">强制转换</span
                >，十分有可能可能导致投影/蓝图损坏，千万慎重。<br />
                一般情况下，可以保证方块是对的，箱子等容器中的物品则不一定。<br />
                若您充分了解以上风险，请选择您要转换到的版本：
              </div>
              <v-select
                v-model="targetVersion"
                :items="Object.keys(versionToDataVersion)"
                color="primary"
                hide-details
                label="请选择目标版本"
              />
              <v-col>
                <v-spacer />
                <v-btn
                  :disabled="!previewBlob"
                  color="primary"
                  @click="
                    async () =>
                      downloadBlob(await convertTo(previewBlob!, 2724))
                  "
                >
                  {{ t('studio.convert') }}
                </v-btn>
              </v-col>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-sheet>
      </v-col>
      <v-col class="position-relative" cols="12" lg="8" md="6">
        <MinecraftLitematicaPreview
          :blob="previewBlob!"
          no-key-listeners
          style="min-height: 700px"
          @loaded-resources="(it) => (resources = it)"
        />
      </v-col>
    </v-row>
    <v-card
      v-else
      :height="500"
      border
      class="mx-5 d-flex flex-column justify-space-around flex-0-0"
      rounded="xl"
    >
      <v-card-text class="text-center text-h6 text-md-h5">
        {{ t('studio.please_upload_a_litematica_file_to_edit_online') }}
        <br />
        <v-btn
          :text="t('studio.browse_files')"
          color="primary"
          size="xlarge"
          style="height: 48px; padding: 0 10px"
          variant="elevated"
          @click="fileUpload?.click()"
        />
      </v-card-text>
    </v-card>
    <!-- Introduction -->
    <div class="px-8 text-wrap">
      <h1>Litematica Studio： 你的网页蓝图工作室</h1>

      <h1>Litematica Studio: Your Web-Based Blueprint Workshop</h1>

      <p>
        <strong>Litematica Studio</strong>
        是一款强大的<strong>在线蓝图编辑器</strong>，专为 Minecraft Litematica
        模组设计。它将蓝图编辑的便利性提升到一个新的高度，让你可以直接在<strong>网页浏览器</strong>中自由创作、编辑和管理你的
        Litematica 蓝图 (.litematic 文件)。
      </p>
      <p>
        <strong>Litematica Studio</strong> is a powerful
        <strong>online blueprint editor</strong> specifically designed for the
        Minecraft Litematica mod. It elevates blueprint editing convenience to a
        new level, allowing you to create, edit, and manage your Litematica
        blueprints (.litematic files) directly within a
        <strong>web browser</strong>.
      </p>

      <h2>核心特性 / Key Features</h2>
      <ul>
        <li>
          <strong>网页化编辑体验 / Web-Based Editing Experience:</strong>
          <p>
            无需安装任何软件，只需打开浏览器即可开始编辑蓝图。随时随地，轻松访问和修改你的设计。
          </p>
          <p>
            No software installation required, just open your browser and start
            editing blueprints. Access and modify your designs easily anytime,
            anywhere.
          </p>
        </li>
        <li>
          <strong>实时 3D 预览 / Real-time 3D Preview:</strong>
          <p>
            在网页中以<strong>沉浸式 3D 视图</strong
            >预览你的蓝图，多角度观察建筑结构，即时查看编辑效果，告别游戏内反复加载预览的繁琐。
          </p>
          <p>
            Preview your blueprints in an
            <strong>immersive 3D view</strong> directly in the web browser.
            Observe building structures from multiple angles and instantly see
            editing results, eliminating the tedious process of repeated in-game
            loading and previewing.
          </p>
        </li>
        <li>
          <strong>直观的方块编辑工具 / Intuitive Block Editing Tools:</strong>
          <p>
            配备<strong>丰富的编辑工具</strong>，例如方块选择、放置、删除、批量替换等，操作简单直观，轻松塑造你的蓝图世界。
          </p>
          <p>
            Equipped with <strong>rich editing tools</strong> such as block
            selection, placement, deletion, and batch replacement. Operations
            are simple and intuitive, making it easy to shape your blueprint
            world.
          </p>
        </li>
        <li>
          <strong
            >强大的批量替换功能 / Powerful Batch Replacement
            Functionality:</strong
          >
          <p>
            支持<strong>高效的方块批量替换</strong>。无论是替换材质、调整颜色，还是修改特定类型的方块，都能一键完成，大幅提升编辑效率。
          </p>
          <p>
            Supports <strong>efficient batch block replacement</strong>. Whether
            it's replacing materials, adjusting colors, or modifying specific
            block types, it can be done with one click, greatly improving
            editing efficiency.
          </p>
        </li>
        <li>
          <strong
            >灵活的蓝图管理系统 / Flexible Blueprint Management System:</strong
          >
          <p>
            提供<strong>完善的蓝图管理功能</strong>，方便你对蓝图进行分类、命名、搜索和整理，轻松管理你的庞大蓝图库。
          </p>
          <p>
            Provides
            <strong>comprehensive blueprint management features</strong> for
            easy categorization, naming, searching, and organizing your vast
            blueprint library.
          </p>
        </li>
        <li>
          <strong>便捷的导入导出 / Convenient Import and Export:</strong>
          <p>
            完美支持 <strong>.litematic 格式</strong>文件的导入和导出，无缝衔接
            Litematica
            模组。让你的创作成果轻松应用于游戏之中，也可方便地与他人分享你的蓝图设计。
          </p>
          <p>
            Perfectly supports importing and exporting
            <strong>.litematic format</strong> files, seamlessly connecting with
            the Litematica mod. Effortlessly apply your creations in the game
            and easily share your blueprint designs with others.
          </p>
        </li>
      </ul>

      <p>
        <strong
          >Litematica Studio 旨在成为 Minecraft
          玩家和建筑师们最得力的蓝图创作伙伴。</strong
        >
        无论你是想快速修改现有蓝图，还是从零开始构建宏伟工程，Litematica Studio
        都将为你提供流畅、高效、便捷的蓝图编辑体验。
      </p>
      <p>
        <strong
          >Litematica Studio aims to be the most valuable blueprint creation
          partner for Minecraft players and builders.</strong
        >
        Whether you want to quickly modify existing blueprints or build
        magnificent projects from scratch, Litematica Studio will provide you
        with a smooth, efficient, and convenient blueprint editing experience.
      </p>
    </div>
  </div>
</template>

<style scoped></style>
