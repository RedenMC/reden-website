<script lang="ts" setup>
import { ref } from 'vue';
import { toast } from 'vuetify-sonner';
import type { MachineDef } from '~/pages/litematica/index.vue';
import { useDisplay } from 'vuetify';
import selectableModels from '~/utils/litematica/models_selectable.json';
import { useAppStore } from '~/store/app';
import type { VForm } from 'vuetify/components';
import TagSelector from '~/components/litematica/TagSelector.vue';
import { isDevelopment } from 'std-env';
import { config as mdConfig, MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { EditorView } from '@codemirror/view';
import { localeToIso } from '~/i18n/i18n.config';
import MDEDITOR_ZH_TW from '@vavt/cm-extension/dist/locale/zh-TW';
import MDEDITOR_RU from '@vavt/cm-extension/dist/locale/ru';
import { globalTheme, groupMinecraftVersions, compareMinecraftVersions } from '~/utils/constants';


const mdCustomTooltip = ref({
  display: false,
  content: "",
  position: [0, 0],
  buttonWidth: 0,
});

const mdAdjustTooltip = () => {
  const tooltip = document.querySelector('.redenmd-custom-tooltip')! as HTMLElement;
  const rect = tooltip.getBoundingClientRect();
  const original = Number.parseFloat(tooltip.style.getPropertyValue('left').split('px')[0]);
  if (original == mdCustomTooltip.value.position[0]) {
    tooltip.style.setProperty('left', `${mdCustomTooltip.value.position[0] - rect.width / 2 + mdCustomTooltip.value.buttonWidth / 2}px`)
  }
};
const editorMounted = () => {
  // Hacky thing.
  const toolbar = document.querySelector('.md-editor-toolbar');
  const marker = document.querySelector('.upload-dialog-marker')!.getBoundingClientRect();
  if (toolbar) {
    for (const i of document.querySelectorAll('button.md-editor-toolbar-item')) {
      const title = i.getAttribute('title')!;
      i.removeAttribute('title');
      i.addEventListener('mouseover', (_e) => {
        mdCustomTooltip.value.content = title;
        const rect = i.getBoundingClientRect();
        mdCustomTooltip.value.buttonWidth = rect.width;
        mdCustomTooltip.value.position = [rect.left - marker.left, rect.top - marker.top + rect.height + 5];
        mdCustomTooltip.value.display = true;
      });
      i.addEventListener('mouseleave', (_e) => {
        mdCustomTooltip.value.display = false;
      });
    }
  }
};

const uploadImage = async (files: Array<File>, callback: (urls: string[] | { url: string; alt: string; title: string }[]) => void) => {
  let result = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch('/api/mc-services/yisibite/upload/markdown-image', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        result.push(data.url);
      } else {
        toastError(response, "Image upload failed");
        throw new Error("Image upload failed");
      }
    } catch (error: any) {
      toastError(error, "Image upload failed");
      throw error;
    }
  }
  callback(result);
};

const appStore = useAppStore();

const mdFirstUseNotification = ref(false);

const props = defineProps<{
  editMode?: boolean;
  /**
   * Localized DTOs
   */
  machine?: Record<string, MachineDef> | null;
}>();
const emit = defineEmits<{
  'update:machine': [Record<string, Partial<MachineDef>>];
}>();
const { height } = useDisplay();

