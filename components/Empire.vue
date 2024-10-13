<!--suppress CssUnusedSymbol -->
<script lang="ts" setup>
import randomColor from 'randomcolor';
import { templateRef, useInterval } from '@vueuse/core';

const props = defineProps<{
  token: string;
  state?: GameState;
}>();

const fatalError = ref('');
type GameState = 'wait' | 'prepare' | 'play' | 'finish' | 'spectate';
const state = ref<GameState>(props.state ?? 'wait');
const room = ref({
  id: 0,
  created: 0,
  started: 0,
});
const turn = ref(0);

const address = // fuck you nuxt
  import.meta.dev
    ? `ws://${location.hostname}:10005/ws/generals/play?auth=${props.token}`
    : 'wss://ws.redenmc.com:20443/ws/generals/play?auth=' + props.token;
const playersWaiting = ref({
  total: 0,
  forceStart: 0,
});
const forceStartMe = ref(false);

let ws: WebSocket;
onUnmounted(() => {
  ws.close();
});
type Move = {
  type: 'mv';
  f: [number, number];
  t: [number, number];
  h: boolean;
};
type Direction = 'up' | 'down' | 'left' | 'right';
type QueueItem = {
  from: [number, number];
  d: Direction;
};

const moveQueue = ref<QueueItem[]>([]);
const moveQueueDisplay = computed<Record<number, Record<number, Direction[]>>>(
  (oldValue) => {
    let ret: Record<number, Record<number, Direction[]>> = {};
    for (let move of moveQueue.value) {
      if (!ret[move.from[0]]) ret[move.from[0]] = {};
      if (!ret[move.from[0]][move.from[1]])
        ret[move.from[0]][move.from[1]] = [];
      if (!ret[move.from[0]][move.from[1]].includes(move.d)) {
        ret[move.from[0]][move.from[1]].push(move.d);
      }
    }
    return ret;
  },
);
if (import.meta.client) {
  console.log('moveQueue init', [...moveQueue.value]);
  watch(moveQueue, (val) => {
    console.log('moveQueue', [...val]);
  });
}
const colorMap = ref<string[]>([randomColor(), randomColor()]);
const nameMap = ref<string[]>([]);
type UnitData = {
  /**
   * 3=mount
   */
  t: -1 | 0 | 1 | 2 | 3 | 4;
  a: number;
  o: number;
};

const map = ref<UnitData[][]>([]);
const myIndex = ref(-210);
const leaderboard = ref<
  {
    a: number;
    c: number;
    l: number;
    name: string;
    color: string;
  }[]
>([]);
const visible = ref<boolean[][]>([]);

function canMoveTo(x: number, y: number) {
  const unit: UnitData | undefined = (map.value[x] || [])[y];
  return unit && unit.t !== 3;
}

const cellSize = ref(40);
const cellSizeStr = computed(() => `${cellSize.value}px`);
const textSizeStr = computed(() => `${cellSize.value / 3}px`);
for (let i = 0; i < 10; i++) {
  map.value[i] = [];
  for (let j = 0; j < 10; j++) {
    map.value[i][j] = {
      t: Math.floor(Math.random() * 4) as UnitData['t'],
      a: Math.floor(Math.random() * 12),
      o: Math.floor(Math.random() * 2),
    };
    if (map.value[i][j].t === 3) {
      map.value[i][j].o = -1;
      map.value[i][j].a = 0;
    }
  }
}

function handleScroll(e: WheelEvent) {
  cellSize.value -= e.deltaY / 10;
  if (cellSize.value < 30) {
    cellSize.value = 30;
  }
}

