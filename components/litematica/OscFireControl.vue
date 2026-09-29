<template>
  <div class="osc-fire-control" :class="bodyClass" :style="{ '--cell-size': '55px', '--cell-gap': '1px' }">
    <video ref="bgVideoA" class="bg-video" :class="{ active: bgVideoEnabled && activeVideo === 0 }" autoplay muted playsinline preload="auto" :src="currentVideoUrl"></video>
    <video ref="bgVideoB" class="bg-video" :class="{ active: bgVideoEnabled && activeVideo === 1 }" muted playsinline preload="auto" :src="currentVideoUrl"></video>

    <div class="osc-scale-wrap">
      <div class="osc-c">
        <div class="header">
          <div class="logo">☢ OSC<span> Fire Control</span>
            <span class="sub">{{ currentVersionData.name }}</span>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">🚀 火控数据 <span class="en">Fire Control Data</span></div>
          <div class="fc-container">
            <div class="fc-left">
              <div class="coord-grid">
                <div class="coord-row">
                  <span class="coord-label">炮台坐标 <span class="en">Cannon Coord</span></span>
                  <div class="coord-input-group cannon">
                    <label>X</label>
                    <input type="text" inputmode="text" class="coord-xz" :value="cx0" @input="onCoordInput('cx0', $event)" @blur="onCoordBlur('cx0')" @wheel="onCoordWheel('cx0', $event)" @focus="$event.target.select()" />
                    <label>Y</label>
                    <input type="text" inputmode="text" :value="cy0" @input="onCoordInput('cy0', $event)" @blur="onCoordBlur('cy0')" @wheel="onCoordWheel('cy0', $event)" @focus="$event.target.select()" />
                    <label>Z</label>
                    <input type="text" inputmode="text" class="coord-xz" :value="cz0" @input="onCoordInput('cz0', $event)" @blur="onCoordBlur('cz0')" @wheel="onCoordWheel('cz0', $event)" @focus="$event.target.select()" />
                  </div>
                </div>
                <div class="coord-row">
                  <span class="coord-label">目标坐标 <span class="en">Target Coord</span></span>
                  <div class="coord-input-group target">
                    <label>X</label>
                    <input type="text" inputmode="text" class="coord-xz" :value="cx1" @input="onCoordInput('cx1', $event)" @blur="onCoordBlur('cx1')" @wheel="onCoordWheel('cx1', $event)" @focus="$event.target.select()" />
                    <label>Y</label>
                    <input type="text" inputmode="text" :value="cy1" @input="onCoordInput('cy1', $event)" @blur="onCoordBlur('cy1')" @wheel="onCoordWheel('cy1', $event)" @focus="$event.target.select()" />
                    <label>Z</label>
                    <input type="text" inputmode="text" class="coord-xz" :value="cz1" @input="onCoordInput('cz1', $event)" @blur="onCoordBlur('cz1')" @wheel="onCoordWheel('cz1', $event)" @focus="$event.target.select()" />
                  </div>
                </div>
              </div>

              <div class="row-pw-yield">
                <span class="fixed-label">密码 <span class="en">Passcode</span></span>
                <div class="pw-group" @wheel="onPassWheel($event)">
                  <div v-for="(bit, i) in passBitsDisplay" :key="i" class="pw-bit" :class="{ on: bit }" @click="toggleBit(i)"></div>
                </div>
                <div class="yield-wrapper">
                  <div class="yield-label-wrapper">
                    <span class="fixed-label">弹头威力 <span class="en">Warhead Count</span></span>
                  </div>
                  <input type="number" :value="nCount" min="1" max="31" step="1" @input="onNCountInput($event)" @blur="onNCountBlur" @wheel="onNCountWheel($event)" @focus="$event.target.select()" />
                </div>
              </div>

              <div class="row-type">
                <span class="fixed-label">弹头类型 <span class="en">Type</span></span>
                <div class="type-buttons" @wheel="onTypeWheel($event)">
                  <button class="warhead-btn" :class="{ active: warheadType === 0 }" @click="warheadType = 0">核弹 Nuke</button>
                  <button class="warhead-btn" :class="{ active: warheadType === 3 }" @click="warheadType = 3">钻地弹 Bunker</button>
                </div>
              </div>

              <div class="integrated-status-bar" :class="statusClass">
                <div v-if="currentVersionData.locked" class="status-item status-locked" style="order:99">🔒 该版本暂未启用 | NOT AVAILABLE</div>
                <template v-else>
                  <div v-if="fatalErrorMsg" class="status-item status-error animate-pop">{{ fatalErrorMsg }}</div>
                  <div v-if="showEarth" class="status-item status-earth animate-pop">💥 炸飞地球？ | BLOW UP EARTH?</div>
                  <div v-if="showCrash" class="status-item status-crashwarning animate-pop">⚠️ 卡顿较高 | HIGH LAG</div>
                  <div v-if="showSelfDestruct" class="status-item status-selfdestruct animate-pop">⚠️ 自毁风险 | SELF-DESTRUCT HAZARD</div>
                  <div v-if="showLag" class="status-item status-lagwarning animate-pop">⚠️ 当量过大 | YIELD HIGH</div>
                  <div class="status-item status-time">⏳ 预计完成总耗时 {{ estimatedTime }}</div>
                </template>
              </div>
            </div>

            <div class="fc-right">
              <div class="fc-output cyan"><span class="label">弹头高度 <span class="en">Warhead Height</span></span><span class="value-group"><span class="value cyan">{{ currentVersionData.locked ? '--' : qH }}</span></span></div>
              <div class="fc-output cyan"><span class="label">爆点中心 <span class="en">Impact Center X</span></span><span class="value-group"><span class="value cyan">{{ currentVersionData.locked ? '--' : qX }}</span></span></div>
              <div class="fc-output cyan"><span class="label">爆点中心 <span class="en">Impact Center Y</span></span><span class="value-group"><span class="value cyan">{{ currentVersionData.locked ? '--' : qY }}</span></span></div>
              <div class="fc-output cyan"><span class="label">爆点中心 <span class="en">Impact Center Z</span></span><span class="value-group"><span class="value cyan">{{ currentVersionData.locked ? '--' : qZ }}</span></span></div>
              <div class="fc-output yellow"><span class="label">弹头当量 <span class="en">Yield</span></span><span class="value-group"><span class="value yellow">{{ currentVersionData.locked ? '--' : nYield }}</span></span></div>
              <div class="fc-output green"><span class="label">动量 Motion X</span><span class="value-group"><span class="value green">{{ currentVersionData.locked ? '--' : dX }}</span></span></div>
              <div class="fc-output green"><span class="label">动量 Motion Y</span><span class="value-group"><span class="value green">{{ currentVersionData.locked ? '--' : dY }}</span></span></div>
              <div class="fc-output green"><span class="label">动量 Motion Z</span><span class="value-group"><span class="value green">{{ currentVersionData.locked ? '--' : dZ }}</span></span></div>
            </div>
          </div>
        </div>

        <div class="panel" :class="{ 'drag-over': dragOver }" @dragenter="onDragEnter" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
          <div class="panel-title panel-title-flex">
            <span>▦ 控制台 <span class="en">Console</span></span>
          </div>
          <div class="console-toolbar">
            <div class="console-row">
              <div class="version-switch" :class="{ open: verMenuOpen }">
                <button class="ver-toggle" @click.stop="verMenuOpen = !verMenuOpen; pmMenuOpen = false; slotMenuOpen = false" @wheel="onVerWheel">
                  <span>{{ currentVersionData.name }}</span>
                  <span class="arrow">▼</span>
                </button>
                <div class="ver-menu" v-show="verMenuOpen">
                  <div v-for="(v, key) in VERSIONS" :key="key" class="ver-option" :class="{ active: key === currentVersion }" @click.stop="switchVersion(key)">{{ v.name }}</div>
                </div>
              </div>
              <div class="panel-mode-switch" :class="{ open: pmMenuOpen }">
                <button class="pm-toggle" @click.stop="pmMenuOpen = !pmMenuOpen; verMenuOpen = false; slotMenuOpen = false" @wheel="onPmWheel">
                  <span>{{ currentPanelModeData.icon }} {{ currentPanelModeData.label }}</span>
                  <span class="arrow">▼</span>
                </button>
                <div class="pm-menu" v-show="pmMenuOpen">
                  <div v-for="(m, key) in PANEL_MODES" :key="key" class="pm-option" :class="{ active: key === currentPanelMode }" @click.stop="switchPanelMode(key)">
                    <span class="pm-dot"></span><span class="pm-icon">{{ m.icon }}</span><span>{{ m.label }}</span>
                  </div>
                </div>
              </div>
              <button class="eye-btn" :class="{ off: !bgVideoEnabled }" @click.stop="toggleBgVideo">{{ bgVideoEnabled ? '👁' : '🙈' }}</button>
            </div>
            <div class="console-row">
              <div class="slot-switch" :class="{ open: slotMenuOpen }">
                <button class="slot-toggle" @click.stop="slotMenuOpen = !slotMenuOpen; verMenuOpen = false; pmMenuOpen = false" @wheel="onSlotWheel">
                  <span>{{ slotLabel }}</span>
                  <span class="arrow">▼</span>
                </button>
                <div class="slot-menu" v-show="slotMenuOpen">
                  <div v-for="(cfg, i) in slots" :key="i" class="slot-option" :class="{ active: i === currentSlot }">
                    <span class="slot-name" @click.stop="loadSlot(i)">{{ cfg.name || ('配置 ' + (i + 1)) }}</span>
                    <span class="slot-del" @click.stop="deleteSlot(i)">✕</span>
                  </div>
                  <div class="slot-add" @click.stop="newConfig">＋ 新建配置 New</div>
                </div>
              </div>
              <button class="save-btn" @click.stop="openSavePop">💾 保存配置 Save</button>
              <button class="save-btn clear" @click.stop="clearConfig">🗑 删除配置 Delete</button>
              <button class="save-btn export" @click.stop="exportConfig">📤 导出 Export</button>
              <button class="save-btn import" @click.stop="importConfig">📥 导入 Import</button>
            </div>
          </div>
          <div class="table-wrap">
            <table v-if="currentVersionData.locked">
              <tr><td style="color:#447777;text-align:center;font-size:1em;padding:80px;border:none">🔒 该版本暂未启用 | NOT AVAILABLE</td></tr>
            </table>
            <div v-else-if="fatalErrorMsg" style="color:#ff6b6b;text-align:center;font-size:0.9em">{{ fatalErrorMsg }}</div>
            <table v-else>
              <tr class="th-row">
                <td class="th-p" colspan="2"></td>
                <td class="th-n" colspan="2"></td>
                <td class="th-a" colspan="4"></td>
                <td class="th-b" colspan="2"></td>
                <td class="th-g" colspan="2"></td>
                <td class="th-y" colspan="2"></td>
                <td class="th-c" colspan="4"></td>
                <td class="th-d" colspan="2"></td>
              </tr>
              <tr v-if="gapMode === 'top'" class="row-gap">
                <td v-for="i in 20" :key="i"> </td>
              </tr>
              <template v-for="r in 3" :key="r">
                <tr>
                  <td v-for="(col, ci) in signalCols" :key="ci" :class="[col[r-1] ? 'b1' : 'b0', colColors[ci]]"> </td>
                </tr>
                <tr v-if="r < 3" class="row-gap">
                  <td v-for="i in 20" :key="i"> </td>
                </tr>
              </template>
              <tr v-if="gapMode === 'bottom'" class="row-gap">
                <td v-for="i in 20" :key="i"> </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toastMsg" class="toast" :class="[{ show: toastShow }, toastType]">{{ toastMsg }}</div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const cx0 = ref(0), cy0 = ref(0), cz0 = ref(0)
