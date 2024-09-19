<script lang="ts" setup>
import randomColor from 'randomcolor';
import { templateRef, useInterval } from '@vueuse/core';
const router = useRouter();

const props = defineProps<{
  token: string;
}>();

const fatalError = ref('');
type GameState = 'wait' | 'prepare' | 'play' | 'finish';
const state = ref<GameState>('wait');
const room = ref({
  id: 0,
  created: 0,
  started: 0
});

const address = // fuck you nuxt
  import.meta.dev
    ? 'ws://localhost:10005/ws/generals/play?auth=' + props.token
    : '/ws/generals/play?auth=' + props.token;
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

const colorMap = ref<string[]>([randomColor(), randomColor()]);
type UnitData = {
  /**
   * 3=mount
   */
  t: -1 | 0 | 1 | 2 | 3 | 4;
  a: number;
  o: number;
};

const map = ref<UnitData[][]>([]);
function canMoveTo(x: number, y: number) {
  const unit: UnitData | undefined = (map.value[x] || [])[y];
  return unit && unit.t !== 3;
}
const cellSize = ref(40);
const cellSizeStr = computed(() => cellSize.value + 'px');
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
  ws.onopen = (event) => {
    console.log('ws: open');
    // setInterval(() => {
    //   ws.send('发送测试')
    // }, 100)
    ws.onmessage = (event) => {
      console.log('ws:', event.data);
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
          state.value = 'prepare';
          break;
        case 'm':
          map.value = []
          for (let i = 0; i < packet.w; i++) {
            map.value[i] = [];
            for (let j = 0; j < packet.h; j++) {
              map.value[i][j] = {
                t: 0, a: 0, o: -1
              }
              if ((packet.o as number[]).indexOf(packet.w * i + j) !== -1) {
                map.value[i][j].t = -1;
              }
            }
          }
          state.value = 'play';
          break;
        case 'u':
          // todo: packet.d
          const units: (UnitData & { p: number })[] = packet.s
          for (let item of units) {
            const i = Math.floor(item.p / map.value[0].length);
            const j = item.p % map.value[0].length;
            // console.log(item, 'mapSize', map.value.length, map.value[0].length, 'pos', i, j)
            map.value[i][j] = item;
          }
          const discard: number[] = packet.d
          for (let pos of discard) {
            const i = Math.floor(pos / map.value[0].length);
            const j = pos % map.value[0].length;
            // console.log(item, 'mapSize', map.value.length, map.value[0].length, 'pos', i, j)
            map.value[i][j] = {
              ...map.value[i][j],
              a: 0,
              o: -1,
            }
          }
          break;
      }
    };
    ws.onclose = (event) => {
      console.log('ws: close', event);
      fatalError.value = event.code + ' ' + event.reason;
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

const tableHeightStr = computed(
  () => (table.value as HTMLElement)?.clientHeight + 'px',
);
const isDragging = ref(false);
let dragged = false;
const xOffset = ref(0);
const yOffset = ref(0);

function drag(e: MouseEvent) {
  if (!isDragging.value) return;
  if (!dragged && e.movementX < 1 && e.movementY < 1) return;
  dragged = true;
  cursorX.value = -1;
  cursorY.value = -1;
  xOffset.value += e.movementX;
  yOffset.value += e.movementY;
  (table.value as HTMLElement).style.left = xOffset.value + 'px';
  (table.value as HTMLElement).style.top = yOffset.value + 'px';
}

let cursorX = ref(-1);
let cursorY = ref(-1);

function clickSlot(x: number, y: number, ev?: MouseEvent | KeyboardEvent) {
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
    if (Math.abs(x - cursorX.value) + Math.abs(y - cursorY.value) === 1) {
      if (import.meta.dev) {
        if (x === cursorX.value - 1) {
          console.log('up');
        } else if (x === cursorX.value + 1) {
          console.log('down');
        } else if (y === cursorY.value - 1) {
          console.log('left');
        } else if (y === cursorY.value + 1) {
          console.log('right');
        }
      }
      const move: Move = {
        type: 'mv',
        h: false,
        f: [cursorX.value, cursorY.value],
        t: [x, y],
      };
      ws.send(JSON.stringify(move));
      console.log(JSON.stringify(move))
      cursorX.value = x;
      cursorY.value = y;
    } else {
      if (import.meta.dev) {
        console.log('reset');
      }
      cursorX.value = -1;
      cursorY.value = -1;
    }
  } else {
    if (import.meta.dev) {
      console.log('set', x, y);
    }
    cursorX.value = x;
    cursorY.value = y;
  }
}

function keyDown(ev: KeyboardEvent) {
  const map: Record<string, number[]> = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
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
    ws.send(JSON.stringify({ type: 'cm' }))
  } else if (ev.key == 'z') {
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

const timer = useInterval(500)

onMounted(() => {
  window.addEventListener('keydown', keyDown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', keyDown);
});
</script>

<template>
  <v-alert v-if="fatalError" type="error" dismissible>
    Fatal Error: {{ fatalError }}
  </v-alert>
  <div v-else>
    <v-empty-state v-if="state === 'wait'">
      <template #headline> 等待游戏开始 </template>
      <template #title> {{ playersWaiting.total }} / 8 </template>
      <template #text>
        还剩 {{ (void timer) || Math.ceil((room.created + 90000 - Date.now()) / 1000) }} 秒
      </template>
      <template #actions>
        <v-btn
          :color="forceStartMe ? 'error' : 'primary'"
          @click="toggleForceStart"
        >
          <template v-if="forceStartMe"> 取消 </template>
          强制开始
          {{ playersWaiting.forceStart }} /
          {{ Math.max(2, Math.ceil((playersWaiting.total * 3) / 4)) }}
        </v-btn>
      </template>
    </v-empty-state>
    <div
      v-if="state === 'play' || state === 'finish'"
      ref="container"
      class="w-100 d-flex justify-center container"
      @wheel.prevent.stop="handleScroll"
      @mousemove.prevent="drag"
      @mousedown.prevent="isDragging = true"
      @mouseup.prevent="isDragging = false"
    >
      <table ref="table" class="position-relative">
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
              backgroundColor: colorMap[unit.o],
            }"
            class="border"
            @click="clickSlot(x, y, $event)"
          >
            <template v-if="unit.a">
              {{ unit.a }}
            </template>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
td {
  width: v-bind(cellSizeStr);
  height: v-bind(cellSizeStr);
  min-width: v-bind(cellSizeStr);
  min-height: v-bind(cellSizeStr);
  max-width: v-bind(cellSizeStr);
  max-height: v-bind(cellSizeStr);
  background-size: cover;
  background-color: dimgray;
  box-sizing: border-box;
  text-align: center;
  overflow: hidden;
  padding: 0;
  cursor: default;
}

table {
  border-spacing: 0;
}

.container {
  touch-action: pan-y;
  max-height: 90vh;
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
</style>