onMounted(() => {
  ws = new WebSocket(address);
  ws.onopen = () => {
    if (import.meta.dev) {
      console.log('ws: open');
    }
    let updateTime = 0;
    ws.onmessage = (event) => {
      if (import.meta.dev) {
        console.log('ws:', event.data);
      }
      const time = Date.now();
      const packet = JSON.parse(event.data);
      switch (packet.type) {
        case 'w':
          playersWaiting.value.total = packet.t;
          playersWaiting.value.forceStart = packet.f;
          break;
        case 'r':
          room.value.id = packet.i;
          room.value.created = packet.t;
          break;
        case 'p':
          room.value.started = packet.t;
          colorMap.value = packet.c;
          nameMap.value = packet.p;
          myIndex.value = packet.i;
          state.value = 'prepare';
          break;
        case 'm':
          visible.value = [];
          map.value = [];

          for (let i = 0; i < packet.h; i++) {
            map.value[i] = [];
            visible.value[i] = [];
            for (let j = 0; j < packet.w; j++) {
              visible.value[i][j] = false;
              map.value[i][j] = {
                t: 0,
                a: 0,
                o: -1,
              };
              if ((packet.o as number[]).indexOf(packet.w * i + j) !== -1) {
                map.value[i][j].t = -1;
              }
            }
          }
          state.value = 'play';
          break;
        case 'u':
          if (import.meta.dev) {
            // console.log('更新间隔:', Date.now() - updateTime);
            updateTime = Date.now();
          }
          turn.value = Math.ceil(packet.t / 2);
          const units: (UnitData & { p: number })[] = packet.s;
          for (let item of units) {
            const i = Math.floor(item.p / map.value[0].length);
            const j = item.p % map.value[0].length;
            // console.log(item, 'mapSize', map.value.length, map.value[0].length, 'pos', i, j)
            map.value[i][j] = item;
            if (item.o == myIndex.value) {
              for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                  const x = i + dx;
                  const y = j + dy;
                  if (visible.value[x] && visible.value[x][y] === false) {
                    visible.value[x][y] = true;
                  }
                }
              }
            }
          }
          const discard: number[] = packet.d;
          for (let pos of discard) {
            const i = Math.floor(pos / map.value[0].length);
            const j = pos % map.value[0].length;
            // console.log(item, 'mapSize', map.value.length, map.value[0].length, 'pos', i, j)
            map.value[i][j] = {
              ...map.value[i][j],
              a: 0,
              o: -1,
            };
            visible.value[i][j] = false;
          }
          break;
        case 'l':
          const list: {
            a: number;
            c: number;
            l: number;
            color: string;
            name: string;
          }[] = packet.d;
          for (let i in list) {
            if (!list[i]) {
              list[i] = {
                a: 0,
                c: 0,
                l: 0,
                color: '',
                name: '',
              };
            }
            list[i].color = colorMap.value[i];
            list[i].name = nameMap.value[i];
          }
          list.sort((a, b) => b.a - a.a);
          leaderboard.value = list;
          break;
        case 'q':
          if (packet.s === 0) {
            moveQueue.value = [];
          } else {
            // moveQueue.value = moveQueue.value.slice(-packet.s as number);
            let left = moveQueue.value.length - packet.s;
            while (left >= 0) {
              if (
                moveQueue.value[left].from[0] != packet.x ||
                moveQueue.value[left].from[1] != packet.y
              ) {
                left--;
              } else {
                break;
              }
            }
            moveQueue.value = moveQueue.value.slice(left);
          }
          break;
        case '1':
          alert('您赢了！');
          moveQueue.value = [];
          state.value = 'finish';
          break;
        case '0':
          const name = nameMap.value[packet.k];
          moveQueue.value = [];
          state.value = 'finish';
          alert(`你被${name}杀死了`);
          break;
      }
      if (import.meta.dev) {
        console.log('网络耗时:', Date.now() - time);
      }
    };
    ws.onclose = (event) => {
      console.log('ws: close', event);
      fatalError.value = '连接断开 ' + event.code + ' ' + event.reason;
      if (event.code == 401) {
        toastError(
          {
            error: 'Please refresh this page and try again.',
          },
          'Authorization failed',
        );
      }
    };
  };
});

const container = templateRef('container');
const table = templateRef('table');

const mouseDown = ref(false);
const half = ref(false);
let dragged = false;
const xOffset = ref(0);
const yOffset = ref(0);
/**
 * based on {@link MouseEvent.clientX} and {@link MouseEvent.clientY}
 * @type {[number, number]}
 */
let mousePrevPosition: [number, number] = [0, 0];
/**
 * mobile only, for scaling
 */
let touchPointPrevDistance = 1;

function drag(clientX: number, clientY: number) {
  if (!mouseDown.value) return;
  if (
    !dragged &&
    Math.hypot(clientX - mousePrevPosition[0], clientY - mousePrevPosition[1]) <
      0.3
  )
    return;
  dragged = true;
  cursorX.value = -1;
  cursorY.value = -1;
  xOffset.value += clientX - mousePrevPosition[0];
  yOffset.value += clientY - mousePrevPosition[1];
  mousePrevPosition[0] = clientX;
  mousePrevPosition[1] = clientY;
  (table.value as HTMLElement).style.left = xOffset.value + 'px';
  (table.value as HTMLElement).style.top = yOffset.value + 'px';
}

let cursorX = ref(-1);
let cursorY = ref(-1);

