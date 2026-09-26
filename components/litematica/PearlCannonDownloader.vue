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
  materialsOpen = ref(false);
const startupError = ref(''),
  actionError = ref(''),
  success = ref('');
const engine = shallowRef<typeof import('~/utils/pearl-cannon/core.mjs')>();
const template = shallowRef<CannonTemplate>();
const assetBase = useRuntimeConfig().app.baseURL.replace(/\/$/, '');
const source = `${assetBase}/generators/pearl-cannon-v9.2.html`;
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
  materialsOpen.value = true;
  nextTick(() =>
    document
      .getElementById('pearl-materials')
      ?.scrollIntoView({ block: 'nearest' }),
  );
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
  <section class="pearl-tool" data-testid="pearl-native-form">
    <header class="brand">
      <div class="brandleft">
        <div class="logo" aria-hidden="true">TNT</div>
        <h2>{{ copy.toolTitle }}</h2>
      </div>
      <div class="badges">
        <span class="badge live">{{ copy.offline }}</span
        ><span class="badge">v9.2 · Java</span>
      </div>
      <div class="yueyue">
        <span
          id="yueyueGreeting"
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
            width="112"
            height="120"
            draggable="false"
          />
        </button>
      </div>
    </header>

    <div class="heading">
      <div>
        <h3>{{ copy.hero }}</h3>
        <p>{{ copy.intro }}</p>
      </div>
      <div class="limit">
        {{ copy.axisLimit }}<strong>13,504 {{ copy.unit }}</strong>
      </div>
    </div>

    <div class="main">
      <aside class="card" :aria-label="copy.target">
        <div class="card-head">
          <h3>{{ copy.target }}</h3>
          <button
            class="small-button"
            type="button"
            :disabled="busy"
            @click="preset([z, x])"
          >
            {{ copy.swap }}
          </button>
        </div>
        <div class="card-body">
          <div class="field-grid">
            <div class="field">
              <label for="pearl-x">{{ copy.x }}</label>
              <div class="input-wrap">
                <input
                  id="pearl-x"
                  v-model="x"
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  spellcheck="false"
                  maxlength="80"
                  :disabled="busy"
                  :aria-label="copy.x"
                  aria-describedby="pearl-x-help"
                  @keydown.enter.stop.prevent="download"
                /><span class="unit">{{ copy.unit }}</span>
              </div>
              <span id="pearl-x-help" class="help">{{ copy.xHint }}</span>
            </div>
            <div class="field">
              <label for="pearl-z">{{ copy.z }}</label>
              <div class="input-wrap">
                <input
                  id="pearl-z"
                  v-model="z"
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  spellcheck="false"
                  maxlength="80"
                  :disabled="busy"
                  :aria-label="copy.z"
                  aria-describedby="pearl-z-help"
                  @keydown.enter.stop.prevent="download"
                /><span class="unit">{{ copy.unit }}</span>
              </div>
              <span id="pearl-z-help" class="help">{{ copy.zHint }}</span>
            </div>
          </div>
          <div class="presets" :aria-label="copy.presets">
            <button
              v-for="values in presets"
              :key="values.join(',')"
              class="chip"
              type="button"
              :disabled="busy"
              @click="preset(values)"
            >
              {{ values.join(' / ') }}
            </button>
          </div>
          <div v-if="!template && !startupError" class="notice" role="status">
            {{ copy.loading }}
          </div>
          <div v-if="startupError" class="error" role="alert">
            {{ startupError }}
            <button type="button" @click="load">{{ copy.retry }}</button>
          </div>
          <div v-if="generated.error || actionError" class="error" role="alert">
            {{ actionError || generated.error }}
          </div>
          <div v-if="plan?.knownRuntimeIssue" class="error" role="alert">
            {{
              locale === 'zh_cn' ? plan.knownRuntimeIssue.message : copy.damage
            }}
          </div>
          <div v-if="plan?.farArraySupport" class="notice" role="status">
            {{ copy.farSupportWarning }}
          </div>
          <label v-if="plan?.needsExperimentalConsent" class="consent">
            <input
              v-model="accepted"
              data-testid="pearl-consent"
              type="checkbox"
              :disabled="busy"
            />
            <span>{{
              plan.knownRuntimeIssue ? copy.damageConsent : copy.consent
            }}</span>
          </label>
          <button
            class="primary"
            data-testid="pearl-download"
            type="button"
            :disabled="!canExport"
            @click="download"
          >
            {{ busy ? copy.exporting : copy.downloadNow }}
          </button>
          <div class="secondary-row">
            <button
              class="secondary"
              type="button"
              :disabled="!result"
              @click="exportReport"
            >
              {{ copy.report }}
            </button>
            <button
              class="secondary"
              type="button"
              :disabled="!result"
              @click="openMaterials"
            >
              {{ copy.materials }}
            </button>
          </div>
          <div v-if="success" class="download-status" role="status">
            {{ success }}
          </div>
          <details class="parameter-notes">
            <summary>{{ copy.savingNotes }}</summary>
            <p>{{ copy.limits }}</p>
            <p>{{ copy.roundingNotes }}</p>
          </details>
          <details class="parameter-notes">
            <summary>{{ copy.orientationNotes }}</summary>
            <p>{{ copy.correction }}</p>
          </details>
          <p class="fine-print">{{ copy.caution }}</p>
        </div>
      </aside>

      <div class="rightcol">
        <div class="metrics-bar" data-testid="pearl-summary" aria-live="polite">
          <div class="metric">
            <span class="metric-label">X {{ copy.payload }}</span
            ><strong>{{ plan ? Math.abs(plan.counts.x) : 0 }}</strong
            ><span>{{ plan?.predicted.textX ?? '0.0' }} {{ copy.unit }}</span
            ><small
              >{{ copy.errorDelta }} {{ formatError(plan?.error.x) }}
              {{ copy.unit }}</small
            >
          </div>
          <div class="metric">
            <span class="metric-label">Z {{ copy.payload }}</span
            ><strong>{{ plan ? Math.abs(plan.counts.z) : 0 }}</strong
            ><span>{{ plan?.predicted.textZ ?? '0.0' }} {{ copy.unit }}</span
            ><small
              >{{ copy.errorDelta }} {{ formatError(plan?.error.z) }}
              {{ copy.unit }}</small
            >
          </div>
          <div class="metric">
            <span class="metric-label">{{ copy.total }}</span
            ><strong>{{ plan?.counts.structureTotal ?? 0 }}</strong
            ><span>{{ copy.boost }} {{ plan?.counts.propulsion ?? 0 }}</span
            ><small>{{ copy.boostExcluded }}</small>
          </div>
        </div>
        <section class="card preview-card">
          <div class="card-head">
            <h3>{{ copy.preview }}</h3>
            <span class="status">{{
              result ? copy.previewReady : copy.loading
            }}</span>
          </div>
          <PearlCannonPreview v-if="result" :result="result" />
          <div v-else class="preview-empty">
            {{ generated.error || startupError || copy.previewEmpty }}
          </div>
          <div v-if="plan" class="checks">
            <div>
              <strong>{{ plan.structure.bounds.size.join(' × ') }}</strong
              ><span>{{ copy.bounds }}</span>
            </div>
            <div>
              <strong>{{ plan.structure.nonAir }} {{ copy.block }}</strong
              ><span>{{ copy.correction }}</span>
            </div>
            <div>
              <strong>{{ removed }} {{ copy.block }}</strong
              ><span>{{ copy.removed }}</span>
            </div>
            <div>
              <strong>{{ orientation }}</strong
              ><span>{{ copy.orientation }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <details class="card wide" open>
      <summary>
        {{ copy.allocation
        }}<span class="toggle-label"
          ><span class="when-closed">{{ copy.expand }}</span
          ><span class="when-open">{{ copy.collapse }}</span></span
        >
      </summary>
      <div class="card-body scroll">
        <table>
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
        </table>
        <p class="detail-note">{{ copy.allocationNotes }}</p>
      </div>
    </details>

    <div class="two-detail">
      <details
        id="pearl-materials"
        class="card wide"
        :open="materialsOpen"
        @toggle="materialsOpen = ($event.target as HTMLDetailsElement).open"
      >
        <summary>
          {{ copy.materials
          }}<span class="toggle-label"
            ><span class="when-closed">{{ copy.expand }}</span
            ><span class="when-open">{{ copy.collapse }}</span></span
          >
        </summary>
        <div class="card-body material-table">
          <table>
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
          </table>
          <button
            class="secondary"
            type="button"
            :disabled="!result"
            @click="exportCSV"
          >
            {{ copy.csv }}
          </button>
        </div>
      </details>
      <details class="card wide" data-testid="pearl-advanced">
        <summary>
          {{ copy.advanced
          }}<span class="toggle-label"
            ><span class="when-closed">{{ copy.expand }}</span
            ><span class="when-open">{{ copy.collapse }}</span></span
          >
        </summary>
        <div class="card-body">
          <p v-if="template" class="muted">
            {{ copy.templateLoaded }} {{ template.author }} · DataVersion
            {{ template.sourceDataVersion }}
          </p>
          <label class="version-label" for="pearl-version">{{
            copy.version
          }}</label>
          <input
            id="pearl-version"
            v-model="dataVersion"
            data-testid="pearl-version"
            type="text"
            inputmode="numeric"
            :disabled="busy"
          />
          <p class="muted">{{ copy.versionHint }}</p>
          <p v-if="!versionValid" class="error" role="alert">
            {{ copy.versionError }}
          </p>
          <div class="source-actions">
            <button
              class="small-button"
              type="button"
              :disabled="!template"
              @click="original"
            >
              {{ copy.original }}</button
            ><a :href="source" target="_blank" rel="noopener noreferrer">{{
              copy.standalone
            }}</a>
          </div>
        </div>
      </details>
    </div>
  </section>
</template>
<style scoped>
.pearl-tool {
  --bg: #f1f3ee;
  --panel: #fff;
  --panel2: #e9eee6;
  --line: #d5dcd2;
  --text: #26352b;
  --muted: #5f6d62;
  --green: #32623c;
  background: var(--bg);
  color: var(--text);
  font-family: 'Microsoft YaHei UI', 'Microsoft YaHei', 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  padding: 0 28px 32px;
  border-radius: 6px;
}
.pearl-tool * {
  box-sizing: border-box;
}
.pearl-tool button,
.pearl-tool input {
  font: inherit;
}
.pearl-tool button {
  cursor: pointer;
  border: 1px solid #b7c3b2;
  background: #fff;
  color: var(--text);
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: 600;
  transition:
    background-color 0.15s,
    border-color 0.15s;
}
.pearl-tool button:hover:not(:disabled) {
  background: #edf3e8;
  border-color: #8ea487;
}
.pearl-tool button:disabled {
  cursor: not-allowed;
  opacity: 0.46;
}
.pearl-tool :focus-visible {
  outline: 2px solid #43824d;
  outline-offset: 3px;
}
.pearl-tool a {
  color: var(--green);
  text-underline-offset: 3px;
}
.pearl-tool ::selection {
  background: #cce2bc;
  color: #223629;
}
.brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 64px;
  border-bottom: 1px solid var(--line);
}
.brandleft {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.brand h2 {
  font-size: 19px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.02em;
}
.logo {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: none;
  background: #396540;
  color: #edf5eb;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.badges {
  display: flex;
  gap: 16px;
  align-items: center;
}
.badge {
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
}
.badge.live {
  color: var(--green);
}
.heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 0 16px;
  padding: 23px 0 0;
}
.heading h3 {
  margin: 0 0 4px;
  font-size: 23px;
  font-weight: 650;
  line-height: 1.4;
}
.heading p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  max-width: 76ch;
}
.limit {
  color: var(--muted);
  white-space: nowrap;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.limit strong {
  color: var(--green);
  font-size: 18px;
  margin-left: 6px;
}
.main {
  display: grid;
  grid-template-columns: 344px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}
.main > *,
.rightcol {
  min-width: 0;
}
.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
}
.card-head {
  padding: 12px 18px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.card-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
}
.card-body {
  padding: 16px 18px;
}
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.field {
  min-width: 0;
}
.field label,
.version-label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 13px;
}
.input-wrap {
  position: relative;
}
.pearl-tool input[type='text'] {
  width: 100%;
  padding: 9px 29px 9px 10px;
  background: #fff;
  color: var(--text);
  border: 1px solid #b5c0b2;
  border-radius: 4px;
  min-height: 40px;
  min-width: 0;
  caret-color: var(--green);
}
.input-wrap input {
  font-size: 20px !important;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
}
.pearl-tool input:hover {
  border-color: #7d937b;
}
.pearl-tool input:focus {
  border-color: var(--green);
}
.unit {
  position: absolute;
  right: 10px;
  top: 12px;
  color: var(--muted);
  font-size: 12px;
  pointer-events: none;
}
.help {
  display: block;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
  margin-top: 6px;
}
.small-button {
  font-size: 12px !important;
  padding: 5px 8px !important;
  white-space: nowrap;
}
.presets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 16px 0;
}
.chip {
  font-size: 11px !important;
  padding: 5px 7px !important;
  font-weight: 400 !important;
  background: #f6f8f2 !important;
  line-height: 1.5;
}
.primary {
  background: var(--green) !important;
  border-color: var(--green) !important;
  color: #fff !important;
  width: 100%;
  min-height: 46px;
  font-size: 14px !important;
  line-height: 1.5;
}
.primary:hover:not(:disabled) {
  background: #244e2d !important;
  border-color: #244e2d !important;
}
.secondary-row {
  display: flex;
  gap: 8px;
  margin-top: 9px;
  flex-wrap: wrap;
}
.secondary {
  flex: 1;
  font-size: 12px !important;
  min-height: 40px;
  padding: 7px 8px !important;
}
.download-status {
  font-size: 12px;
  color: var(--green);
  line-height: 1.65;
  min-height: 22px;
  margin-top: 8px;
  overflow-wrap: anywhere;
}
.notice,
.error,
.consent {
  font-size: 12px;
  line-height: 1.75;
  padding: 11px 12px;
  border-radius: 4px;
  margin: 12px 0;
}
.notice {
  background: #f1f4ed;
  color: #4d6051;
  border: 1px solid #d7e0d0;
}
.error {
  background: #fff0eb;
  color: #9a302d;
  border: 1px solid #e1b7af;
  overflow-wrap: anywhere;
}
.consent {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: #faf4e5;
  color: #79531a;
  border: 1px solid #e5d6af;
  cursor: pointer;
}
.consent input {
  flex: none;
  margin: 5px 0 0;
  accent-color: var(--green);
}
.fine-print {
  font-size: 12px;
  line-height: 1.75;
  color: var(--muted);
  margin: 8px 0 0;
}
.parameter-notes {
  margin-top: 12px;
  border-top: 1px solid var(--line);
  padding-top: 7px;
}
.parameter-notes summary {
  font-size: 12px;
  color: #435d46;
  cursor: pointer;
  font-weight: 600;
  padding: 5px 0;
}
.parameter-notes p {
  margin: 8px 0;
  color: var(--muted);
  font-size: 12px;
}
.metrics-bar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0 0 12px;
  background: #e5ecdf;
  border: 1px solid #ccd8c4;
  border-radius: 5px;
}
.metric {
  min-width: 0;
  padding: 12px 18px;
  border-right: 1px solid #ccd8c4;
  display: flex;
  flex-direction: column;
}
.metric:last-child {
  border-right: 0;
}
.metric-label {
  font-size: 12px;
  color: #56674f;
}
.metric strong {
  font-size: 28px;
  line-height: 1.25;
  font-weight: 650;
  color: #294f31;
  font-variant-numeric: tabular-nums;
  margin-top: 5px;
  overflow-wrap: anywhere;
}
.metric span:not(.metric-label) {
  font-size: 15px;
  font-weight: 600;
  color: #294f31;
  font-variant-numeric: tabular-nums;
}
.metric small {
  font-size: 11px;
  color: #56674f;
}
.status {
  font-size: 11px;
  color: var(--green);
  line-height: 1.6;
}
.preview-empty {
  height: 470px;
  display: grid;
  place-items: center;
  background: #17251f;
  color: #b2c7b7;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}
.checks {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 12px 18px;
  border-top: 1px solid var(--line);
  font-size: 12px;
  color: var(--muted);
}
.checks strong {
  display: block;
  color: #3e5543;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 3px;
  font-variant-numeric: tabular-nums;
}
.checks span {
  display: block;
  line-height: 1.7;
}
.wide {
  margin-top: 18px;
}
.wide summary {
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  list-style: none;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  color: #435d46;
}
.wide summary::-webkit-details-marker {
  display: none;
}
.toggle-label {
  font-size: 11px;
  font-weight: 400;
  color: var(--muted);
  flex: none;
}
.wide summary .when-open,
.wide[open] summary .when-closed {
  display: none;
}
.wide[open] summary .when-open {
  display: inline;
}
.wide summary:hover {
  background: #f6f8f2;
}
.wide .card-body {
  padding: 0 18px 16px;
}
.scroll {
  overflow-x: auto;
}
.scroll table {
  min-width: 620px;
}
.pearl-tool table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}
.pearl-tool th,
.pearl-tool td {
  padding: 9px 10px;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}