const cx1 = ref(0), cy1 = ref(0), cz1 = ref(0)
const nCount = ref(15)
const warheadType = ref(0)
const passBits = ref([1, 0, 0, 1, 0, 1])
const passBitsDisplay = computed(() => [...passBits.value].reverse())

const VERSIONS = {
  OSC_26: {
    name: 'OSC_26', subtitle: 'OSC_26', locked: false, video: 'video/osc26.mp4',
    constants: { KL_P: 0.9283626414883763, KH_P: 18.567252829767533, KL_N: -0.9371865754973492, KH_N: -18.74373150994699, KHy: 18.84837507385716, KLy: 0.942418753692858, KHyx: -0.4108629963176539, KLyx: -0.0205431498158827, MAX_H: 4095, MAX_Hy: 31 },
  },
  OSC_26Mini: {
    name: 'OSC_26Mini', subtitle: 'OSC_26Mini', locked: true, video: 'video/osc26mini.mp4',
    constants: { KL_P: 0.9283626414883763, KH_P: 18.567252829767533, KL_N: -0.9371865754973492, KH_N: -18.74373150994699, KHy: 18.84837507385716, KLy: 0.942418753692858, KHyx: -0.4108629963176539, KLyx: -0.0205431498158827, MAX_H: 4095, MAX_Hy: 31 },
  },
}
const currentVersion = ref('OSC_26')
const currentVersionData = computed(() => VERSIONS[currentVersion.value])
const verMenuOpen = ref(false)
function switchVersion(key) {
  if (!VERSIONS[key]) return
  currentVersion.value = key
  verMenuOpen.value = false
}
function cycleVersion(dir) {
  const keys = Object.keys(VERSIONS)
  let idx = keys.indexOf(currentVersion.value)
  if (idx < 0) idx = 0
  idx = (idx + dir + keys.length) % keys.length
  switchVersion(keys[idx])
}
function onVerWheel(e) {
  e.preventDefault()
  e.stopPropagation()
  cycleVersion(e.deltaY < 0 ? 1 : -1)
}

