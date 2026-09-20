import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import * as native from '../utils/pearl-cannon/core.mjs';
const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const html = await read('../public/generators/pearl-cannon-v9.html');
const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
const core = script.slice(0, script.indexOf('// Standalone browser UI.'));
const original = await import(
  `data:text/javascript;base64,${Buffer.from(core).toString('base64')}`
);
const template = await native.loadBundledTemplate();
test('native engine preserves the complete shipped v9 core verbatim', async () => {
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
    ['-20', '422'],
    ['0', '-21.1'],
    ['21.1', '0'],
    ['6773.09999', '422'],
    ['6773.1', '-422'],
    ['13504', '0'],
    ['-13504', '-13504'],
    ['12702.2', '-42.2'],
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
  assert.ok(ui.includes('variant="underlined"'));
  assert.ok(ui.includes('pearl-x') && ui.includes('pearl-z'));
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
  assert.ok(preview.includes('currentColor'));
});