const localePath = useLocalePath();
type State = 'upload' | 'translation' | 'tags' | 'image' | 'under-review';
const states = [
  'upload',
  'translation',
  'tags',
  'image',
  'under-review',
] as const;
const state = ref<State>('upload');
watch(state, (newState) => {
  if (!availableSteps.value.includes(newState)) {
    availableSteps.value.push(newState);
  }

  if (newState === 'translation') {
    if (localStorage.getItem('md-introduction-read') === null) {
      mdFirstUseNotification.value = true;
      localStorage.setItem('md-introduction-read', 'random value');
    }
  }
});
const refreshProps = () => {
  if (props.editMode && state.value === 'upload') {
    state.value = 'translation';
  }
  localizedData.value = {
    ...localizedData.value,
    ...props.machine,
  };
  const machine = Object.entries(props.machine ?? {})?.[0]?.[1];
  machineId.value = machine?.key;
  isOriginal.value = machine?.original;
  selectedFiles.value =
    machine?.attachments?.map(
      (item) =>
        ({
          name: item.name,
          url: item.url,
          fileType: 'uploaded',
        }) as MyFile,
    ) ?? [];
  selectedPictures.value =
    machine?.images?.map(
      (url) =>
        ({
          name: url,
          url,
          fileType: 'uploaded',
        }) as MyFile,
    ) ?? [];
  selectedVersions.value = machine?.versions ?? [];
  const featureTags = machine?.featureTags ?? [];
  const categoryTag = machine?.categoryTag;
  const allTags = categoryTag ? [categoryTag, ...featureTags] : featureTags;
  tagsWithName.value = allTags.map((t) => ({ name: t.name, code: t.tag }));
};
const availableSteps = ref<State[]>(
  props.editMode ? ['upload', 'translation', 'tags', 'image'] : ['upload'],
);
type MyFile = {
  file?: File;
  name: string;
  url: string;
  fileType: 'uploading' | 'uploaded';
};
const selectedFiles = ref<MyFile[]>([]);
const fileInput = useTemplateRef<HTMLInputElement>('fileInput');
const pictureInput = useTemplateRef<HTMLInputElement>('pictureInput');
const selectedPictures = ref<MyFile[]>([]);
const pictureStepError = ref<string>();
const machineId = ref<string>();
const disallowedFilename = '\r\n\\\u0000\u000c`?*<>|:\'"'.split(''); // allow '/'
const uploading = ref(false);
const isOriginal = ref();
const productRates = ref<
  {
    item: string;
    rate: number;
  }[]
>([
  {
    item: '',
    rate: 0,
  },
]);

async function doUploadAll() {
  uploading.value = true;
  if (!props.editMode || selectedFiles.value.length > 0) {
    if (selectedFiles.value.length > 6) {
      toast.error('你最多只能上传6个文件');
      uploading.value = false;
      return;
    }
    if (litematicaGenerator.value) {
      if (
        selectedFiles.value.length != 1 ||
        (selectedFiles.value[0].fileType !== 'uploaded' &&
          !selectedFiles.value[0]?.file?.name.endsWith('.litematic'))
      ) {
        toast.error(
          t(
            'upload.desc.litematica_generator_only_support_uploading_1_litematica_file',
          ),
          {
            duration: 1e4,
          },
        );
        uploading.value = false;
        return;
      }
    }
    const formData = new FormData();
    for (const file of selectedFiles.value) {
      if (file.fileType === 'uploading') {
        formData.append('upload', file.file!, file.name);
      } else {
        formData.append('external', file.url);
      }
    }
    const file = selectedFiles.value[0];
    let response: Response | undefined;
    if (!machineId.value) {
      machineId.value = crypto.randomUUID();
    }
    if (litematicaGenerator.value && file.fileType === 'uploading') {
      response = await doFetchPut(
        `/api/mc-services/yisibite/${machineId.value}`,
        file.file,
        {
          'Content-Type': 'reden/litematica',
        },
      );
    } else {
      response = await doFetchPut(
        `/api/mc-services/yisibite/${machineId.value}`,
        formData,
      );
    }
    if (response && !response.ok) {
      await toastError(response, 'Failed to upload file');
      uploading.value = false;
      return;
    } else {
      toast.success('File uploaded successfully');
      await delay(1e3);
    }
  }
  for (const lang of availableLocales) {
    const data = localizedData.value[lang];
    console.log('uploading', lang, data);
    if (localizedData.value[lang]?.name) {
      localizedData.value[lang].key = machineId.value;
      const response = await doFetchPost(
        `/api/mc-services/yisibite/${machineId.value}/info/${lang}`,
        {
          name: data.name,
          summary: data.summary,
          description: data.description,
          link: data.link,
          isOriginal: isOriginal.value,
          versions: selectedVersions.value,
          tagCodes: tagsWithName.value.map((tag) => tag.code),
        },
      );
      if (response.ok) {
        toast.success(`${t(lang)} uploaded successfully`);
      } else {
        await toastError(response, 'Failed to upload info');
        uploading.value = false;
        return;
      }
    }
  }
  if (selectedPictures.value.length > 0) {
    const formData = new FormData();
    for (const file of selectedPictures.value) {
      if (file.fileType === 'uploading') {
        formData.append('upload', file.file!, file.name);
      } else {
        formData.append('external', file.url);
      }
    }
    const response = await doFetchPut(
      `/api/mc-services/yisibite/${machineId.value}/thumbnails`,
      formData,
    );
    if (response.ok) {
      toast.success('Images uploaded successfully');
    } else {
      await toastError(response, 'Failed to upload images');
      uploading.value = false;
      return;
    }
  }
  emit('update:machine', localizedData.value);

  state.value = 'under-review';
  availableSteps.value = ['under-review'];
  uploading.value = false;
}