const PANEL_MODES = {
  '铜灯版 Copper_Bulb': { gap: 'bottom', icon: '⬆', label: '铜灯版 Copper_Bulb', bodyClass: 'mode-cb' },
  '无铜灯版 Copper_Bulb-Free': { gap: 'top', icon: '⬇', label: '无铜灯版 Copper_Bulb-Free', bodyClass: 'mode-rl' },
  '无铜灯增强版 Copper_Bulb-Free Plus': { gap: 'bottom', icon: '⬆', label: '无铜灯增强版 Copper_Bulb-Free Plus', bodyClass: 'mode-rl' },
}
const currentPanelMode = ref('无铜灯版 Copper_Bulb-Free')
const currentPanelModeData = computed(() => PANEL_MODES[currentPanelMode.value])
const pmMenuOpen = ref(false)
const gapMode = computed(() => currentPanelModeData.value.gap)
const bodyClass = computed(() => {
  const arr = [currentPanelModeData.value.bodyClass]
  if (currentVersionData.value.locked) arr.push('locked-mode')
  return arr
})
function switchPanelMode(k) {
  if (!PANEL_MODES[k]) return
  currentPanelMode.value = k
  pmMenuOpen.value = false
}
function cyclePm(dir) {
  const order = Object.keys(PANEL_MODES)
  let idx = order.indexOf(currentPanelMode.value)
  if (idx < 0) idx = 0
  idx = (idx + dir + order.length) % order.length
  switchPanelMode(order[idx])
}
function onPmWheel(e) {
  e.preventDefault()
  e.stopPropagation()
  cyclePm(e.deltaY < 0 ? 1 : -1)
}

function toggleBit(displayIndex) {
  const realIndex = 5 - displayIndex
  const nb = [...passBits.value]
  nb[realIndex] = nb[realIndex] ? 0 : 1
  passBits.value = nb
}
function getPasscode() {
  return passBits.value[5] * 32 + passBits.value[4] * 16 + passBits.value[3] * 8 + passBits.value[2] * 4 + passBits.value[1] * 2 + passBits.value[0]
}
function setPasscode(v) {
  v = Math.max(0, Math.min(63, v | 0))
  const nb = []
  for (let i = 0; i < 6; i++) nb[i] = (v >> i) & 1
  passBits.value = nb
}
function onPassWheel(e) {
  e.preventDefault()
  setPasscode(getPasscode() + (e.deltaY < 0 ? 1 : -1))
}

const coordRefs = { cx0, cy0, cz0, cx1, cy1, cz1 }
function onCoordInput(key, e) {
  let v = e.target.value.replace(/[^\d-]/g, '')
  if (v.indexOf('-') > 0) v = v.replace(/-/g, '')
  e.target.value = v
  const n = Math.round(parseFloat(v))
  coordRefs[key].value = isNaN(n) ? 0 : n
}
function onCoordBlur(key) {
  let v = coordRefs[key].value
  if (v === '' || v === null || isNaN(v)) v = 0
  if (key === 'cy0' || key === 'cy1') v = Math.max(-64, v)
  coordRefs[key].value = v
}
function onCoordWheel(key, e) {
  e.preventDefault()
  let v = coordRefs[key].value || 0
  v += e.deltaY < 0 ? 1 : -1
  if (key === 'cy0' || key === 'cy1') v = Math.max(-64, v)
  coordRefs[key].value = v
}

function onNCountInput(e) {
  let v = e.target.value.replace(/[^\d]/g, '')
  e.target.value = v
  let n = Math.round(parseFloat(v))
  if (isNaN(n)) n = 1
  nCount.value = n
}
function onNCountBlur() {
  let v = nCount.value
  if (isNaN(v) || v < 1) v = 1
  if (v > 31) v = 31
  nCount.value = v
}
function onNCountWheel(e) {
  e.preventDefault()
  let v = nCount.value || 1
  v += e.deltaY < 0 ? 1 : -1
  nCount.value = Math.max(1, Math.min(31, v))
}

const typeOrder = [0, 3]
function onTypeWheel(e) {
  e.preventDefault()
  let idx = typeOrder.indexOf(warheadType.value)
  if (idx < 0) idx = 0
  idx = (idx + (e.deltaY < 0 ? 1 : -1) + typeOrder.length) % typeOrder.length
  warheadType.value = typeOrder[idx]
}

function motionToTier(motion, KL_signed, MAX_H) {
  const KL_abs = Math.abs(KL_signed)
  const t = Math.abs(motion) / KL_abs
  let H = Math.floor(t / 20)
  let Lraw = t - H * 20
  let L = Math.round(Lraw)
  if (L >= 20) { H++; L = 0 }
  if (L < 0) { H--; L = 19 }
  const Hc = Math.max(0, Math.min(MAX_H, H))
  const Lc = Math.max(0, Math.min(19, L))
  return { H: Hc, L: Lc, clamped: (Hc !== H) || (Lc !== L) }
}

const errX1 = ref(false)
const errY1 = ref(false)
const errZ1 = ref(false)

const computedResult = computed(() => {
  if (currentVersionData.value.locked) return { fatal: null, locked: true }
  const K = currentVersionData.value.constants
  const y0 = Math.max(-64, cy0.value)
  const x0 = cx0.value, z0 = cz0.value, x1 = cx1.value, y1 = cy1.value, z1 = cz1.value
  const Dx = (x1 + 0.5) - (x0 + 0.5)
  const Dz = (z1 + 0.5) - (z0 + 0.5)
  const Dy = y1 - y0 + (warheadType.value === 3 ? 97.063115 : 167.063115)

  const yTier = motionToTier(Dy / 1.5, K.KLy, K.MAX_Hy)
  if (yTier.clamped) { errY1.value = true; errX1.value = false; errZ1.value = false; return { fatal: '⚠️ 超出射程 | RANGE EXCEEDED' } }
  errY1.value = false
  const Hy = yTier.H, Ly = yTier.L

  if (1.5 * (K.KHy * Hy + K.KLy * Ly) - y0 < 80) return { fatal: '⚠️ 出井动力不足 | INSUFFICIENT THRUST' }

  const Motion_yx = K.KHyx * Hy + K.KLyx * Ly
  const tmX = Dx / 0.9 - Motion_yx
  const KLx = tmX >= 0 ? K.KL_P : K.KL_N
  const xTier = motionToTier(tmX, KLx, K.MAX_H)
  const Hx = xTier.H, Lx = xTier.L
  const tmZ = Dz / 0.9
  const KLz = tmZ >= 0 ? K.KL_P : K.KL_N
  const zTier = motionToTier(tmZ, KLz, K.MAX_H)
  const Hz = zTier.H, Lz = zTier.L
  errX1.value = xTier.clamped
  errZ1.value = zTier.clamped
  if (xTier.clamped || zTier.clamped) return { fatal: '⚠️ 超出射程 | RANGE EXCEEDED' }

  const KHx = tmX >= 0 ? K.KH_P : K.KH_N
  const KHz = tmZ >= 0 ? K.KH_P : K.KH_N
  const Motion_x = KHx * Hx + KLx * Lx
  const Motion_y = K.KHy * Hy + K.KLy * Ly
  const Motion_z = KHz * Hz + KLz * Lz

  return { fatal: null, Hx, Lx, Hy, Ly, Hz, Lz, Motion_x, Motion_y, Motion_yx, Motion_z, dxSign: Motion_x > 0 ? 1 : 0, dzSign: Motion_z > 0 ? 1 : 0 }
})

