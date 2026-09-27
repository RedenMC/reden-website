<script lang="ts" setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  CannonResult,
  CannonTemplate,
} from '~/utils/pearl-cannon/core.mjs';
import { pearlMessages } from '~/utils/pearl-cannon/messages';
import { blockName } from '~/utils/pearl-cannon/block-names';
import PearlCannonPreview from './PearlCannonPreview.vue';
const emits = defineEmits<{ (e: 'download'): void }>();
const { locale } = useI18n();
const copy = computed(() => pearlMessages[locale.value] ?? pearlMessages.en);
const x = ref('100'),
  z = ref('422'),
  dataVersion = ref('4556');
const accepted = ref(false),
  busy = ref(false),
  openPanels = ref(['allocation']);
const startupError = ref(''),
  actionError = ref(''),
  success = ref('');
const engine = shallowRef<typeof import('~/utils/pearl-cannon/core.mjs')>();
const template = shallowRef<CannonTemplate>();
const assetBase = useRuntimeConfig().app.baseURL.replace(/\/$/, '');
const mascotImage = `${assetBase}/generators/pearl-cannon-yueyue.png`;
const mascotButton = ref<HTMLButtonElement | null>(null);
const greeting = ref('');
const greetingVisible = ref(false);
let greetingTimer: ReturnType<typeof setTimeout> | undefined;
function sayHello() {
  clearTimeout(greetingTimer);
  const button = mascotButton.value;
  button?.classList.remove('is-greeting');
  if (button) void button.offsetWidth;
  button?.classList.add('is-greeting');
  greeting.value = '你好呀！';
  greetingVisible.value = true;
  greetingTimer = setTimeout(() => {
    button?.classList.remove('is-greeting');
    greetingVisible.value = false;
    greeting.value = '';
  }, 1600);
}
onUnmounted(() => {
  clearTimeout(greetingTimer);
  mascotButton.value?.classList.remove('is-greeting');
});
async function load() {
  startupError.value = '';
  try {
    const module = await import('~/utils/pearl-cannon/core.mjs');
    const loaded = await module.loadBundledTemplate();
    engine.value = module;
    template.value = loaded;
  } catch (error) {
    startupError.value = error instanceof Error ? error.message : String(error);
  }
}
onMounted(load);
watch([x, z, dataVersion], () => {
  accepted.value = false;
  actionError.value = '';
  success.value = '';
});
const generated = computed<{ result?: CannonResult; error?: string }>(() => {
  if (!engine.value || !template.value) return {};
  try {
    return {
      result: engine.value.buildCannon(template.value, x.value, z.value),
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
});
const result = computed(() => generated.value.result);
const plan = computed(() => result.value?.plan);
const versionValid = computed(
  () =>
    /^\d+$/.test(dataVersion.value.trim()) &&
    Number(dataVersion.value) > 0 &&
    Number(dataVersion.value) <= 2147483647,
);
const canExport = computed(
  () =>
    !!result.value &&
    versionValid.value &&
    !busy.value &&
    (!plan.value?.needsExperimentalConsent || accepted.value),
);
const materials = computed(() =>
  Object.entries(result.value?.materials ?? {}).sort((a, b) => b[1] - a[1]),
);
const removed = computed(
  () =>
    (plan.value?.zeroAxisRemoval?.removedBlocks ?? 0) +
    (plan.value?.emptyRowRemoval?.removedBlocks ?? 0),
);
const orientation = computed(
  () =>
    `${plan.value?.degrees ?? 0}°${plan.value?.mirrorZ ? ' + ' + copy.value.mirror : ''}`,
);
const formatError = (value: number | undefined) =>
  new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 6 }).format(
    Object.is(value, -0) ? 0 : value ?? 0,
  );
