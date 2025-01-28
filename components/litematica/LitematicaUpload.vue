<script lang="ts" setup>
import { ref } from 'vue';
import { toast } from 'vuetify-sonner';
import type { MachineDef } from '~/pages/litematica/index.vue';
import { useDisplay } from 'vuetify';
import selectableModels from '~/utils/litematica/models_selectable.json';

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
type State = 'upload' | 'translation' | 'image' | 'under-review';
const states = ['upload', 'translation', 'image', 'under-review'] as const;
const state = ref<State>('upload');
watch(state, (newState) => {
  if (!availableSteps.value.includes(newState)) {
    availableSteps.value.push(newState);
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
          url: item.name,
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
};
const availableSteps = ref<State[]>(
  props.editMode ? ['upload', 'translation', 'image'] : ['upload'],
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
    if (selectedFiles.value.length > 3) {
      toast.error('你最多只能上传3个文件');
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

const handlePictureChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files) return;

  if (selectedPictures.value.length + files.length > 3) {
    pictureStepError.value = '最多只能上传3张图片';
    return;
  }
  pictureStepError.value = undefined;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 2 * 1024 * 1024) {
      pictureStepError.value = '图片大小不能超过2MB';
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

const removePicture = (index: number) => {
  const splice = selectedPictures.value.splice(index, 1);
  URL.revokeObjectURL(splice[0].url);
};

onMounted(() => {
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

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files?.length ?? 0 >= 1) {
    selectedFiles.value = Array.from(target.files!).map((file) => ({
      name: file.name,
      file,
      url: URL.createObjectURL(file),
      fileType: 'uploading',
    }));
    const obj = getLocalizedData(language.value);
    if (!obj.name && selectedFiles.value[0].file) {
      obj.name = selectedFiles.value[0].file.name.replace('.litematic', '');
      toast.success('Auto-filled name from file name');
    }
    if (!machineId.value && obj.name) {
      machineId.value = obj.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      toast.success('Auto-filled id from name');
    }
    if (selectedFiles.value.length > 1) {
      state.value = 'translation';
      litematicaGenerator.value = false;
    }
  }
};

const {
  error: isIdTakenResponse,
  status: isIdTakenStatus,
  refresh: checkIdTaken,
} = useFetch(() => `/api/mc-services/yisibite/${machineId.value}/info`, {
  dedupe: 'defer',
});

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
const selectableVersions = computed(() => {
  const ret: (
    | string
    | {
        value: string;
        title: string;
      }
  )[] = [];
  for (const version of Object.keys(versionGrouped).toReversed()) {
    ret.push(version + '.x');
    if (!selectedVersions.value.includes(version + '.x')) {
      for (const child of versionGrouped[version]) {
        ret.push({
          value: child,
          title: '↳ ' + child,
        });
      }
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
  uploadingLocalizedData.value = true;
  await delay(500);
  uploadingLocalizedData.value = false;
  state.value = 'image';
}

const minHeight = Math.max(490, height.value - 300);
const maxHeight = Math.max(490, height.value - 300);
const goingBack = ref(false);
refreshProps();
watch(props, refreshProps);
</script>
<template>
  <v-tabs v-model="state" color="primary">
    <v-tab
      v-for="item in states"
      :key="item"
      :disabled="!availableSteps.includes(item)"
      :value="item"
      class="text-capitalize"
    >
      {{ t(`upload.step.${item}`) }}
    </v-tab>
  </v-tabs>

  <v-card-text class="pb-0">
    <v-card
      :elevation="0"
      :max-height="maxHeight"
      :min-height="minHeight"
      border
      class="rounded-xl overflow-y-auto"
    >
      <v-tabs-window v-model="state">
        <v-tabs-window-item value="upload">
          <v-card-title class="text-h5">
            {{ t('upload.btn.upload_design') }}
          </v-card-title>
          <v-card-text class="text-center">
            <v-icon class="my-15" color="primary" size="100"
              >mdi-cloud-upload
            </v-icon>
            <div class="mt-4 opacity-60">
              <p>{{ t('upload.desc.upload_schematic_or_world_save') }}</p>
              <p>{{ t('upload.desc.design_supports_file_formats') }}</p>
              <p>{{ t('upload.desc.design_maximal_file_size') }}</p>
            </div>
            <input
              ref="fileInput"
              multiple
              style="display: none"
              type="file"
              @change="handleFileChange"
            />
            <v-btn
              class="mt-4 text-capitalize"
              color="primary"
              @click="fileInput?.click()"
            >
              {{ t('upload.btn.select_files') }}
            </v-btn>
            <p v-if="selectedFiles.length > 0" class="line-h-24">
              <span v-if="selectedFiles.length == 1">
                {{ selectedFiles[0].name }}
                ({{ formatFileSize(selectedFiles[0]?.file?.size ?? 0) }})
              </span>
              <span v-else-if="selectedFiles.length > 1">
                {{
                  t('upload.desc.selected_count_files', {
                    count: selectedFiles.length,
                  })
                }}
              </span>
              <v-btn
                color="error"
                icon="mdi-close"
                size="xs"
                variant="outlined"
                @click="(selectedFiles = []) && (availableSteps = ['upload'])"
              />
            </p>
            <div
              v-if="editMode"
              class="mt-2 mx-auto text-pre-line text-warning"
              style="max-width: 400px"
            >
              <v-icon>mdi-alert-circle</v-icon>
              {{ t('upload.desc.existing_machine_design') }}
            </div>
            <v-radio-group
              v-if="selectedFiles.length === 1"
              v-model="litematicaGenerator"
              color="primary"
              density="compact"
              label="Please select the type of this post"
              @update:model-value="() => (state = 'translation')"
            >
              <v-radio
                :label="t('upload.desc.manual_upload')"
                :value="false"
                density="compact"
              />
              <v-radio
                :label="t('upload.desc.litematica_generator')"
                :value="true"
                density="compact"
              />
            </v-radio-group>
          </v-card-text>
        </v-tabs-window-item>

        <v-tabs-window-item value="translation">
          <v-form fast-fail>
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
                        $t('upload.desc.please_select_which_language_to_edit')
                      }}
                    </div>
                    <v-select
                      v-model="language"
                      :item-title="(i) => t(i)"
                      :item-value="(i) => i"
                      :items="availableLocales"
                      class="d-inline-block"
                      color="primary"
                      density="compact"
                      hide-details
                      max-width="200px"
                      outlined
                      variant="underlined"
                    />
                  </div>
                </v-col>
              </v-row>
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="machineId"
                :disabled="editMode"
                :rules="[
                  (v) => !!v || 'ID is required',
                  (v) =>
                    /^[a-z0-9\-_]+$/.test(v) ||
                    $t('upload.desc.id_can_only_contain'),
                  (_) =>
                    editMode ||
                    isIdTakenResponse?.statusCode === 404 ||
                    $t('upload.desc.id_is_taken'),
                ]"
                color="primary"
                label="ID"
                outlined
                variant="underlined"
                @update:model-value="() => editMode && checkIdTaken()"
              >
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
              <v-text-field
                v-model="getLocalizedData(language).name"
                :label="$t('common.name')"
                :rules="[
                  (v) =>
                    !disallowedFilename.some((c) => v.includes(c)) ||
                    $t('upload.desc.name_cannot_contain_special_characters'),
                ]"
                color="primary"
                outlined
                variant="underlined"
                @update:model-value="console.log(localizedData)"
              />
              <!-- 禁用summary -->
              <v-text-field
                v-if="false"
                v-model="getLocalizedData(language).summary"
                :label="$t('common.summary')"
                color="primary"
                hide-details
                outlined
                variant="underlined"
              />
              <v-select
                v-model="selectedVersions"
                :items="selectableVersions"
                chips
                color="primary"
                density="comfortable"
                label="Supported Versions"
                multiple
                variant="underlined"
              >
                <template #chip="{ item }">
                  <v-chip color="px-2" size="sm">
                    {{ item.value }}
                  </v-chip>
                </template>
              </v-select>
              <v-textarea
                v-model="getLocalizedData(language).description"
                :label="$t('common.description')"
                color="primary"
                hide-details
                outlined
                variant="underlined"
              />
              <v-text-field
                v-model="getLocalizedData(language).link"
                :label="$t('common.link')"
                color="primary"
                hide-details
                outlined
                variant="underlined"
              />
              <v-radio-group
                v-model="isOriginal"
                color="primary"
                density="compact"
                hide-details
                row
              >
                <v-radio
                  :label="$t('upload.desc.i_am_the_author')"
                  :value="true"
                />
                <v-radio
                  :label="$t('upload.desc.i_am_not_the_author')"
                  :value="false"
                />
              </v-radio-group>
            </v-card-text>

            Note: This component is still wip, and has no real functionality
            yet.
            <v-data-table
              :headers="[
                { key: 'item', title: 'Item', sortable: false },
                { key: 'rate', title: 'Rate', sortable: false },
                { key: 'op', title: '', sortable: false },
              ]"
              :items="productRates"
              :items-per-page="100"
              hide-default-footer
            >
              <template #[`item.item`]="{ index }" class="px-2">
                <v-autocomplete
                  v-model="productRates[index].item"
                  :items="selectableModels"
                  color="secondary"
                  density="compact"
                  hide-details
                >
                  <template #prepend-inner>
                    <minecraft-item-display
                      :id="productRates[index].item"
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
                </v-autocomplete>
              </template>
              <template #[`item.rate`]="{ index }">
                <v-text-field
                  v-model="productRates[index].rate"
                  color="secondary"
                  density="compact"
                  hide-details
                  outlined
                  type="number"
                />
              </template>
              <template #[`item.op`]="{ index }">
                <v-btn
                  :disabled="productRates.length <= 1"
                  color="error"
                  icon
                  size="36"
                  @click="productRates.splice(index, 1)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn
                  color="primary"
                  icon
                  size="36"
                  @click="productRates.push({ item: '', rate: 0 })"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
            </v-data-table>
            <v-card-actions>
              <v-btn
                :loading="uploadingLocalizedData"
                block
                color="primary"
                variant="elevated"
                @click="uploadLocalizedData"
              >
                {{ $t('common.save') }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-tabs-window-item>

        <v-tabs-window-item value="image">
          <v-card-title class="text-h5"
            >{{ $t('upload.step.image') }}
          </v-card-title>
          <v-card-text class="text-center">
            <v-alert
              v-if="pictureStepError"
              :title="pictureStepError"
              class="mt-2 left-0 right-0 z-10"
              position="absolute"
              type="error"
            />
            <v-icon class="my-8" color="primary" size="100">
              mdi-image-plus
            </v-icon>
            <div class="mt-4 opacity-60">
              <p>{{ $t('upload.desc.upload_images') }}</p>
              <p>{{ $t('upload.desc.maximum_size_per_image') }}</p>
            </div>
            <input
              ref="pictureInput"
              accept="image/*"
              multiple
              style="display: none"
              type="file"
              @change="handlePictureChange"
            />
            <v-btn
              class="mt-4 mx-4 text-capitalize"
              color="primary"
              @click="triggerPictureInput"
            >
              {{ $t('upload.btn.select_files') }}
            </v-btn>

            <div v-if="selectedPictures.length > 0" class="mt-4">
              <div
                v-for="(picture, index) in selectedPictures"
                :key="index"
                class="d-inline-block mr-4 position-relative"
              >
                <v-img
                  :src="picture.url"
                  class="border rounded-lg"
                  contain
                  max-height="150"
                  max-width="150"
                  min-height="100"
                  min-width="100"
                >
                  <template #placeholder>
                    <v-row
                      align="center"
                      class="fill-height ma-0"
                      justify="center"
                    >
                      <v-progress-circular
                        color="grey-lighten-1"
                        indeterminate
                      />
                    </v-row>
                  </template>
                </v-img>
                <v-btn
                  class="position-absolute right-0 top-0"
                  color="error"
                  icon="mdi-close"
                  size="xs"
                  variant="outlined"
                  @click="removePicture(index)"
                />
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
                  $t(
                    'upload.desc.your_machine_design_is_under_review_please_wait_with_patience',
                  )
                }}
              </p>
              <p></p>
              <p>
                {{ $t('upload.desc.review_usually_takes_one_to_two_days') }}
              </p>
              <p>
                {{
                  $t(
                    'upload.desc.you_will_receive_an_email_notification_when_approved',
                  )
                }}
              </p>
            </div>
            <div class="mt-6">
              <p>
                {{
                  $t('upload.desc.please_contact_us_if_you_have_any_questions')
                }}
                <a class="router" href="mailto:info@redenmc.com"
                  >info@redenmc.com</a
                >
              </p>
            </div>
            <v-btn
              :href="localePath('/litematica')"
              :loading="goingBack"
              class="mt-6"
              color="primary"
              variant="outlined"
              @click="goingBack = true"
            >
              {{ $t('common.back') }}
            </v-btn>
          </v-card-text>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </v-card-text>
  <v-card-actions class="px-6">
    <v-btn
      :disabled="!availableSteps.includes('image')"
      :loading="uploading"
      class="text-none"
      color="primary"
      rounded="lg"
      variant="flat"
      @click="doUploadAll"
    >
      {{
        editMode
          ? $t('upload.btn.finish_editing')
          : $t('upload.btn.start_uploading')
      }}
    </v-btn>
  </v-card-actions>
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
</style>