const fatalErrorMsg = computed(() => computedResult.value.fatal || '')
const qH = computed(() => (cy0.value + 1.5 * (computedResult.value.Motion_y || 0)).toFixed(3))
const qX = computed(() => ((cx0.value + 0.5) + 0.9 * ((computedResult.value.Motion_x || 0) + (computedResult.value.Motion_yx || 0))).toFixed(3))
const qY = computed(() => (cy0.value + 1.5 * (computedResult.value.Motion_y || 0) - (warheadType.value === 3 ? 96.563115 : 166.563115)).toFixed(3))
const qZ = computed(() => ((cz0.value + 0.5) + 0.9 * (computedResult.value.Motion_z || 0)).toFixed(3))
const dX = computed(() => ((computedResult.value.Motion_x || 0) + (computedResult.value.Motion_yx || 0)).toFixed(3))
const dY = computed(() => (computedResult.value.Motion_y || 0).toFixed(3))
const dZ = computed(() => (computedResult.value.Motion_z || 0).toFixed(3))

const nYield = computed(() => {
  const n = Math.max(1, Math.min(31, nCount.value || 1))
  if (warheadType.value === 3) {
    const n2 = Math.min(n, 7)
    return Math.round(180 + 9 * n * (n + 1) / 2 + 9 * n2 * (n2 - 1) / 2)
  }
  return Math.round(9 * n * (n + 1) / 2)
})

