<script lang="ts" setup>
import { computed, onMounted, ref, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  CannonResult,
  CannonTemplate,
} from '~/utils/pearl-cannon/core.mjs';
import { pearlMessages } from '~/utils/pearl-cannon/messages';
import { blockName } from '~/utils/pearl-cannon/block-names';
import PearlCannonPreview from './PearlCannonPreview.vue';
const emits = defineEmits<{ (e: 'download'): void }>();
const { t, locale } = useI18n();
const copy = computed(() => pearlMessages[locale.value] ?? pearlMessages.en);
const x = ref('100'),
  z = ref('422'),
  dataVersion = ref('4556');
const accepted = ref(false),
  busy = ref(false),
  materialsOpen = ref(false);
const startupError = ref(''),
  actionError = ref(''),
  success = ref('');
const engine = shallowRef<typeof import('~/utils/pearl-cannon/core.mjs')>();
const template = shallowRef<CannonTemplate>();
const source = `${useRuntimeConfig().app.baseURL.replace(/\/$/, '')}/generators/pearl-cannon-v9.html`;
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
  <div data-testid="pearl-native-form">
    <v-row
      ><v-col>
        <v-card border>
          <v-card-subtitle class="text-wrap pa-3">{{
            copy.intro
          }}</v-card-subtitle>
          <v-card-text>
            <v-row align="center">
              <v-col cols="5" class="text-body-1"
                ><label for="pearl-x">{{ copy.x }}</label></v-col
              >
              <v-col cols="7"
                ><v-text-field
                  id="pearl-x"
                  v-model="x"
                  @keydown.enter.stop.prevent="download"
                  :aria-label="copy.x"
                  :disabled="busy"
                  :suffix="copy.unit"
                  :hint="copy.xHint"
                  persistent-hint
                  density="compact"
                  variant="underlined"
                  type="text"
                  inputmode="decimal"
              /></v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="5" class="text-body-1"
                ><label for="pearl-z">{{ copy.z }}</label></v-col
              >
              <v-col cols="7"
                ><v-text-field
                  id="pearl-z"
                  v-model="z"
                  @keydown.enter.stop.prevent="download"
                  :aria-label="copy.z"
                  :disabled="busy"
                  :suffix="copy.unit"
                  :hint="copy.zHint"
                  persistent-hint
                  density="compact"
                  variant="underlined"
                  type="text"
                  inputmode="decimal"
              /></v-col>
            </v-row>
            <div
              v-if="plan"
              class="text-body-2 mt-4"
              aria-live="polite"
              data-testid="pearl-summary"
            >
              <div>
                {{ copy.nominal }}: X {{ plan.predicted.textX }} / Z
                {{ plan.predicted.textZ }} {{ copy.unit }}
              </div>
              <div>
                {{ copy.payload }}: X {{ Math.abs(plan.counts.x) }} / Z
                {{ Math.abs(plan.counts.z) }}
              </div>
              <div>
                {{ copy.total }}:
                <strong>{{ plan.counts.structureTotal }}</strong> ({{
                  copy.boost
                }}
                {{ plan.counts.propulsion }})
              </div>
            </div>
            <p class="text-caption text-medium-emphasis mt-3">
              {{ copy.limits }}
            </p>
            <div v-if="!template && !startupError" role="status" class="mt-3">
              <v-progress-circular indeterminate size="18" class="mr-2" />{{
                copy.loading
              }}
            </div>
            <v-alert
              v-if="startupError"
              type="error"
              variant="tonal"
              class="mt-3"
              >{{ startupError
              }}<v-btn variant="text" @click="load">{{
                copy.retry
              }}</v-btn></v-alert
            >
            <v-alert
              v-if="generated.error || actionError"
              type="error"
              variant="tonal"
              class="mt-3"
              density="compact"
              role="alert"
              >{{ actionError || generated.error }}</v-alert
            >
            <v-alert
              v-if="plan?.knownRuntimeIssue"
              type="error"
              variant="tonal"
              class="mt-3"
              density="compact"
              role="alert"
              >{{ copy.damage }}</v-alert
            >
            <v-checkbox
              v-if="plan?.needsExperimentalConsent"
              v-model="accepted"
              data-testid="pearl-consent"
              :disabled="busy"
              :label="
                plan.knownRuntimeIssue ? copy.damageConsent : copy.consent
              "
              density="compact"
              hide-details
            />
            <p class="text-caption text-medium-emphasis mt-3">
              {{ copy.caution }}
            </p>
          </v-card-text>
        </v-card>
      </v-col></v-row
    >
    <v-row
      ><v-spacer />
      <v-btn
        class="ma-3 text-capitalize"
        color="primary"
        type="button"
        variant="outlined"
        :disabled="!result || busy"
        @click="materialsOpen = true"
        >{{ t('litematica_generator.material_list') }}</v-btn
      >
      <v-btn
        data-testid="pearl-download"
        class="ma-3"
        color="primary"
        type="button"
        @click="download"
        :loading="busy"
        :disabled="!canExport"
        >{{ t('litematica_generator.download') }}</v-btn
      >
    </v-row>
    <p v-if="success" role="status" class="text-body-2 text-success">
      {{ success }}
    </p>
    <v-expansion-panels class="mt-4">
      <v-expansion-panel :title="copy.advanced" data-testid="pearl-advanced"
        ><v-expansion-panel-text>
          <v-btn
            size="small"
            variant="text"
            type="button"
            :disabled="busy"
            @click="preset([z, x])"
            >{{ copy.swap }}</v-btn
          >
          <div class="d-flex flex-wrap ga-1 my-3">
            <v-btn
              v-for="values in presets"
              :key="values.join(',')"
              size="small"
              variant="outlined"
              type="button"
              :disabled="busy"
              @click="preset(values)"
              >{{ values.join(' / ') }}</v-btn
            >
          </div>
          <div v-if="plan" class="text-body-2 mb-3">
            {{ copy.orientation }}: {{ orientation }}<br />{{ copy.removed }}:
            {{ removed }}<br />{{ plan.structure.bounds.size.join(' × ')
            }}<br />{{ copy.correction }}
          </div>
          <PearlCannonPreview v-if="result" :result="result" />
          <v-table v-if="result" density="compact" class="my-3"
            ><thead>
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
          <v-text-field
            v-model="dataVersion"
            data-testid="pearl-version"
            :label="copy.version"
            :hint="copy.versionHint"
            persistent-hint
            :error-messages="versionValid ? [] : [copy.versionError]"
            :disabled="busy"
            density="compact"
            variant="underlined"
          />
          <div class="d-flex flex-wrap ga-2 my-3">
            <v-btn
              size="small"
              type="button"
              variant="outlined"
              :disabled="!result"
              @click="exportReport"
              >{{ copy.report }}</v-btn
            >
            <v-btn
              size="small"
              type="button"
              variant="outlined"
              :disabled="!template"
              @click="original"
              >{{ copy.original }}</v-btn
            >
          </div>
          <a
            :href="source"
            target="_blank"
            rel="noopener noreferrer"
            class="text-caption"
            >{{ copy.standalone }}</a
          >
        </v-expansion-panel-text></v-expansion-panel
      >
    </v-expansion-panels>
    <v-dialog v-model="materialsOpen" max-width="800" scrollable
      ><v-card>
        <v-card-title>{{ copy.materials }}</v-card-title>
        <v-card-text
          ><v-table density="compact"
            ><thead>
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
                <td class="text-caption">{{ id }}</td>
              </tr>
            </tbody></v-table
          ></v-card-text
        >
        <v-card-actions
          ><v-btn variant="outlined" type="button" @click="exportCSV">{{
            copy.csv
          }}</v-btn
          ><v-spacer /><v-btn type="button" @click="materialsOpen = false">{{
            copy.close
          }}</v-btn></v-card-actions
        >
      </v-card></v-dialog
    >
  </div>
</template>
