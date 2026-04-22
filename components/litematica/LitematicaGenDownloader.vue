<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Machine } from '~/pages/litematica/index.vue';
import SizeInput from '~/components/litematica/SizeInput.vue';
import type { VForm } from 'vuetify/components';
import type { SubmitEventPromise } from 'vuetify';

const props = defineProps<{
  selected: Machine;
}>();
const emits = defineEmits<{
  (e: 'download'): void;
}>();

const xSize = ref(0);
const ySize = ref(0);
const zSize = ref(0);
const loading = ref(false);
const showVerificationDialog = ref(false);
const { t } = useI18n();
const formRef = useTemplateRef<VForm>('formRef');

async function submit(e: SubmitEventPromise) {
  if ((await e).valid) {
    loading.value = true;
    try {
      window.open(
        `/api/mc-services/yisibite/${props.selected.key}?xSize=${xSize.value}&ySize=${ySize.value}&zSize=${zSize.value}`,
      );
      setTimeout(() => {
        loading.value = false;
        emits('download');
      }, 1000);
    } catch (error) {
      loading.value = false;
    }
  }
}

async function openMaterials() {
  formRef.value?.validate().then((result) => {
    if (result.valid) {
      loading.value = true;
      try {
        window.open(
          `/api/mc-services/yisibite/${props.selected.key}/materials?xSize=${xSize.value}&ySize=${ySize.value}&zSize=${zSize.value}`,
        );
        setTimeout(() => {
          loading.value = false;
          emits('download');
        }, 1000);
      } catch (error) {
        loading.value = false;
      }
    }
  });
}

const customPrompt = computed(() => {
  if (props.selected.key === 'sj-mid1') {
    const badEfficiency =
      20000 *
      Math.max(
        0,
        Math.floor((xSize.value - 13) / 3) * 2 +
          Math.floor((zSize.value - 16) / 3),
      );
    return `在实际情况中，由于物品流速不均匀，这个打包机预计可以打包 <span style="color: #66ccff">${badEfficiency / 1e4}</span> 万物品 / 小时，请以实际情况为准，建议留有冗余。`;
  } else if (props.selected.key === 'sj-sma') {
    return '最小值9时效率是3.2w/h，每加1效率就加0.8w';
  } else {
    return t('litematica_generator.size_description');
  }
});

defineExpose({ xSize, ySize, zSize, formRef });
</script>

<template>
  <v-form ref="formRef" @submit.prevent="submit">
    <v-row>
      <v-col>
        <v-card
          v-if="selected?.hasX || selected?.hasY || selected?.hasZ"
          border
        >
          <v-card-subtitle class="text-wrap pa-3" v-html="customPrompt">
          </v-card-subtitle>
          <v-card-text>
            <SizeInput
              v-if="selected.hasX"
              v-model="xSize"
              :def="selected"
              xyz="x"
            />
            <SizeInput
              v-if="selected.hasY"
              v-model="ySize"
              :def="selected"
              xyz="y"
            />
            <SizeInput
              v-if="selected.hasZ"
              v-model="zSize"
              :def="selected"
              xyz="z"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-spacer />
      <v-btn
        :loading="loading"
        class="ma-3 text-capitalize"
        color="primary"
        type="button"
        variant="outlined"
        @click="openMaterials"
      >
        {{ t('litematica_generator.material_list') }}
      </v-btn>
      <v-btn :loading="loading" class="ma-3" color="primary" type="submit">
        {{ t('litematica_generator.download') }}
      </v-btn>
    </v-row>

    <v-row>
      <v-col>
        <h3>FAQ</h3>
        <h4>17x17的空置域应该输入多少？</h4>
        <p>17x16=272，272的大小包含了两边各一格的铁砧墙宽度。</p>
      </v-col>
    </v-row>
  </v-form>
</template>