function clickSlot(x: number, y: number, ev?: MouseEvent | KeyboardEvent) {
  if (state.value != 'play') return;
  ev?.preventDefault();
  x = Number(x);
  y = Number(y);
  // this event fires last
  if (dragged) {
    dragged = false;
    return;
  }
  if (import.meta.dev) {
    console.log('cursor@', cursorX.value, cursorY.value, 'click@', x, y);
  }
  if (!canMoveTo(x, y)) {
    if (import.meta.dev) {
      console.log('reset-invalid');
    }
    cursorX.value = -1;
    cursorY.value = -1;
    return;
  }
  if (cursorX.value !== -1 && cursorX.value !== -1) {
    if (x == cursorX.value && y == cursorY.value) {
      half.value = !half.value;
    } else if (
      Math.abs(x - cursorX.value) + Math.abs(y - cursorY.value) ===
      1
    ) {
      let d: Direction = 'up';
      if (x === cursorX.value - 1) {
        d = 'up';
      } else if (x === cursorX.value + 1) {
        d = 'down';
      } else if (y === cursorY.value - 1) {
        d = 'left';
      } else if (y === cursorY.value + 1) {
        d = 'right';
      }
      if (import.meta.dev) {
        console.log(d);
      }
      const move: Move = {
        type: 'mv',
        h: half.value,
        f: [cursorX.value, cursorY.value],
        t: [x, y],
      };
      half.value = false;
      moveQueue.value.push({
        from: [cursorX.value, cursorY.value],
        d,
      });
      ws.send(JSON.stringify(move));
      cursorX.value = x;
      cursorY.value = y;
    } else if (map.value[x][y].o == myIndex.value) {
      cursorX.value = x;
      cursorY.value = y;
    } else {
      cursorX.value = -1;
      cursorY.value = -1;
    }
  } else {
    cursorX.value = x;
    cursorY.value = y;
  }
}

function keyDown(ev: KeyboardEvent) {
  const map: Record<string, number[]> = {
    ArrowUp: [-1, 0],
    w: [-1, 0],
    ArrowDown: [1, 0],
    s: [1, 0],
    ArrowLeft: [0, -1],
    a: [0, -1],
    ArrowRight: [0, 1],
    d: [0, 1],
  };
  console.log(ev.key in map, ev.key);
  if (ev.key in map) {
    ev.preventDefault();
    if (
      canMoveTo(cursorX.value + map[ev.key][0], cursorY.value + map[ev.key][1])
    ) {
      clickSlot(
        cursorX.value + map[ev.key][0],
        cursorY.value + map[ev.key][1],
        ev,
      );
    }
  } else if (ev.key == 'q') {
    ev.preventDefault();
    ws.send(JSON.stringify({ type: 'cm' }));
  } else if (ev.key == 'z') {
    ev.preventDefault();
    half.value = !half.value;
  } else if (ev.key == ' ') {
    ev.preventDefault();
    cursorX.value = -1;
    cursorY.value = -1;
  }
}

function toggleForceStart() {
  forceStartMe.value = !forceStartMe.value;
  ws.send(
    JSON.stringify({
      type: 'fs',
      b: forceStartMe.value,
    }),
  );
}

const timer = useInterval(500);

