import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';
import * as native from '../utils/pearl-cannon/core.mjs';
const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const html = await read('../public/generators/pearl-cannon-v9.2.html');
const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
const core = script.slice(0, script.indexOf('// Standalone browser UI.'));
const original = await import(
  `data:text/javascript;base64,${Buffer.from(core).toString('base64')}`
);
const template = await native.loadBundledTemplate();
test('v9.2 Yueyue asset is the supplied PNG', async () => {
  const png = await readFile(new URL('../public/generators/pearl-cannon-yueyue.png', import.meta.url));
  assert.equal(createHash('sha256').update(png).digest('hex'), 'b73f2d265201f54460faa9b1da647ede85527e40b6b6625660d054bda06a7ff3');
});
test('native engine preserves the complete shipped v9.2 core verbatim', async () => {
  const source = await read('../utils/pearl-cannon/core.mjs');
  assert.equal(source.slice(0, core.length), core);
  assert.equal(source.slice(core.length).match(/export function/g)?.length, 1);
});
test('native exports match standalone exports in all quadrants and threshold cases', async () => {
  for (const [x, z] of [
    ['100', '422'],
    ['-100', '422'],
    ['100', '-422'],
    ['-100', '-422'],
    ['20', '-422'],
    ['-20', '21.1'],
    ['-20', '422'],
    ['0', '-21.1'],
    ['21.1', '0'],
    ['6773.09999', '422'],
    ['6773.1', '-422'],
    ['-654', '8092'],
    ['12702.2', '-42.2'],
    ['13504', '13504'],
    ['13504', '0'],
    ['-13504', '-13504'],
  ]) {
    const a = native.buildCannon(template, x, z),
      b = original.buildCannon(template, x, z);
    const options = {
      allowExperimentalRotation: true,
      dataVersion: 4556,
      timestamp: 0,
    };
    assert.deepEqual(
      await native.exportLitematic(a, options),
      await original.exportLitematic(b, options),
    );
  }
});
test('saved v9.2 schematics retain blocks, entities and far supports', async () => {
  for (const [x, z, supports] of [
    ['100', '422', 0], ['20', '-422', 0], ['-20', '21.1', 0],
    ['6773.0999', '422', 0], ['6773.1', '422', 1],
    ['422', '6773.1', 1],
    ['-654', '8092', 1], ['12702.2', '-42.2', 1],
    ['13504', '13504', 2], ['-13504', '-13504', 2], ['13504', '0', 1],
  ]) {
    const result = native.buildCannon(template, x, z);
    const bytes = await native.exportLitematic(result, {
      allowExperimentalRotation: true, dataVersion: 4556, timestamp: 0,
    });
    const decoded = native.decodeNBT(await native.inflate(bytes));
    const saved = native.inspectLitematicRoot(decoded.root);
    assert.equal(native.value(decoded.root, 'MinecraftDataVersion'), 4556);
    assert.equal(saved.blocks.size, result.blocks.size, `${x}/${z} block count`);
    for (const [key, block] of result.blocks) {
      const actual = saved.blocks.get(key);
      assert.equal(native.testing.stateKey(actual?.state), native.testing.stateKey(block.state), `${x}/${z} ${key}`);
      if (block.tile) {
        const region = saved.regions.find((r) => r.blocks.has(key));
        assert.ok(region, `${x}/${z} region ${key}`);
        for (const [index, axis] of ['x', 'y', 'z'].entries())
          assert.equal(actual.tile[axis][1] + region.position[axis], block.p[index], `${x}/${z} tile position ${key}`);
        const withoutPosition = (tile) => Object.fromEntries(Object.entries(tile).filter(([field]) => !['x', 'y', 'z'].includes(field)));
        assert.deepEqual(withoutPosition(actual.tile), withoutPosition(block.tile), `${x}/${z} tile data ${key}`);
      } else assert.equal(actual?.tile, undefined, `${x}/${z} unexpected tile ${key}`);
    }
    const count = (name) => [...saved.blocks.values()].filter((b) => b.state.Name === `minecraft:${name}`).length;
    assert.equal(count('tnt'), result.plan.counts.structureTotal, `${x}/${z} TNT`);
    assert.equal(count('enchanting_table'), supports, `${x}/${z} far supports`);
    assert.equal(result.materials['minecraft:enchanting_table'] ?? 0, supports);
    assert.ok([...saved.blocks.values()].filter((b) => b.state.Name === 'minecraft:enchanting_table').every((b) => !b.tile));
    if (x === '6773.1' && z === '422')
      assert.equal(saved.blocks.get('60,38,6')?.state.Name, 'minecraft:enchanting_table');
    if (x === '422' && z === '6773.1')
      assert.equal(saved.blocks.get('12,38,52')?.state.Name, 'minecraft:enchanting_table');
    if (x === '13504' && z === '13504')
      for (const key of ['60,38,6', '12,38,52'])
        assert.equal(saved.blocks.get(key)?.state.Name, 'minecraft:enchanting_table');
  }
  for (const [x, z] of [['13525.1', '422'], ['0', '0']]) {
    assert.throws(() => native.buildCannon(template, x, z));
  }
});
test('native page has one displacement entry point with no embedded panel or nested form', async () => {
  const page = await read('../pages/litematica/[name].vue');
  const generic = await read(
    '../components/litematica/LitematicaGenDownloader.vue',
  );
  const ui = await read('../components/litematica/PearlCannonDownloader.vue');
  assert.ok(!page.includes('<PearlCannonGenerator'));
  assert.ok(generic.includes("selected.key === '91tvzzp1'"));
  assert.match(generic, /<v-form\s+v-else/);
  assert.ok(!ui.includes('<iframe'));
  assert.ok(!ui.includes('<v-form'));
  assert.ok(ui.includes('class="main"') && ui.includes('class="pearl-tool"'));
  assert.ok(ui.includes('pearl-x') && ui.includes('pearl-z'));
  assert.equal((ui.match(/id="pearl-x"/g) ?? []).length, 1);
  assert.equal((ui.match(/id="pearl-z"/g) ?? []).length, 1);
  assert.ok(page.includes("machineId === '91tvzzp1' ? 12 : 4"));
  assert.ok(
    generic.includes('SizeInput') && generic.includes('xSize=${xSize.value}'),
  );
});
test('native form retains warnings, all export actions, and exact-decimal string inputs', async () => {
  const ui = await read('../components/litematica/PearlCannonDownloader.vue');
  for (const action of [
    'exportLitematic',
    'exportReport',
    'exportCSV',
    'original',
    'needsExperimentalConsent',
    'knownRuntimeIssue',
    'dataVersion',
    'PearlCannonPreview',
  ])
    assert.ok(ui.includes(action), action);
  assert.ok(!ui.includes('v-model.number'));
  assert.ok(ui.includes('accepted.value = false'));
  const messages = await read('../utils/pearl-cannon/messages.ts');
  assert.ok(messages.includes('X方向位移') && messages.includes('Z方向位移'));
  const preview = await read('../components/litematica/PearlCannonPreview.vue');
  assert.match(preview, /92, 93, 97, 38, 35, 31, 5/);
  assert.ok(preview.includes('#17251f'));
  assert.ok(ui.includes('onUnmounted') && ui.includes('clearTimeout(greetingTimer)'));
  assert.ok(ui.includes('pearl-cannon-yueyue.png'));
});
