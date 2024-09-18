<script lang="ts" setup>
import randomColor from 'randomcolor';
import { templateRef } from '@vueuse/core';

const colorMap = [randomColor(), randomColor()];
type UnitData = {
  /**
   * 3=mount
   */
  type: -1 | 0 | 1 | 2 | 3;
  army: number;
  owner: number;
};

type MapData = Record<number, Record<number, UnitData>>;
const map = ref<MapData>({});
function canMoveTo(x: number, y: number) {
  const unit: UnitData | undefined = (map.value[x] || [])[y];
  return unit && unit.type !== 3;
}
const cellSize = ref(40);
const cellSizeStr = computed(() => cellSize.value + 'px');
for (let i = 0; i < 10; i++) {
  map.value[i] = {};
  for (let j = 0; j < 10; j++) {
    map.value[i][j] = {
      type: Math.floor(Math.random() * 4),
      army: Math.floor(Math.random() * 12),
      owner: Math.floor(Math.random() * 2),
    };
    if (map.value[i][j].type === 3) {
      map.value[i][j].owner = -1;
      map.value[i][j].army = 0;
    }
  }
}

function handleScroll(e: WheelEvent) {
  cellSize.value -= e.deltaY / 10;
  if (cellSize.value < 30) {
    cellSize.value = 30;
  }
}

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

function addClass(i: number, j: number) {
  const ele = (table.value as HTMLTableElement).rows[i].cells[j];
  ele.classList.add();
}

function removeClass(i: number, j: number) {
  const ele = (table.value as HTMLTableElement).rows[i].cells[j];
  ele.classList.add();
}

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
  const map = {
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
  }
}

onMounted(() => {
  window.addEventListener('keydown', keyDown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', keyDown);
});
</script>

<template>
  <div
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
              Math.abs(Number(x) - cursorX) + Math.abs(Number(y) - cursorY) ===
                1 && canMoveTo(x, y),
            cursor: Number(x) === cursorX && Number(y) === cursorY,
            'bg-obstacle': unit.type === -1,
            'bg-city': unit.type === 1,
            'bg-crown': unit.type === 2,
            'bg-mount': unit.type === 3,
            'bg-swamp': unit.type === 4,
          }"
          :style="{
            backgroundColor: colorMap[unit.owner],
          }"
          class="border"
          @click="clickSlot(x, y, $event)"
        >
          <template v-if="unit.army">
            {{ unit.army }}
          </template>
        </td>
      </tr>
    </table>
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