const estimatedTime = computed(() => {
  if (computedResult.value.locked || fatalErrorMsg.value) return '--:--'
  const c = computedResult.value
  const mH = Math.max(c.Hx || 0, c.Hz || 0)
  let t
  if (warheadType.value === 3) {
    const n2 = Math.min(nCount.value, 7)
    t = 6 * mH + 120 + 3 * nCount.value * (nCount.value + 1) + 3 * n2 * (n2 - 1) + 6 * (c.Hy || 0)
  } else {
    t = 6 * mH + nYield.value + 6 * (c.Hy || 0)
  }
  const total = Math.max(0, t + 100)
  const s = Math.floor(total / 20) + 60
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec < 10 ? '0' : ''}${sec}`
})

const showEarth = computed(() => !currentVersionData.value.locked && nCount.value === 31 && !fatalErrorMsg.value)
const showCrash = computed(() => !currentVersionData.value.locked && nCount.value > 21 && nCount.value < 31 && !fatalErrorMsg.value)
const showLag = computed(() => !currentVersionData.value.locked && nYield.value > 1080 && nCount.value <= 21 && !fatalErrorMsg.value)
const showSelfDestruct = computed(() => {
  if (currentVersionData.value.locked || fatalErrorMsg.value) return false
  const Dx = cx1.value - cx0.value, Dz = cz1.value - cz0.value
  return Math.sqrt(Dx * Dx + Dz * Dz) <= 500
})
const statusClass = computed(() => {
  if (currentVersionData.value.locked) return 'state-locked'
  if (fatalErrorMsg.value) return 'state-error'
  if (showEarth.value) return 'state-earth'
  if (showCrash.value) return 'state-crash'
  if (showLag.value || showSelfDestruct.value) return 'state-warn'
  return 'state-valid'
})

const colColors = ['col-p','col-p','col-n','col-n','col-a','col-a','col-a','col-a','col-b','col-b','col-g','col-g','col-y','col-y','col-c','col-c','col-c','col-c','col-d','col-d']
function toBinArray(n, bits) {
  if (n < 0) n = 0
  let s = n.toString(2)
  while (s.length < bits) s = '0' + s
  return s.slice(-bits).split('').map(Number).reverse()
}
const signalCols = computed(() => {
  if (currentVersionData.value.locked) return []
  const c = computedResult.value
  if (c.fatal) return []
  const Hx = c.Hx || 0, Hz = c.Hz || 0, Hy = c.Hy || 0
  const Lx = c.Lx || 0, Lz = c.Lz || 0, Ly = c.Ly || 0
  const dxSign = c.dxSign || 0, dzSign = c.dzSign || 0
  const pD = passBits.value.slice()
  const nD = toBinArray(nCount.value, 5)
  const nbBit = warheadType.value === 3 ? 1 : 0
  const aD = toBinArray(Hx, 12), bD = toBinArray(Lx, 5)
  const eD = toBinArray(Hy, 5), fD = toBinArray(Ly, 5)
  const cD = toBinArray(Hz, 12), dD = toBinArray(Lz, 5)
  return [
    [pD[3],pD[4],pD[5]],[pD[0],pD[1],pD[2]],
    [nD[3],nD[4],nbBit],[nD[0],nD[1],nD[2]],
    [aD[9],aD[10],aD[11]],[aD[6],aD[7],aD[8]],[aD[3],aD[4],aD[5]],[aD[0],aD[1],aD[2]],
    [bD[3],bD[4],dxSign],[bD[0],bD[1],bD[2]],
    [eD[3],eD[4],0],[eD[0],eD[1],eD[2]],
    [fD[3],fD[4],0],[fD[0],fD[1],fD[2]],
    [cD[9],cD[10],cD[11]],[cD[6],cD[7],cD[8]],[cD[3],cD[4],cD[5]],[cD[0],cD[1],cD[2]],
    [dD[3],dD[4],dzSign],[dD[0],dD[1],dD[2]],
  ]
})

const SLOT_KEY = 'osc_fire_control_configs'
const slots = ref([])
const currentSlot = ref(-1)
const slotMenuOpen = ref(false)
const slotLabel = computed(() => {
  if (currentSlot.value < 0) return '未保存 New'
  const cfg = slots.value[currentSlot.value]
  return (cfg && cfg.name) ? cfg.name : ('配置 ' + (currentSlot.value + 1))
})
function readSlots() {
  try {
    const raw = localStorage.getItem(SLOT_KEY)
    if (!raw) return []
    const obj = JSON.parse(raw)
    return Array.isArray(obj) ? obj : []
  } catch (e) { return [] }
}
function writeSlots(s) {
  try { localStorage.setItem(SLOT_KEY, JSON.stringify(s)); return true } catch (e) { return false }
}
function collectConfig() {
  return {
    version: currentVersion.value,
    panelMode: currentPanelMode.value,
    warheadType: warheadType.value,
    passBits: passBits.value.slice(),
    nCount: nCount.value,
    cx0: cx0.value, cy0: cy0.value, cz0: cz0.value,
    cx1: cx1.value, cy1: cy1.value, cz1: cz1.value,
  }
}
function applyConfig(cfg) {
  if (!cfg) return
  if (cfg.version && VERSIONS[cfg.version]) currentVersion.value = cfg.version
  if (cfg.panelMode && PANEL_MODES[cfg.panelMode]) currentPanelMode.value = cfg.panelMode
  if (cfg.warheadType != null) warheadType.value = +cfg.warheadType || 0
  if (cfg.passBits && cfg.passBits.length === 6) passBits.value = cfg.passBits.map(x => x ? 1 : 0)
  if (cfg.cx0 != null) cx0.value = +cfg.cx0
  if (cfg.cy0 != null) cy0.value = +cfg.cy0
  if (cfg.cz0 != null) cz0.value = +cfg.cz0
  if (cfg.cx1 != null) cx1.value = +cfg.cx1
  if (cfg.cy1 != null) cy1.value = +cfg.cy1
  if (cfg.cz1 != null) cz1.value = +cfg.cz1
  if (cfg.nCount != null) nCount.value = +cfg.nCount
}
function loadSlot(i) {
  if (i < 0 || i >= slots.value.length) return
  currentSlot.value = i
  applyConfig(slots.value[i])
  slotMenuOpen.value = false
}
function deleteSlot(i) {
  if (i < 0 || i >= slots.value.length) return
  slots.value.splice(i, 1)
  writeSlots(slots.value)
  if (currentSlot.value === i) currentSlot.value = -1
  else if (currentSlot.value > i) currentSlot.value--
}
function newConfig() {
  currentSlot.value = -1
  cx1.value = 0; cy1.value = 0; cz1.value = 0
  slotMenuOpen.value = false
}
function cycleSlot(dir) {
  if (slots.value.length === 0) return
  const total = slots.value.length + 1
  const cur = currentSlot.value < 0 ? slots.value.length : currentSlot.value
  const next = (cur + dir + total) % total
  if (next === slots.value.length) newConfig()
  else loadSlot(next)
}
function onSlotWheel(e) {
  e.preventDefault()
  e.stopPropagation()
  cycleSlot(e.deltaY < 0 ? 1 : -1)
}
function clearConfig() {
  if (currentSlot.value < 0) return
  slots.value.splice(currentSlot.value, 1)
  writeSlots(slots.value)
  currentSlot.value = -1
  showToastMsg('✔ 已删除 Deleted')
}

function openSavePop() {
  verMenuOpen.value = false; pmMenuOpen.value = false; slotMenuOpen.value = false
  const name = prompt('配置名称 Name', currentSlot.value >= 0 && slots.value[currentSlot.value] ? slots.value[currentSlot.value].name || '' : '')
  if (name === null) return
  const cfg = collectConfig()
  cfg.name = (name || '').trim() || ('配置 ' + (slots.value.length + 1))
  if (currentSlot.value < 0) {
    slots.value.push(cfg)
    currentSlot.value = slots.value.length - 1
  } else {
    slots.value[currentSlot.value] = cfg
  }
  if (!writeSlots(slots.value)) { showToastMsg('保存失败 Save failed', 'error'); return }
  showToastMsg('✔ 已保存 Saved')
}
function exportConfig() {
  verMenuOpen.value = false; pmMenuOpen.value = false; slotMenuOpen.value = false
  if (slots.value.length === 0) { showToastMsg('没有可导出的配置 No configs to export', 'warn'); return }
  const json = JSON.stringify(slots.value, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  a.href = url; a.download = 'osc_config_' + ts + '.json'
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  showToastMsg('✔ 已导出 Exported')
}
function importConfig() {
  verMenuOpen.value = false; pmMenuOpen.value = false; slotMenuOpen.value = false
  const inp = document.createElement('input')
  inp.type = 'file'; inp.accept = '.json,application/json'; inp.style.display = 'none'
  inp.onchange = () => { const f = inp.files && inp.files[0]; if (f) loadConfigFromFile(f) }
  document.body.appendChild(inp); inp.click()
  setTimeout(() => { if (inp.parentNode) document.body.removeChild(inp) }, 1000)
}
function loadConfigFromFile(file) {
  if (!/\.json$/i.test(file.name)) { showToastMsg('请选择 .json 文件', 'warn'); return }
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const obj = JSON.parse(ev.target.result)
      if (!Array.isArray(obj)) throw new Error('格式不是数组')
      writeSlots(obj)
      slots.value = obj
      currentSlot.value = obj.length > 0 ? 0 : -1
      if (obj.length > 0) applyConfig(obj[0])
      showToastMsg('导入成功 Imported：共 ' + obj.length + ' 个配置')
    } catch (err) { showToastMsg('导入失败 Import failed：' + err.message, 'error') }
  }
  reader.readAsText(file)
}

const dragOver = ref(false)
let dragCount = 0
function onDragEnter(e) { e.preventDefault(); dragCount++; dragOver.value = true }
function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }
function onDragLeave(e) { e.preventDefault(); dragCount--; if (dragCount <= 0) { dragCount = 0; dragOver.value = false } }
function onDrop(e) {
  e.preventDefault(); dragCount = 0; dragOver.value = false
  const files = e.dataTransfer.files
  if (!files || files.length === 0) return
  const f = files[0]
  if (!/\.json$/i.test(f.name)) { showToastMsg('请拖入 .json 文件', 'warn'); return }
  loadConfigFromFile(f)
}

const toastMsg = ref('')
const toastType = ref('')
const toastShow = ref(false)
let _toastTimer = null
function showToastMsg(msg, type = '') {
  toastMsg.value = msg
  toastType.value = type
  toastShow.value = false
  setTimeout(() => { toastShow.value = true }, 10)
  if (_toastTimer) clearTimeout(_toastTimer)
  _toastTimer = setTimeout(() => { toastShow.value = false }, 1200)
}

const bgVideoA = ref(null)
const bgVideoB = ref(null)
const activeVideo = ref(0)
const bgVideoEnabled = ref(true)
const currentVideoUrl = ref('')
let _lastVideoUrl = ''

function setVideoSrc(url) {
  if (_lastVideoUrl === url) return
  _lastVideoUrl = url
  currentVideoUrl.value = url
}
function updateBgVideo() {
  const url = currentVersionData.value.video || ''
  if (!url) { bgVideoEnabled.value = false; return }
  setVideoSrc(url)
  setTimeout(() => {
    const va = bgVideoA.value, vb = bgVideoB.value
    if (va) { va.currentTime = 0; va.play().catch(() => {}) }
    if (vb) vb.pause()
    activeVideo.value = 0
  }, 50)
}
function toggleBgVideo() {
  bgVideoEnabled.value = !bgVideoEnabled.value
  const va = bgVideoA.value, vb = bgVideoB.value
  if (bgVideoEnabled.value) {
    if (va) { va.currentTime = 0; va.play().catch(() => {}) }
    activeVideo.value = 0
  } else {
    if (va) va.pause()
    if (vb) vb.pause()
  }
}
watch(bgVideoEnabled, () => { updateBgVideo() })
watch(currentVersion, () => { updateBgVideo() })

function setupSeamlessLoop() {
  const check = (v) => {
    if (!v || !bgVideoEnabled.value) return
    if (v !== (activeVideo.value === 0 ? bgVideoA.value : bgVideoB.value)) return
    if (v.duration && v.currentTime >= v.duration - 0.4) {
      const next = activeVideo.value === 0 ? bgVideoB.value : bgVideoA.value
      if (next) {
        next.currentTime = 0
        next.play().catch(() => {})
        activeVideo.value = 1 - activeVideo.value
      }
    }
  }
  onMounted(() => {
    if (bgVideoA.value) bgVideoA.value.addEventListener('timeupdate', () => check(bgVideoA.value))
    if (bgVideoB.value) bgVideoB.value.addEventListener('timeupdate', () => check(bgVideoB.value))
  })
}

onMounted(() => {
  slots.value = readSlots()
  if (slots.value.length > 0) { currentSlot.value = 0; applyConfig(slots.value[0]) } else { currentSlot.value = -1 }
  setupSeamlessLoop()
  updateBgVideo()
})
</script>
<style scoped>
.osc-fire-control {
  position: relative;
  font-family: monospace;
  color: #b0d0d0;
  background: #0a0e0f;
  background-image: radial-gradient(ellipse at center, #0f1a1a 0%, #050808 100%);
  padding: 20px;
  border-radius: 8px;
  overflow: hidden;
}
.osc-fire-control.mode-rl { background-image: radial-gradient(ellipse at center, #0f1a1a 0%, #050808 100%); }
.osc-fire-control.mode-cb { background-image: radial-gradient(ellipse at center, #0f1a1a 0%, #050808 100%); }

.bg-video {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  object-fit: cover; z-index: 0; pointer-events: none;
  opacity: 0; transition: opacity .25s ease;
}
.bg-video.active { opacity: .6; }

.osc-scale-wrap { position: relative; z-index: 1; }
.osc-c { max-width: 1200px; width: 100%; margin: 0 auto; }

.header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 2px solid #1a3a3a; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.logo { font-size: 1.8em; font-weight: 900; color: #44dd88; text-shadow: 0 0 20px rgba(68,221,136,.3); }
.logo span { color: #ff6b6b; }
.logo .sub { font-size: .5em; color: #447777; font-weight: 400; display: block; }

.version-switch, .panel-mode-switch, .slot-switch { position: relative; flex-shrink: 0; }
.ver-toggle, .pm-toggle, .slot-toggle { display: flex; align-items: center; gap: 8px; background: #050d0d; border: 1px solid #44dd88; border-radius: 4px; color: #44dd88; font-family: monospace; font-weight: 700; cursor: pointer; transition: all .25s; letter-spacing: 1px; white-space: nowrap; }
.ver-toggle { font-size: .8em; padding: 8px 14px; }
.pm-toggle, .slot-toggle { font-size: .75em; padding: 6px 12px; }
.ver-toggle:hover, .pm-toggle:hover, .slot-toggle:hover { border-color: #88dddd; color: #88dddd; }
.ver-toggle .arrow, .pm-toggle .arrow, .slot-toggle .arrow { font-size: .7em; transition: transform .25s; display: inline-block; }
.version-switch.open .ver-toggle .arrow, .panel-mode-switch.open .pm-toggle .arrow, .slot-switch.open .slot-toggle .arrow { transform: rotate(180deg); }
.ver-menu, .pm-menu, .slot-menu { position: absolute; top: calc(100% + 6px); left: 0; background: #0a1414; border: 1px solid #1a3a3a; border-radius: 6px; box-shadow: 0 8px 24px rgba(0,0,0,.6); overflow: hidden; z-index: 50; }
.ver-menu { min-width: 160px; }
.pm-menu { min-width: 340px; }
.slot-menu { min-width: 240px; max-height: 340px; overflow-y: auto; }
.ver-option { padding: 9px 14px; font-family: monospace; font-size: .75em; font-weight: 700; letter-spacing: 1px; color: #b0d0d0; cursor: pointer; transition: all .18s; white-space: nowrap; border-left: 3px solid transparent; }
.ver-option:hover { background: #122020; color: #88dddd; }
.ver-option.active { background: #1a3a3a; color: #44dd88; border-left-color: #44dd88; }
.pm-option { padding: 9px 14px; font-family: monospace; font-size: .7em; font-weight: 700; letter-spacing: 1px; color: #b0d0d0; cursor: pointer; transition: all .18s; white-space: nowrap; border-left: 3px solid transparent; display: flex; align-items: center; gap: 8px; }
.pm-option:hover { background: #122020; color: #88dddd; }
.pm-option.active { background: #1a3a3a; color: #44dd88; border-left-color: #44dd88; }
.pm-dot { width: 9px; height: 9px; border-radius: 50%; background: #2a3a3a; border: 1px solid #3a4a4a; flex-shrink: 0; transition: all .2s; }
.pm-option.active .pm-dot { background: #ffcc44; border-color: #ffdd77; box-shadow: 0 0 8px rgba(255,200,50,.8); }
.pm-icon { font-size: 1em; line-height: 1; flex-shrink: 0; }
.slot-option { padding: 9px 14px; font-family: monospace; font-size: .7em; font-weight: 700; letter-spacing: 1px; color: #b0d0d0; cursor: pointer; transition: all .18s; white-space: nowrap; border-left: 3px solid transparent; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.slot-option:hover { background: #122020; color: #88dddd; }
.slot-option.active { background: #1a3a3a; color: #44dd88; border-left-color: #44dd88; }
.slot-option .slot-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.slot-option .slot-del { color: #8a4a4a; font-size: .9em; flex-shrink: 0; cursor: pointer; padding: 0 3px; border-radius: 2px; transition: all .15s; }
.slot-option .slot-del:hover { background: #2a0a0a; color: #ff8888; }
.slot-add { padding: 9px 14px; font-family: monospace; font-size: .7em; font-weight: 700; letter-spacing: 1px; color: #44dd88; cursor: pointer; transition: all .18s; white-space: nowrap; border-left: 3px solid transparent; border-top: 1px solid #1a3a3a; display: flex; align-items: center; gap: 6px; }
.slot-add:hover { background: #122020; color: #88dddd; }

.save-btn { background: #050d0d; border: 1px solid #44dd88; border-radius: 4px; color: #44dd88; font-family: monospace; font-size: .75em; font-weight: 700; letter-spacing: 1px; padding: 6px 12px; cursor: pointer; transition: all .25s; white-space: nowrap; }
.save-btn:hover { border-color: #88dddd; color: #88dddd; }
.save-btn.clear { border-color: #8a4a4a; color: #ff8888; }
.save-btn.export { border-color: #66aadd; color: #66aadd; }
.save-btn.import { border-color: #dd88cc; color: #dd88cc; }
.eye-btn { background: #050d0d; border: 1px solid #44dd88; border-radius: 4px; color: #44dd88; font-size: .9em; font-weight: 700; padding: 6px 10px; cursor: pointer; white-space: nowrap; line-height: 1; }
.eye-btn.off { border-color: #8a4a4a; color: #888; opacity: .6; }

.panel { position: relative; background: transparent; border: 1px solid #1a3a3a; border-radius: 8px; padding: 18px 20px; margin-bottom: 16px; transition: border-color .2s, box-shadow .2s; }
.panel.drag-over { border-color: #44dd88; box-shadow: inset 0 0 60px rgba(68,221,136,.35), 0 0 24px rgba(68,221,136,.5); }
.panel.drag-over::after { content: '松开导入配置 Drop to import'; position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 10; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 1.8em; font-weight: 900; color: #66ffaa; letter-spacing: 3px; pointer-events: none; background: rgba(0,10,8,.75); border-radius: 8px; }
.panel-title { font-size: .9em; color: #fff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; border-bottom: 1px solid #0f2a2a; padding-bottom: 6px; font-weight: 700; }
.panel-title .en { color: #fff; font-size: .9em; }
.panel-title-flex { display: flex; align-items: center; justify-content: flex-start; gap: 12px; flex-wrap: wrap; }

.console-toolbar { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.console-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.fc-container { display: flex; gap: 24px; flex-wrap: nowrap; align-items: stretch; }
.fc-left { display: flex; flex-direction: column; gap: 10px; flex: 1 1 600px; min-width: 600px; }
.fc-right { display: flex; flex-direction: column; gap: 8px; width: 240px; flex-shrink: 0; justify-content: center; }

.fixed-label, .coord-label { display: inline-block; width: 150px; font-size: 1em; color: #fff; letter-spacing: 1px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
.coord-label .en, .fixed-label .en { color: #fff; font-size: .95em; }
.row-pw-yield, .row-type { display: flex; align-items: center; width: 100%; flex-wrap: wrap; gap: 6px; }
.coord-grid { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.coord-row { display: flex; align-items: center; width: 100%; flex-wrap: wrap; gap: 6px; }
.coord-input-group { display: flex; align-items: center; gap: 6px; flex: 1 1 auto; justify-content: flex-end; min-width: 0; flex-wrap: wrap; }
.coord-input-group label { font-size: .85em; color: #fff; width: 14px; font-weight: 700; }
.coord-input-group input { background: #050d0d; border-radius: 4px; padding: 4px 8px; font-family: monospace; font-size: 1.1em; width: 80px; height: 40px; outline: none; text-align: center; }
.coord-input-group input.coord-xz { flex: 1 1 0; width: auto; min-width: 100px; }
.coord-input-group.cannon input { border: 1px solid #44dd88; color: #44dd88; }
.coord-input-group.target input { border: 1px solid #ff6b6b; color: #ff6b6b; }
.coord-input-group input.err { border-color: #ff6b6b; color: #ff6b6b; }

.integrated-status-bar { margin-top: 12px; padding: 16px 20px; border: 1px solid #2a4a4a; border-radius: 6px; display: flex; flex-direction: column; align-items: stretch; justify-content: center; gap: 8px; height: 160px; transition: border-color .25s ease; width: 100%; box-sizing: border-box; overflow: hidden; }
.integrated-status-bar.state-valid { border-color: #2a6a4a; }
.integrated-status-bar.state-warn { border-color: #8a7a2a; }
.integrated-status-bar.state-error { border-color: #8a2a2a; }
.integrated-status-bar.state-locked { border-color: #2a3a3a; }
.integrated-status-bar.state-crash { border-color: #cc44aa; }
.integrated-status-bar.state-earth { border-color: #ff8800; }
.integrated-status-bar .status-item { font-family: monospace; font-size: clamp(0.9em, 2.2vh, 1.8em); font-weight: 700; letter-spacing: .8px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.2; max-width: 100%; width: 100%; height: 100%; overflow: hidden; }
@keyframes warningPopIn { 0% { opacity: 0; transform: translateX(28px) scale(.92); } 55% { opacity: 1; transform: translateX(-4px) scale(1.04); } 80% { transform: translateX(1px) scale(.99); } 100% { opacity: 1; transform: translateX(0) scale(1); } }
.status-item.animate-pop { animation: warningPopIn .42s cubic-bezier(.22,1.2,.36,1) both; }
.status-time, .status-valid { color: #44dd88; }
.status-error { color: #ff6b6b; }
.status-warn { color: #ffcc44; }
.status-crashwarning { color: #ff66cc; }
.status-selfdestruct, .status-lagwarning { color: #ffcc44; }
.status-locked { color: #447777; }
.status-earth { color: #ff8800; font-size: clamp(1.1em, 2.8vh, 2.2em); font-weight: 900; letter-spacing: 3px; text-shadow: 0 0 12px #ff4400, 0 0 28px #ff2200; }

.pw-group { display: flex; gap: 6px; flex-shrink: 0; }
.pw-bit {
  width: 40px; height: 40px;
  background-size: 40px 40px; background-position: center; background-repeat: no-repeat;
  background-color: transparent;
  image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;
  border: none; border-radius: 2px; cursor: pointer; transition: filter .2s; flex-shrink: 0;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGFBMVEUxGhFfMxWGTimQVS2gYDaTWDGvaTtGLBsOSTHDAAAAbUlEQVR42gXBAQEAIAwDILar799YAADAShtyXiyk93a1ncD2zAmZtouc9yIjpw3uvJh7Rvoe0pjT28oJrJy2nVhAb3vfG+Bkzel5YxvcnpXb2LZob1di21tkTrts+yaQ95p1Oy+wNrekWQsAwAcHvAIA2wCM4wAAAABJRU5ErkJggg==');
}
.pw-bit.on {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAElBMVEU7IBWUaTHmmUryvXT22rRGNxSp0/IqAAAAZUlEQVR42mWPQQoDQQzDZDn5/5cLM9tS2BwC8iFWeM8SDXcvQJy62DEA64w5+bhADseTBLAGW4kViMGZOUmems5MK8sd7bT2oSzx8PocXeLhCtz6eIX4CV3OVz3/6mwUYpZ9P/8B16EBoO+fQZkAAAAASUVORK5CYII=');
}
.pw-bit:hover { filter: brightness(1.25); }

.yield-wrapper { display: flex; align-items: center; flex: 1 1 auto; justify-content: space-between; gap: 6px; }
.yield-label-wrapper { display: flex; align-items: center; justify-content: center; flex: 1 1 auto; min-width: 0; }
.yield-label-wrapper .fixed-label { width: auto; min-width: 0; text-align: center; }
.yield-wrapper input { background: #3a0a0a; border: 1px solid #ffcc44; border-radius: 4px; color: #ffcc44; padding: 4px 10px; font-family: monospace; font-size: 1.2em; width: 80px; height: 40px; outline: none; text-align: center; cursor: ns-resize; -moz-appearance: textfield; appearance: textfield; }
.yield-wrapper input::-webkit-outer-spin-button,
.yield-wrapper input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.type-buttons { display: flex; align-items: center; gap: 10px; flex: 1 1 auto; flex-wrap: wrap; min-width: 0; }
.warhead-btn { background: transparent; border: 1px solid #1a3a3a; color: #fff; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-family: monospace; font-size: .85em; transition: all .3s; white-space: nowrap; font-weight: 700; height: 40px; flex: 1 1 120px; text-align: center; }
.warhead-btn.active { background: #1a3a3a; border-color: #44dd88; color: #44dd88; }
.warhead-btn:hover { border-color: #44dd88; color: #88dddd; }

.fc-output { display: flex; justify-content: space-between; align-items: center; padding: 3px 10px; border-bottom: 1px solid #0a2a2a; height: 38px; }
.fc-output .label { font-size: .85em; color: #fff; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
.fc-output .value { font-family: monospace; font-size: 1.2em; font-weight: 700; text-align: right; color: #fff; }
.fc-output .value.yellow { color: #ffcc44; }
.fc-output .value.cyan { color: #88dddd; }
.fc-output .value.green { color: #44dd88; }
.fc-output.cyan .label { color: #88dddd; }
.fc-output.yellow .label { color: #ffcc44; }
.fc-output.green .label { color: #44dd88; }

.table-wrap { overflow: hidden; background: transparent; border-radius: 6px; border: 1px solid #1a2040; padding: 18px; display: flex; justify-content: center; align-items: center; height: 427px; box-sizing: border-box; width: 100%; }
.table-wrap table { border-collapse: separate; border-spacing: var(--cell-gap); width: auto; table-layout: fixed; }
.table-wrap td { width: var(--cell-size); height: var(--cell-size); min-width: var(--cell-size); max-width: var(--cell-size); padding: 0; text-align: center; box-sizing: border-box; border-radius: 0; }
.b0, .b1, .row-gap td {
  width: var(--cell-size); height: var(--cell-size);
  background-size: var(--cell-size) var(--cell-size);
  background-position: center; background-repeat: no-repeat;
  background-color: transparent;
  image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;
  border: none;
}
.osc-fire-control.mode-rl .b0 { background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGFBMVEUxGhFfMxWGTimQVS2gYDaTWDGvaTtGLBsOSTHDAAAAbUlEQVR42gXBAQEAIAwDILar799YAADAShtyXiyk93a1ncD2zAmZtouc9yIjpw3uvJh7Rvoe0pjT28oJrJy2nVhAb3vfG+Bkzel5YxvcnpXb2LZob1di21tkTrts+yaQ95p1Oy+wNrekWQsAwAcHvAIA2wCM4wAAAABJRU5ErkJggg=='); }
.osc-fire-control.mode-rl .b1 { background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAElBMVEU7IBWUaTHmmUryvXT22rRGNxSp0/IqAAAAZUlEQVR42mWPQQoDQQzDZDn5/5cLM9tS2BwC8iFWeM8SDXcvQJy62DEA64w5+bhADseTBLAGW4kViMGZOUmems5MK8sd7bT2oSzx8PocXeLhCtz6eIX4CV3OVz3/6mwUYpZ9P/8B16EBoO+fQZkAAAAASUVORK5CYII='); }
.osc-fire-control.mode-cb .b0 { background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAIVBMVEXjgmzWe1vIdFbCa0yyYkenWkCaUDiQSTGGTilzQR9fMxUkk54eAAAAcUlEQVR42gXBgY0CMRAEMM8mPHr67/UE4jLYQRqFJBMjT66+eMsMJz2d5fQOI3voKfbI9qQE/riHnorQUzaCRUAsJ9b4DPoYRIAgXuDyD76blgytMAhQwXI+ltxZzeW7RvZAsSe25Owo41STRyPNIVI/Cq8xV80BK9cAAAAASUVORK5CYII='); }
.osc-fire-control.mode-cb .b1 { background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAALVBMVEX/99L/3Zn2yG3/qFHjgmzWe1vIdFbCa0yyYkenWkCaUDiQSTHZIyOwFxeKGBjZExAkAAAAcklEQVR42gXBgXHDMADEMFL+u+6/buqIATYwCUA94+Abp+BBB3fl4T+/g+EOcS13ruONSKIPPoMCEEoZSPhgKIxx5XncAWKAiAIG461wvKFuUNAhCBloAaDA2HefRPPsOtxBSdiJoVcJ5UbTzp95H8T4Ae5vPoNduIh6AAAAAElFTkSuQmCC'); }
.row-gap td { background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAElBMVEUpKCBaPCl7UDlaNCCUXUFBKBgMz/1lAAAAVUlEQVR42mWPQQrDAAzDFMX+/5cHa0u31kEngSC8NyaaJMYBTK+zAmm2exIgafbADeDt1wA5vF8E/G0MMN7+3RCI66Phdk8GcOp6UIFp68UA87f38x9rNwKFW4i4kgAAAABJRU5ErkJggg=='); }
.col-hidden, .col-empty { background-color: transparent !important; border: none !important; box-shadow: none !important; }
.th-row td {
  width: var(--cell-size); height: var(--cell-size);
  min-width: var(--cell-size); max-width: var(--cell-size);
  padding: 0; border: 1px solid rgba(255,255,255,.08);
  box-sizing: border-box; border-radius: 0;
  font-family: monospace; font-size: 1em; font-weight: 700;
  color: #0a0e27; text-align: center; line-height: var(--cell-size);
}
.th-p { background-color: rgb(198,198,198); color: #0a0e27; }
.th-n { background-color: rgb(127,63,178); }
.th-a { background-color: rgb(142,33,33); }
.th-b { background-color: rgb(242,127,165); }
.th-g { background-color: rgb(102,127,51); }
.th-y { background-color: rgb(127,204,25); }
.th-c { background-color: rgb(51,52,203); }
.th-d { background-color: rgb(102,153,216); }
.col-p { background-color: rgba(76,76,76,.08); }
.col-n { background-color: rgba(229,229,51,.08); }
.col-a { background-color: rgba(153,51,51,.08); }
.col-b { background-color: rgba(242,127,165,.08); }
.col-g { background-color: rgba(102,127,51,.08); }
.col-y { background-color: rgba(127,204,25,.08); }
.col-c { background-color: rgba(102,153,216,.08); }
.col-d { background-color: rgba(76,127,153,.08); }

.toast { position: fixed; left: 50%; bottom: 40px; transform: translateX(-50%) translateY(20px); background: rgba(10,20,20,.95); border: 1px solid #44dd88; border-radius: 6px; color: #44dd88; font-family: monospace; font-size: .9em; font-weight: 700; letter-spacing: 1px; padding: 12px 24px; box-shadow: 0 8px 24px rgba(0,0,0,.6),0 0 20px rgba(68,221,136,.3); z-index: 10000; opacity: 0; pointer-events: none; transition: opacity .25s ease,transform .25s ease; white-space: nowrap; max-width: 90vw; }
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.toast.error { border-color: #ff6b6b; color: #ff6b6b; }
.toast.warn { border-color: #ffcc44; color: #ffcc44; }

.locked-mode .fc-left .coord-input-group,
.locked-mode .fc-left .pw-group,
.locked-mode .fc-left .yield-wrapper input,
.locked-mode .fc-left .type-buttons { opacity: .35; pointer-events: none; filter: grayscale(0.7); }
.locked-mode .fc-right .value, .locked-mode .integrated-status-bar .status-item { color: #447777; }
</style>