const triggerPictureInput = () => {
  if (pictureInput.value) {
    pictureInput.value.click();
  }
};

const removePicture = (index: number) => {
  const splice = selectedPictures.value.splice(index, 1);
  URL.revokeObjectURL(splice[0].url);
};

onMounted(() => {
  mdConfig({
    codeMirrorExtensions(extensions) {
      return [
        ...extensions,
        {
          'type': 'font',
          extension: EditorView.theme({
            '.cm-content': {
              fontFamily: "JetBrains Mono, Liberation Mono, Mizuki Mono, monospace",
            }
          }),
        },
      ];
    },
    editorConfig: {
      languageUserDefined: {
        'zh-TW': MDEDITOR_ZH_TW,
        'ru': MDEDITOR_RU,
      }
    },
  });
  // 页面加载后清除input的值，防止重复上传相同文件不触发change事件
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  if (pictureInput.value) {
    pictureInput.value.value = '';
  }
});

const litematicaGenerator = ref<boolean>();
const localizedData = ref<Record<string, Partial<MachineDef>>>({});
const tagsWithName = ref<
  {
    name: string;
    code: string;
  }[]
>([]);

const MAX_FILE_NUMBER = 6;
const MAX_IMAGE_NUMBER = 5;

// 是否 **有可能** 是投影生成器，if true, ask the user to confirm
const isPossibleLitematicaGenerator = computed(
  () =>
    selectedFiles.value.length === 1 &&
    selectedFiles.value[0].fileType === 'uploading' &&
    selectedFiles.value[0].file?.name.endsWith('.litematic'),
);

function generateMachineIdIfEmpty() {
  if (!machineId.value) {
    machineId.value = crypto.randomUUID();
  }
  return true;
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  // 确保不会超过最大文件数量
  const newFilesArray = Array.from(target.files);
  if (selectedFiles.value.length + newFilesArray.length > MAX_FILE_NUMBER) {
    toast.error(t('upload.toast.max_file_number', { count: MAX_FILE_NUMBER }));
    return;
  }

  // 追加新上传的文件到已选择的文件列表中
  selectedFiles.value.push(
    ...newFilesArray.map(
      (file) =>
        ({
          name: file.name,
          file,
          url: URL.createObjectURL(file),
          fileType: 'uploading',
        }) as MyFile,
    ),
  );

  const obj = getLocalizedData(language.value);

  // 自动填充名称和ID逻辑
  if (!obj.name && selectedFiles.value[0].file) {
    obj.name = selectedFiles.value[0].file.name.replace('.litematic', '');
    toast.success(t('upload.toast.auto_filled_name'));
  }
  if (!machineId.value && obj.name) {
    machineId.value = obj.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    toast.success(t('upload.toast.auto_filled_id'));
  }

  if (!isPossibleLitematicaGenerator.value) {
    if (!props.editMode) {
      state.value = 'translation';
    }
    litematicaGenerator.value = false;
  }
};