.pearl-tool th {
  color: #435c47;
  background: #eef3e9;
  font-weight: 600;
}
.pearl-tool td {
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.detail-note,
.muted {
  font-size: 12px;
  line-height: 1.8;
  color: var(--muted);
  padding-top: 12px;
  overflow-wrap: anywhere;
}
.two-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.material-table {
  max-height: 360px;
  overflow: auto;
}
.material-table th {
  position: sticky;
  top: 0;
}
.material-table td:last-child {
  overflow-wrap: anywhere;
  max-width: 230px;
}
.material-table .secondary {
  margin-top: 14px;
}
.source-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 14px;
  font-size: 12px;
}
/* Original v9.2 Yueyue styling is scoped to this tool. */
.brand .badges {
  margin-left: auto;
}
.yueyue {
  position: relative;
  flex: 0 0 104px;
  align-self: flex-end;
  padding-top: 8px;
}
#yueyueButton {
  display: block;
  width: 104px;
  height: 112px;
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: 12px;
  touch-action: manipulation;
  transform-origin: 50% 95%;
}
#yueyueButton:hover {
  background: transparent;
}
#yueyueButton img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}
.yueyue-greeting {
  position: absolute;
  z-index: 2;
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
@media (max-width: 1150px) {
  .pearl-tool {
    padding: 0 18px 28px;
  }
  .main {
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 16px;
  }
  .metric {
    padding: 12px;
  }
  .metric strong {
    font-size: 26px;
  }
  .limit strong {
    font-size: 16px;
  }
}
@media (max-width: 800px) {
  .pearl-tool {
    padding: 0 12px 22px;
  }
  .brand {
    min-height: 65px;
    gap: 8px;
  }
  .brandleft {
    gap: 8px;
  }
  .brand h2 {
    font-size: 15px;
    text-wrap: balance;
  }
  .brand .badges {
    display: none;
  }
  .logo {
    width: 28px;
    height: 28px;
    font-size: 9px;
  }
  .heading {
    display: block;
    padding-top: 16px;
  }
  .heading h3 {
    font-size: 20px;
  }
  .heading p {
    font-size: 12px;
  }
  .limit {
    display: block;
    margin-top: 7px;
  }
  .main {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .card-body {
    padding: 15px;
  }
  .card-head {
    padding: 13px 15px;
  }
  .metric {
    padding: 10px;
  }
  .metric-label {
    font-size: 11px;
  }
  .metric strong {
    font-size: 24px;
  }
  .metric span:not(.metric-label) {
    font-size: 13px;
  }
  .metric small {
    font-size: 10px;
  }
  .preview-empty {
    height: 370px;
  }
  .two-detail {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .checks {
    gap: 12px;
    padding: 12px 15px;
    font-size: 11px;
  }
  .yueyue {
    flex-basis: 70px;
    padding-top: 6px;
  }
  #yueyueButton {
    width: 70px;
    height: 76px;
  }
  .yueyue-greeting {
    right: 62px;
    top: 12px;
  }
}
@media (max-width: 400px) {
  .metric {
    padding: 10px 8px;
  }
  .metric strong {
    font-size: 22px;
  }
  .metric span:not(.metric-label) {
    font-size: 12px;
  }
  .checks strong {
    font-size: 13px;
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