const allocation = computed(() => {
  const p = plan.value;
  if (!p || !engine.value || !result.value) return [];
  return (['south', 'east'] as const).flatMap((wing) => {
    let [a, b] = engine.value!.rotateVector(
      wing === 'east' ? 1 : 0,
      wing === 'south' ? 1 : 0,
      p.quarterTurns,
    );
    if (p.mirrorZ) b = -b;
    const axis = a ? (a > 0 ? '+X' : '-X') : b > 0 ? '+Z' : '-Z';
    const bank = p.banks[wing];
    if (bank.omitted)
      return [
        { label: axis, count: 0, rows: copy.value.omitted, glass: 0, boost: 0 },
      ];
    return bank.arrays.map((array) => {
      const rows = result.value!.rows.filter(
        (r) =>
          r.wing === wing &&
          (r.arrayIndex || 1) === array.index &&
          r.role === 'pearl',
      );
      return {
        label: `${axis} / ${array.index}`,
        count: array.tnt,
        rows: rows.map((r) => r.kept).join(' / '),
        glass: rows.reduce((n, r) => n + r.replaced, 0),
        boost: 10,
      };
    });
  });
});
function save(
  bytes: Uint8Array | string,
  name: string,
  mime = 'application/octet-stream',
) {
  const content =
    typeof bytes === 'string' ? bytes : new Uint8Array(bytes).buffer;
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
async function download() {
  if (!canExport.value || !result.value || !engine.value) return;
  const snapshot = result.value;
  busy.value = true;
  actionError.value = '';
  success.value = '';
  try {
    const bytes = await engine.value.exportLitematic(snapshot, {
      allowExperimentalRotation: accepted.value,
      dataVersion: Number(dataVersion.value),
    });
    save(bytes, engine.value.suggestedFilename(snapshot.plan));
    success.value = copy.value.saved;
    emits('download');
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : String(error);
  } finally {
    busy.value = false;
  }
}
function exportReport() {
  if (result.value)
    save(
      JSON.stringify(
        {
          plan: result.value.plan,
          rows: result.value.rows,
          materials: result.value.materials,
        },
        null,
        2,
      ),
      'pearl-cannon-parameters.json',
      'application/json',
    );
}
function exportCSV() {
  const rows = [
    [copy.value.block, copy.value.count, 'ID'],
    ...materials.value.map(([id, n]) => [blockName(id, locale.value), n, id]),
  ];
  save(
    '\uFEFF' +
      rows
        .map((row) =>
          row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(','),
        )
        .join('\r\n'),
    'pearl-cannon-materials.csv',
    'text/csv;charset=utf-8',
  );
}
function original() {
  if (template.value)
    save(template.value.originalBytes, 'pearl-cannon-original.litematic');
}
function openMaterials() {
  if (!openPanels.value.includes('materials'))
    openPanels.value = [...openPanels.value, 'materials'];
  nextTick(() =>
    document
      .getElementById('pearl-materials')
      ?.scrollIntoView({ block: 'nearest' }),
  );
}
const metrics = computed(() => [
  {
    label: `X ${copy.value.payload}`,
    value: Math.abs(plan.value?.counts.x ?? 0),
    detail: `${plan.value?.predicted.textX ?? '0.0'} ${copy.value.unit} · ${copy.value.errorDelta} ${formatError(plan.value?.error.x)}`,
  },
  {
    label: `Z ${copy.value.payload}`,
    value: Math.abs(plan.value?.counts.z ?? 0),
    detail: `${plan.value?.predicted.textZ ?? '0.0'} ${copy.value.unit} · ${copy.value.errorDelta} ${formatError(plan.value?.error.z)}`,
  },
  {
    label: copy.value.total,
    value: plan.value?.counts.structureTotal ?? 0,
    detail: `${copy.value.boost} ${plan.value?.counts.propulsion ?? 0} · ${copy.value.boostExcluded}`,
  },
]);
const presets = [
  ['100', '422'],
  ['-100', '422'],
  ['6752', '6752'],
  ['13504', '13504'],
  ['6773.1', '422'],
  ['0', '-422'],
];
function preset(values: string[]) {
  [x.value, z.value] = values;
}
</script>
<template>
  <section data-testid="pearl-native-form">
    <div class="d-flex align-center justify-space-between ga-4 mb-4">
      <div>
        <h2 class="text-h5 mb-1">{{ copy.toolTitle }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">{{ copy.intro }}</p>
        <p class="text-caption text-medium-emphasis mb-0">
          {{ copy.offline }} · {{ copy.axisLimit }} 13,504 {{ copy.unit }}
        </p>
      </div>
      <div class="yueyue">
        <span
          class="yueyue-greeting"
          :class="{ 'is-visible': greetingVisible }"
          role="status"
          aria-live="polite"
          >{{ greeting }}</span
        >
        <button
          id="yueyueButton"
          ref="mascotButton"
          type="button"
          aria-label="和月月打招呼"
          title="点一下，和月月打招呼"
          @click="sayHello"
        >
          <img
            :src="mascotImage"
            alt="长粉发、红眼、金色弦月发饰的 Q 版月月"
            width="104"
            height="112"
            draggable="false"
          />
        </button>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="5" lg="4">
        <v-card border>
          <v-card-title class="d-flex align-center justify-space-between">
            {{ copy.target }}
            <v-btn
              size="small"
              variant="text"
              :disabled="busy"
              @click="preset([z, x])"
              >{{ copy.swap }}</v-btn
            >
          </v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="6"
                ><v-text-field
                  id="pearl-x"
                  v-model="x"
                  :label="copy.x"
                  :hint="copy.xHint"
                  persistent-hint
                  inputmode="decimal"
                  autocomplete="off"
                  maxlength="80"
                  :disabled="busy"
                  @keydown.enter.stop.prevent="download"
              /></v-col>
              <v-col cols="12" sm="6"
                ><v-text-field
                  id="pearl-z"
                  v-model="z"
                  :label="copy.z"
                  :hint="copy.zHint"
                  persistent-hint
                  inputmode="decimal"
                  autocomplete="off"
                  maxlength="80"
                  :disabled="busy"
                  @keydown.enter.stop.prevent="download"
              /></v-col>
            </v-row>
            <div class="d-flex flex-wrap ga-2 my-3" :aria-label="copy.presets">
              <v-chip
                v-for="values in presets"
                :key="values.join(',')"
                size="small"
                :disabled="busy"
                @click="preset(values)"
                >{{ values.join(' / ') }}</v-chip
              >
            </div>
            <p v-if="!template && !startupError" role="status">
              {{ copy.loading }}
            </p>
            <p v-if="startupError" role="alert" class="text-error">
              {{ startupError }}
              <v-btn size="small" variant="text" @click="load">{{
                copy.retry
              }}</v-btn>
            </p>
            <p
              v-if="generated.error || actionError"
              role="alert"
              class="text-error"
            >
              {{ actionError || generated.error }}
            </p>
            <p v-if="plan?.knownRuntimeIssue" role="alert" class="text-error">
              {{
                locale === 'zh_cn'
                  ? plan.knownRuntimeIssue.message
                  : copy.damage
              }}
            </p>
            <p v-if="plan?.farArraySupport" role="status" class="text-warning">
              {{ copy.farSupportWarning }}
            </p>
            <v-checkbox
              v-if="plan?.needsExperimentalConsent"
              v-model="accepted"
              data-testid="pearl-consent"
              :label="
                plan.knownRuntimeIssue ? copy.damageConsent : copy.consent
              "
              :disabled="busy"
              hide-details
              class="mb-3"
            />
            <v-btn
              color="primary"
              block
              data-testid="pearl-download"
              :disabled="!canExport"
              :loading="busy"
              @click="download"
              >{{ copy.downloadNow }}</v-btn
            >
            <div class="d-flex flex-wrap ga-2 mt-3">
              <v-btn
                variant="outlined"
                size="small"
                :disabled="!result"
                @click="exportReport"
                >{{ copy.report }}</v-btn
              >
              <v-btn
                variant="outlined"
                size="small"
                :disabled="!result"
                @click="openMaterials"
                >{{ copy.materials }}</v-btn
              >
            </div>
            <p v-if="success" role="status" class="mt-3 mb-0">{{ success }}</p>
            <p class="text-caption text-medium-emphasis mt-4 mb-0">
              {{ copy.caution }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="7" lg="8">
        <v-row dense data-testid="pearl-summary" aria-live="polite">
          <v-col v-for="metric in metrics" :key="metric.label" cols="12" sm="4">
            <v-sheet border rounded class="pa-3 h-100">
              <div class="text-caption text-medium-emphasis">
                {{ metric.label }}
              </div>
              <div class="text-h6">{{ metric.value }}</div>
              <div class="text-caption">{{ metric.detail }}</div>
            </v-sheet>
          </v-col>
        </v-row>
        <v-card border class="mt-3">
          <v-card-title>{{ copy.preview }}</v-card-title>
          <PearlCannonPreview v-if="result" :result="result" />
          <v-card-text v-else>{{
            generated.error || startupError || copy.previewEmpty
          }}</v-card-text>
          <v-card-subtitle v-if="plan" class="text-wrap pb-3"
            >{{ plan.structure.bounds.size.join(' × ') }} ·
            {{ plan.structure.nonAir }} {{ copy.block }} · {{ removed }}
            {{ copy.removed }} · {{ orientation }}</v-card-subtitle
          >
        </v-card>
      </v-col>
    </v-row>

    <v-expansion-panels v-model="openPanels" multiple class="mt-4">
      <v-expansion-panel value="allocation" :title="copy.allocation">
        <v-expansion-panel-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>{{ copy.wing }}</th>
                <th>{{ copy.payload }}</th>
                <th>{{ copy.rows }}</th>
                <th>{{ copy.glass }}</th>
                <th>{{ copy.boost }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in allocation" :key="row.label">
                <td>{{ row.label }}</td>
                <td>{{ row.count }}</td>
                <td>{{ row.rows }}</td>
                <td>{{ row.glass }}</td>
                <td>{{ row.boost }}</td>
              </tr>
            </tbody>
          </v-table>
          <p class="text-caption mb-0">{{ copy.allocationNotes }}</p>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel
        id="pearl-materials"
        value="materials"
        :title="copy.materials"
      >
        <v-expansion-panel-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>{{ copy.block }}</th>
                <th>{{ copy.count }}</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="[id, n] in materials" :key="id">
                <td>{{ blockName(id, locale) }}</td>
                <td>{{ n }}</td>
                <td>{{ id }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-btn
            class="mt-3"
            variant="outlined"
            size="small"
            :disabled="!result"
            @click="exportCSV"
            >{{ copy.csv }}</v-btn
          >
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel
        value="advanced"
        data-testid="pearl-advanced"
        :title="copy.advanced"
      >
        <v-expansion-panel-text>
          <p v-if="template" class="text-body-2">
            {{ copy.templateLoaded }} {{ template.author }} · DataVersion
            {{ template.sourceDataVersion }}
          </p>
          <v-text-field
            id="pearl-version"
            v-model="dataVersion"
            data-testid="pearl-version"
            :label="copy.version"
            :hint="copy.versionHint"
            persistent-hint
            inputmode="numeric"
            :error-messages="versionValid ? [] : [copy.versionError]"
            :disabled="busy"
          />
          <div class="d-flex flex-wrap ga-2 mt-3">
            <v-btn
              variant="outlined"
              size="small"
              :disabled="!template"
              @click="original"
              >{{ copy.original }}</v-btn
            >
          </div>
          <p class="text-body-2 mt-4">
            {{ copy.limits }} {{ copy.roundingNotes }}
          </p>
          <p class="text-body-2 mb-0">{{ copy.correction }}</p>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </section>
</template>
<style scoped>
.yueyue {
  position: relative;
  flex: 0 0 104px;
}
#yueyueButton {
  display: block;
  width: 104px;
  height: 112px;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  touch-action: manipulation;
  transform-origin: 50% 95%;
}
#yueyueButton img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}
.yueyue-greeting {
  position: absolute;
  right: 90px;
  top: 22px;
  white-space: nowrap;
  background: #fff7fa;
  color: #6c334b;
  border: 1px solid #deb8c8;
  border-radius: 12px 12px 2px 12px;
  padding: 5px 10px;
  font-size: 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
}
.yueyue-greeting.is-visible {
  opacity: 1;
}
#yueyueButton.is-greeting {
  animation: yueyue-hop 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes yueyue-hop {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }
  20% {
    transform: translateY(2px) scale(1.03, 0.96);
  }
  45% {
    transform: translateY(-10px) rotate(-7deg);
  }
  70% {
    transform: translateY(-3px) rotate(5deg);
  }
  85% {
    transform: translateY(0) scale(1.02, 0.98);
  }
}
@media (prefers-reduced-motion: reduce) {
  #yueyueButton.is-greeting {
    animation: none;
  }
  .yueyue-greeting {
    transition: none;
  }
}
</style>