const {
  error: isIdTakenResponse,
  status: isIdTakenStatus,
  refresh: checkIdTaken,
} = useFetch(() => `/api/mc-services/yisibite/${machineId.value}/info`, {
  dedupe: 'defer',
});
const infoForm = useTemplateRef<VForm>('infoForm');

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
};

const { t, availableLocales, locale } = useI18n();
const language = ref<string>(locale.value);
const selectedVersions = ref<string[]>([]);
const { data: allMinecraftVersions } = useFetch<string[]>('/api/mc-services/litematica/all-versions', {
  dedupe: 'defer',
  default: () => [],
  transform: (value) => Array.isArray(value) ? value : [],
});
const versionGrouped = computed(() =>
  groupMinecraftVersions([...new Set(allMinecraftVersions.value ?? [])]),
);
const selectableVersions = computed(() => {
  const ret: (
    | string
    | {
      value: string;
      title: string;
    }
  )[] = [];
  const knownValues = new Set(allMinecraftVersions.value ?? []);
  const knownWildcards = new Set(Object.keys(versionGrouped.value).map(version => version + '.x'));
  const sortedKeys = Object.keys(versionGrouped.value).sort(compareMinecraftVersions);
  for (const version of sortedKeys) {
    ret.push(version + '.x');
    if (!selectedVersions.value.includes(version + '.x')) {
      for (const child of versionGrouped.value[version]) {
        ret.push({
          value: child,
          title: '↳ ' + child,
        });
      }
    }
  }
  for (const selected of selectedVersions.value) {
    if (!knownValues.has(selected) && !knownWildcards.has(selected)) {
      ret.unshift(selected);
    }
  }
  return ret;
});

function getLocalizedData(language: string) {
  if (!localizedData.value[language]) {
    localizedData.value[language] = {};
  }
  return localizedData.value[language];
}

const uploadingLocalizedData = ref(false);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadLocalizedData() {
  generateMachineIdIfEmpty();
  const validate: undefined | { valid: boolean; errors: any[] } =
    await infoForm.value?.validate();
  if (validate?.valid) {
    uploadingLocalizedData.value = true;
    await delay(500);
    uploadingLocalizedData.value = false;
    state.value = 'tags';
  }
}

const minHeight = Math.max(490, height.value - 300);
const maxHeight = Math.max(490, height.value - 300);
const goingBack = ref(false);
refreshProps();
watch(props, refreshProps);

const isActiveDrag = ref(false);

const toggleActiveDrag = (active: Boolean) => { };

const handleDrop = (event: DragEvent) => { };

const isActiveDragPicture = ref(false);
const toggleActiveDragPicture = (active: Boolean) => { };

const handlePictureDrop = (event: Event) => { };

const handlePictureChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files) return;

  if (selectedPictures.value.length + files.length > MAX_IMAGE_NUMBER) {
    toast.error(t('upload.toast.max_file_number', { count: MAX_IMAGE_NUMBER }));
    return;
  }
  pictureStepError.value = '';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 10 * 1024 * 1024) {
      pictureStepError.value = '图片大小不能超过 10 MB';
      selectedPictures.value = [];
      return;
    }
  }

  Array.from(files).forEach((file) =>
    selectedPictures.value.push({
      name: file.name,
      file,
      url: URL.createObjectURL(file),
      fileType: 'uploading',
    }),
  );
};
</script>
<template>
  <div class="upload-dialog-marker">
    <v-tabs v-model="state" color="primary">
      <v-tab v-for="item in states" :key="item" :disabled="!availableSteps.includes(item)" :value="item"
        class="text-capitalize">
        {{ t(`upload.step.${item}`) }}
      </v-tab>
    </v-tabs>

    <v-card-text class="pb-0">
      <v-card :elevation="0" :max-height="maxHeight" :min-height="minHeight" border class="rounded-xl overflow-y-auto">
        <v-tabs-window v-model="state">
          <v-tabs-window-item value="upload">
            <v-card-title class="text-h5">
              {{ t('upload.btn.upload_design') }}
            </v-card-title>
            <v-card-text class="text-center">
              <div :class="{ 'active-drag': isActiveDrag }" class="upload-container pa-4 border rounded-lg"
                @click="fileInput?.click()" @dragenter.prevent="toggleActiveDrag(true)"
                @dragover.prevent="toggleActiveDrag(true)" @dragleave.prevent="toggleActiveDrag(false)"
                @drop.prevent="handleDrop">
                <v-icon color="primary" size="100">mdi-cloud-upload</v-icon>
                <div class="opacity-60">
                  <p>{{ t('upload.desc.upload_schematic_or_world_save') }}</p>
                  <p>{{ t('upload.desc.design_supports_file_formats') }}</p>
                  <p>{{ t('upload.desc.design_maximal_file_size') }}</p>
                </div>
                <input ref="fileInput" multiple style="display: none" type="file" @change="handleFileChange" />
                <v-btn class="mt-4 text-capitalize" color="primary">
                  {{ t('upload.btn.select_files') }}
                </v-btn>
              </div>

              <div class="mt-4">
                <v-empty-state v-if="selectedFiles.length == 0" :title="t('upload.desc.not_upload')"></v-empty-state>
                <v-list v-else border class="pa-0 rounded-lg">
                  <!-- 整体容器 -->
                  <v-list-item v-for="(attachment, index) in selectedFiles" :style="{
                    'border-bottom':
                      index === selectedFiles.length - 1 ? 'none' : undefined,
                  }" border style="
                  border-top: none;
                  border-left: none;
                  border-right: none;
                  ">
                    <template #prepend>
                      <v-icon :icon="attachment.name.endsWith('litematic')
                        ? 'custom:CubeScan'
                        : 'custom:ZipArchive'
                        " :size="40" />
                    </template>
                    <v-list-item-title class="text-left">
                      <a v-if="attachment.name.endsWith('.litematic')" class="router cursor-pointer">
                        <v-icon size="sm">mdi-eye</v-icon>
                        {{ t('post.preview') }}
                        <v-dialog activator="parent" close-on-back>
                          <v-card>
                            <v-card-text class="overflow-hidden">
                              <LitematicaPreview :blob="attachment.file!" />
                              <div class="top-0 right-0 position-absolute mr-6 mt-4 text-white text-caption text-right"
                                style="user-select: none; line-height: 0.75rem">
                                <p class="opacity-60">
                                  Credit to misode, Ending Credits & Undecentions
                                  <br />
                                  This Vue component is made by zly2006 and
                                  licensed under AGPL v3
                                </p>
                                <v-switch v-model="appStore.invertPreview" class="right-0 position-absolute"
                                  color="primary" hide-details label="Invert" @click="appStore.toggleInvertPreview()" />
                              </div>
                            </v-card-text>
                          </v-card>
                        </v-dialog>
                      </a>
                      <span>
                        {{ attachment.name }}
                      </span>
                    </v-list-item-title>
                    <!-- 右侧内容区域 -->
                    <v-list-item-subtitle class="text-caption opacity-60 justify-space-between d-flex">
                      <span>
                        {{ formatFileSize(attachment?.file?.size ?? 0) }}
                      </span>
                    </v-list-item-subtitle>
                    <template #append>
                      <v-icon icon="mdi-close" size="xs" @click.stop="
                        () => {
                          selectedFiles.splice(index, 1);
                        }
                      " />
                    </template>
                  </v-list-item>
                </v-list>
              </div>
              <div v-if="editMode" class="mt-2 mx-auto text-pre-line text-warning" style="max-width: 400px">
                <v-icon>mdi-alert-circle</v-icon>
                {{ t('upload.desc.existing_machine_design') }}
              </div>
              <v-radio-group v-if="isPossibleLitematicaGenerator" v-model="litematicaGenerator"
                :label="t('upload.desc.post_type')" color="primary" density="compact" hide-details
                @update:model-value="() => (state = 'translation')">
                <v-radio :label="t('upload.desc.manual_upload')" :value="false" density="compact" />
                <v-radio :value="true" density="compact">
                  <template #label>
                    <div>
                      {{ t('upload.desc.litematica_generator') }}
                      勾选之前请确认你的投影符合
                      <router-link class="router" to="/zh_cn/docs/generator-rules">
                        生成器规则</router-link>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-card-text>
          </v-tabs-window-item>

          <v-tabs-window-item value="translation">
            <v-form ref="infoForm" fast-fail>
              <v-card-title>
                <v-row class="justify-space-between">
                  <v-col class="mb-1 mb-md-3" cols="12" sm="6">
                    <span class="text-h5 v-card-title pa-0">
                      {{ t('upload.step.translation') }}
                    </span>
                  </v-col>
                  <v-col class="py-0 py-sm-2 pb-1" cols="12" sm="6">
                    <div class="d-flex flex-row justify-end flex-wrap">
                      <div class="opacity-60 language-sel-tr">
                        {{
                          t('upload.desc.please_select_which_language_to_edit')
                        }}
                      </div>
                      <v-select v-model="language" :item-title="(i) => t(i)" :item-value="(i) => i"
                        :items="availableLocales" class="d-inline-block" color="primary" density="compact" hide-details
                        max-width="200px" outlined variant="underlined" />
                    </div>
                  </v-col>
                </v-row>
              </v-card-title>
              <v-card-text>
                <v-text-field v-model="machineId" :disabled="editMode" :rules="[
                  (v) => !!v || 'ID is required',
                  (v) =>
                    /^[a-z0-9\-_]+$/.test(v) ||
                    t('upload.desc.id_can_only_contain'),
                  (_) =>
                    editMode ||
                    isIdTakenResponse?.statusCode === 404 ||
                    t('upload.desc.id_is_taken'),
                ]" color="primary" label="ID" messages="ID 是用来制定网址的唯一的字符串，在投稿上传后不可修改，建议使用英文名称的关键词（或者留空自动生成）" outlined
                  variant="underlined" @update:model-value="() => editMode && checkIdTaken()">
                  <template v-if="!editMode" #details>
                    <template v-if="isIdTakenStatus === 'pending'">
                      Checking if this ID is taken...
                    </template>
                    <template v-else-if="isIdTakenResponse?.statusCode === 404">
                      <v-icon color="success">mdi-check</v-icon>
                      ID is available
                    </template>
                    <template v-else-if="!isIdTakenResponse?.statusCode">
                      <v-icon color="error">mdi-close</v-icon>
                      ID is taken
                    </template>
                  </template>
                </v-text-field>
                <v-text-field v-model="getLocalizedData(language).name" :label="t('common.name')" :rules="[
                  (v) =>
                    !disallowedFilename.some((c) => v.includes(c)) ||
                    t('upload.desc.name_cannot_contain_special_characters'),
                ]" color="primary" outlined variant="underlined" @update:model-value="console.log(localizedData)" />
                <!-- 禁用summary -->
                <v-text-field v-if="false" v-model="getLocalizedData(language).summary" :label="t('common.summary')"
                  color="primary" hide-details outlined variant="underlined" />
                <v-select v-model="selectedVersions" :items="selectableVersions" :label="t('common.supported_version')"
                  chips color="primary" density="comfortable" multiple variant="underlined">
                  <template #chip="{ item }">
                    <v-chip class="pa-2" color="px-2" size="sm">
                      {{ item.value }}
                    </v-chip>
                  </template>
                </v-select>
                <client-only>
                  <MdEditor v-model="getLocalizedData(language).description" :theme="globalTheme"
                    :toolbars="['bold', 'italic', 'title', '-', 'quote', 'unorderedList', 'orderedList', '-', 'link', 'image', '-', 'preview']"
                    :toolbars-exclude="['pageFullscreen', 'fullscreen']"
                    :language="localeToIso[language] !== undefined ? localeToIso[language] : 'en-US'"
                    @on-upload-img="uploadImage" @vue:mounted="editorMounted" />
                </client-only>
                <v-text-field v-model="getLocalizedData(language).link" :label="t('common.link')" color="primary"
                  hide-details outlined variant="underlined" />
                <v-radio-group v-model="isOriginal" color="primary" density="compact" hide-details row>
                  <v-radio :label="t('upload.desc.i_am_the_author')" :value="true" />
                  <v-radio :label="t('upload.desc.i_am_not_the_author')" :value="false" />
                </v-radio-group>
              </v-card-text>

              <template v-if="false">
                <v-alert class="ml-4 mr-4" text="This component is still wip, and has no real functionality yet."
                  title="Note" type="info" variant="tonal"></v-alert>
                <v-data-table :headers="[
                  { key: 'item', title: 'Item', sortable: false },
                  { key: 'rate', title: 'Rate', sortable: false },
                  { key: 'op', title: '', sortable: false },
                ]" :items="productRates" :items-per-page="100" hide-default-footer>
                  <template #[`item.item`]="{ index }" class="px-2">
                    <v-autocomplete v-model="productRates[index].item" :items="selectableModels" color="secondary"
                      density="compact" hide-details>
                      <template #prepend-inner>
                        <minecraft-item-display :id="productRates[index].item" :scale="2" />
                      </template>
                      <template #item="{ item, props }">
                        <v-list-item density="compact" v-bind="props">
                          <template #prepend>
                            <minecraft-item-display :id="item.value" :scale="2" class="mr-2" />
                          </template>
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                  </template>
                  <template #[`item.rate`]="{ index }">
                    <v-text-field v-model="productRates[index].rate" color="secondary" density="compact" hide-details
                      outlined type="number" />
                  </template>
                  <template #[`item.op`]="{ index }">
                    <v-btn :disabled="productRates.length <= 1" color="error" icon size="36"
                      @click="productRates.splice(index, 1)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                    <v-btn class="ml-4" color="primary" icon size="36"
                      @click="productRates.push({ item: '', rate: 0 })">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </template>
              <v-card-actions>
                <v-btn :loading="uploadingLocalizedData" block color="primary" variant="elevated"
                  @click="uploadLocalizedData">
                  {{ t('common.save') }}
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-tabs-window-item>

          <v-tabs-window-item value="tags">
            <v-card-title class="text-h5">
              {{ t('upload.step.tags') }}
            </v-card-title>
            <v-card-text>
              请选择合适的分类<br />
              <span class="opacity-80">
                <v-icon>mdi-information-outline</v-icon>
                您可以输入关键词进行搜索，然后从下拉列表中选择标签。
              </span>
              <tag-selector v-model="tagsWithName" />
            </v-card-text>
            <v-card-actions>
              <v-btn :disabled="!tagsWithName.length && !isDevelopment" class="text-none" color="primary" rounded="lg"
                variant="flat" @click="state = 'image'">
                {{ t('common.save') }}
              </v-btn>
            </v-card-actions>
          </v-tabs-window-item>

          <v-tabs-window-item value="image">
            <v-card-title class="text-h5">
              {{ t('upload.step.image') }}
            </v-card-title>
            <v-card-text class="text-center">
              <div :class="{ 'active-drag': isActiveDragPicture }"
                class="upload-container pa-4 border dashed rounded-lg"
                @dragenter.prevent="toggleActiveDragPicture(true)" @dragover.prevent="toggleActiveDragPicture(true)"
                @dragleave.prevent="toggleActiveDragPicture(false)" @drop.prevent="handlePictureDrop">
                <v-icon class="" color="primary" size="100">mdi-image-plus
                </v-icon>
                <div class="opacity-60">
                  <p>{{ t('upload.desc.upload_images') }}</p>
                  <p>{{ t('upload.desc.maximum_size_per_image') }}</p>
                </div>
                <input ref="pictureInput" accept="image/*" multiple style="display: none" type="file"
                  @change="handlePictureChange" />
                <v-btn class="mt-4 mx-4 text-capitalize" color="primary" @click="triggerPictureInput">
                  {{ t('upload.btn.select_files') }}
                </v-btn>
              </div>
              <div v-if="selectedPictures.length > 0" class="mt-4 image-container">
                <div v-for="(picture, index) in selectedPictures" :key="index" class="position-relative text-center">
                  <v-img :src="picture.url" class="border rounded-lg" contain max-height="240" max-width="240"
                    min-height="160" min-width="160">
                    <template #placeholder>
                      <v-row align="center" class="fill-height ma-0" justify="center">
                        <v-progress-circular color="grey-lighten-1" indeterminate />
                      </v-row>
                    </template>
                  </v-img>
                  <div class="delete-button-container">
                    <v-btn class="delete-button" icon size="x-small" @click="() => selectedPictures.splice(index, 1)">
                      <v-icon size="x-large">mdi-close</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-tabs-window-item>

          <v-tabs-window-item value="under-review">
            <v-card-title class="text-h5">
              {{ t('upload.step.under-review') }}
            </v-card-title>
            <v-card-text class="text-center">
              <v-icon class="my-8" color="green" size="100">
                mdi-clock-time-four-outline
              </v-icon>
              <div class="mt-4 opacity-60 text-center">
                <p>
                  {{
                    t(
                      'upload.desc.your_machine_design_is_under_review_please_wait_with_patience',
                    )
                  }}
                </p>
                <p></p>
                <p>
                  {{ t('upload.desc.review_usually_takes_one_to_two_days') }}
                </p>
                <p>
                  {{
                    t(
                      'upload.desc.you_will_receive_an_email_notification_when_approved',
                    )
                  }}
                </p>
              </div>
              <div class="mt-6">
                <p>
                  {{
                    t('upload.desc.please_contact_us_if_you_have_any_questions')
                  }}
                  <a class="router" href="mailto:info@redenmc.com">info@redenmc.com</a>
                </p>
              </div>
              <v-btn :href="localePath('/litematica')" :loading="goingBack" class="mt-6" color="primary"
                variant="outlined" @click="goingBack = true">
                {{ t('common.back') }}
              </v-btn>
            </v-card-text>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>
    </v-card-text>

    <v-card-actions class="px-6 py-6">
      <v-btn :disabled="!availableSteps.includes('image')" :loading="uploading" class="text-none" color="primary"
        rounded="lg" variant="flat" @click="doUploadAll">
        {{
          editMode
            ? t('upload.btn.finish_editing')
            : t('upload.btn.start_uploading')
        }}
      </v-btn>
    </v-card-actions>
    <v-dialog #default="{ isActive }" :model-value="mdFirstUseNotification" max-width="600"
      @close="mdFirstUseNotification">
      <v-card>
        <v-card-title>{{ t('upload.markdown.introduction_markdown_editor.title') }}</v-card-title>
        <v-card-text v-html="t('upload.markdown.introduction_markdown_editor.content')"></v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="mdFirstUseNotification = false">
            {{ t('common.ok') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card v-if="mdCustomTooltip.display" class="redenmd-custom-tooltip"
      :style="{ top: `${mdCustomTooltip.position[1]}px`, left: `${mdCustomTooltip.position[0]}px` }"
      @vue:mounted="mdAdjustTooltip" @vue:updated="mdAdjustTooltip">
      {{ mdCustomTooltip.content }}
    </v-card>
  </div>
</template>

<style scoped>
.line-h-24 {
  line-height: 24px;
}

.language-sel-tr {
  font-size: 0.9rem;
  line-height: 20px;
  padding-right: 7px;
  position: relative;
  top: 10px;
}

.upload-container {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.file-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.active-drag {
  border-color: #2196f3 !important;
  background-color: rgba(33, 150, 243, 0.1) !important;
}

.image-container {
  position: relative;
  align-items: center;
  justify-content: center;
  display: flex;
  height: auto;
  width: auto;
  gap: 12px;
}

.delete-button-container {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
}

.delete-button {}

.delete-button .v-icon {
  color: white;
}

.redenmd-custom-tooltip {
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 114514;
  padding: 3px 5px 3px 5px;
  user-select: none;
  font-size: 0.8em;
}

/* 确保在移动设备上有良好的响应性 */
@media (max-width: 768px) {
  .image-container {
    flex-direction: column !important;
  }
}
</style>