onMounted(() => {
  window.addEventListener('keydown', keyDown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', keyDown);
});
</script>

<template>
  <div class="position-relative">
    <v-empty-state v-if="state === 'wait'">
      <template #headline> 等待游戏开始</template>
      <template #title> {{ playersWaiting.total }} / 8</template>
      <template #text>
        还剩
        {{
          void timer || Math.ceil((room.created + 90000 - Date.now()) / 1000)
        }}
        秒
      </template>
      <template #actions>
        <v-btn
          :color="forceStartMe ? 'error' : 'primary'"
          @click="toggleForceStart"
        >
          <template v-if="forceStartMe"> 取消</template>
          强制开始
          {{ playersWaiting.forceStart }} /
          {{ Math.max(2, Math.ceil((playersWaiting.total * 3) / 4)) }}
        </v-btn>
      </template>
    </v-empty-state>
    <div
      v-if="state === 'play' || state === 'finish'"
      ref="container"
      class="w-100 d-flex justify-center container position-relative"
      @wheel.prevent.stop="handleScroll"
      @mousedown.prevent="
        (e) => {
          mouseDown = true;
          mousePrevPosition = [e.clientX, e.clientY];
        }
      "
      @touchstart="
        (e) => {
          if (e.touches.length == 1) {
            mouseDown = true;
            mousePrevPosition = [e.touches[0].clientX, e.touches[0].clientY];
          } else if (e.touches.length == 2) {
            touchPointPrevDistance = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY,
            );
          }
        }
      "
      @mouseup.prevent="mouseDown = false"
      @mousemove.prevent="(e) => drag(e.clientX, e.clientY)"
      @touchmove.prevent="
        (e) => {
          if (e.touches.length == 1) {
            drag(e.touches[0].clientX, e.touches[0].clientY);
          } else if (e.touches.length == 2) {
            const distance = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY,
            );
            cellSize = Math.max(
              30,
              cellSize * (distance / touchPointPrevDistance),
            );
            touchPointPrevDistance = distance;
          }
        }
      "
      @touchend="mouseDown = false"
    >
      <table ref="table" class="position-relative map">
        <tr v-for="(row, x) in map" :key="x">
          <td
            v-for="(unit, y) in row"
            :key="y"
            :class="{
              'cursor-around':
                Math.abs(Number(x) - cursorX) +
                  Math.abs(Number(y) - cursorY) ===
                  1 && canMoveTo(x, y),
              cursor: Number(x) === cursorX && Number(y) === cursorY,
              'bg-obstacle': unit.t === -1,
              'bg-city': unit.t === 1,
              'bg-crown': unit.t === 2,
              'bg-mount': unit.t === 3,
              'bg-swamp': unit.t === 4,
            }"
            :style="{
              backgroundColor:
                colorMap[unit.o] ?? (visible[x][y] ? '#cccccc' : undefined),
            }"
            class="border"
            @click="clickSlot(x, y, $event)"
          >
            <template v-if="x == cursorX && y == cursorY && half">
              50%
            </template>
            <template v-else-if="unit.a">
              {{ unit.a }}
            </template>

            <template
              v-if="
                moveQueueDisplay[Number(x)] &&
                moveQueueDisplay[Number(x)][Number(y)]
              "
            >
              <template
                v-for="step in moveQueueDisplay[Number(x)][Number(y)]"
                :key="step"
              >
                <div v-if="step == 'up'" :class="`arrow-${step}`">↑</div>
                <div v-else-if="step == 'down'" :class="`arrow-${step}`">↓</div>
                <div v-else-if="step == 'left'" :class="`arrow-${step}`">←</div>
                <div v-else-if="step == 'right'" :class="`arrow-${step}`">
                  →
                </div>
              </template>
            </template>
          </td>
        </tr>
      </table>

      <div class="position-absolute top-0 left-0" title="top-left">
        <v-sheet border elevation="4">
          <div class="pa-2 text-h6">回合数:{{ turn }}</div>
        </v-sheet>
      </div>

      <div class="position-absolute top-0 right-0" title="top-right">
        <v-sheet elevation="4">
          <table class="leaderboard">
            <thead>
              <tr>
                <td></td>
                <td>兵</td>
                <td>城</td>
                <td>地</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in leaderboard" :key="item.color">
                <td
                  :style="{
                    backgroundColor: item.color,
                  }"
                >
                  {{ item.name }}
                </td>
                <td>{{ item.a }}</td>
                <td>{{ item.c }}</td>
                <td>{{ item.l }}</td>
              </tr>
            </tbody>
          </table>
        </v-sheet>
      </div>
    </div>
    <v-alert
      v-if="fatalError"
      class="position-absolute top-0 left-0"
      dismissible
      type="error"
    >
      致命错误: {{ fatalError }}
    </v-alert>
  </div>
</template>

<style scoped>
table.map td {
  width: v-bind(cellSizeStr);
  height: v-bind(cellSizeStr);
  min-width: v-bind(cellSizeStr);
  min-height: v-bind(cellSizeStr);
  max-width: v-bind(cellSizeStr);
  max-height: v-bind(cellSizeStr);
  font-size: v-bind(textSizeStr);
  background-size: cover;
  background-color: dimgray;
  text-shadow: 0 0 2px black;
  box-sizing: border-box;
  text-align: center;
  overflow: hidden;
  padding: 0;
  position: relative;
  cursor: default;
  user-select: none;
  text-overflow: ellipsis;
}

table.leaderboard {
  border-spacing: 10px 0;
  text-align: center;
}

table.map {
  border-spacing: 0;
}

.container {
  touch-action: pan-y;
  max-height: 90vh;
  overflow: clip;
}

html,
body {
  overscroll-behavior: none;
}

td.cursor-around {
  cursor: pointer;
  opacity: 0.7;
  border: 1px solid black !important;
}

td.cursor {
  cursor: pointer;
  border: 3px solid white !important;
}

.bg-city {
  background-image: url('/image/generals/city.png');
}

.bg-crown {
  background-image: url('/image/generals/crown.png');
}

.bg-mount {
  background-image: url('/image/generals/mountain.png');
}

.bg-obstacle {
  background-image: url('/image/generals/obstacle.png');
}

.bg-swamp {
  background-image: url('/image/generals/swamp.png');
}

.arrow-left {
  left: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.arrow-right {
  right: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.arrow-up {
  top: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.arrow-down {
  bottom: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>
