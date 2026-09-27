import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// The Vue page and tests consume the same complete v9.2 engine.
const c = await import('../utils/pearl-cannon/core.mjs');
const template = await c.loadBundledTemplate();

const samples = [
  ['0', 0],
  ['21.0999999999', 0],
  ['21.1', 1],
  ['100', 2],
  ['6752', 160],
  ['6773.0999999999', 160],
  ['6773.1', 161],
  ['10000', 237],
  ['13504', 320],
  ['13525.099999', 320],
];
test('exact decimal thresholds and symmetric half-away-from-zero rounding', () => {
  for (const [input, expected] of samples) {
    assert.equal(c.nearestTNT(input), expected);
    assert.equal(c.nearestTNT(`-${input}`), expected === 0 ? 0 : -expected);
  }
  for (const value of ['', 'abc', 'NaN', 'Infinity', '13525.1', '-13525.1']) {
    assert.throws(() => c.makePlan(value, '422'));
  }
});

test('every single-axis count omits the other bank and its propulsion row', () => {
  for (let n = 1; n <= 320; n++) {
    for (const [x, z] of [
      [n, 0],
      [-n, 0],
      [0, n],
      [0, -n],
    ]) {
      const r = c.buildCannon(template, c.exactDistance(x), c.exactDistance(z));
      const boost = Math.ceil(n / 160) * 10;
      assert.equal(r.materials['minecraft:tnt'], n + boost);
      assert.equal(r.plan.counts.propulsion, boost);
      assert.deepEqual(r.plan.omittedAxes, x === 0 ? ['x'] : ['z']);
      assert.ok(r.rows.every((row) => !r.plan.banks[row.wing].omitted));
      assert.ok(r.rows.every((row) => row.role === 'propulsion' || row.kept > 0));
      for (const row of r.rows) {
        const positions = row.outputPositions ?? row.positions;
        const blocks = positions.map((p) => r.blocks.get(p.join(',')));
        assert.equal(
          blocks.filter((b) => b?.state.Name === 'minecraft:tnt').length,
          row.kept,
        );
      }
    }
  }
});
test('two arrays, glass trimming and original option overrides remain available', () => {
  const r = c.buildCannon(template, '6773.1', '-422');
  assert.equal(r.plan.counts.x, 161);
  assert.equal(r.plan.counts.z, -10);
  assert.equal(r.plan.counts.structureTotal, 201);
  assert.ok(r.plan.emptyRowRemoval.rows.length > 0);
  assert.ok(!r.rows.some((row) => row.role === 'pearl' && row.kept === 0));
  assert.equal(
    c.buildCannon(template, '20', '-422').materials['minecraft:tnt'],
    20,
  );
  assert.equal(
    c.buildCannon(template, '20', '-422', { omitZeroAxes: false }).materials[
      'minecraft:tnt'
    ],
    30,
  );
  assert.equal(
    c.buildCannon(template, '6773.1', '-422', { removeEmptyRows: false }).plan
      .emptyRowRemoval.removedBlocks,
    0,
  );
});

test('ordinary arrays omit only fully glass terminal row modules', () => {
  for (const [x, z, expectedRows] of [
    ['42.2', '0', 1],
    ['422', '0', 1],
    ['464.2', '0', 0],
    ['886.2', '0', 1],
    ['100', '422', 2],
    ['-100', '422', 2],
    ['100', '-422', 2],
    ['-100', '-422', 2],
    ['6752', '0', 0],
    ['6773.1', '422', 2],
  ]) {
    const full = c.buildCannon(template, x, z, { removeEmptyRows: false });
    const lean = c.buildCannon(template, x, z);
    const removal = lean.plan.emptyRowRemoval;
    assert.equal(removal.rows.length, expectedRows, `${x}/${z} removed rows`);
    assert.equal(removal.removedBlocks, full.blocks.size - lean.blocks.size);
    assert.equal(lean.materials['minecraft:tnt'], full.materials['minecraft:tnt']);
    for (const row of removal.rows) {
      assert.equal(row.kept, 0);
      assert.equal(row.positions.length, 10);
      if (!x.startsWith('-') && !z.startsWith('-'))
        assert.ok(row.positions.every((p) => !lean.blocks.has(p.join(','))));
      const active = lean.rows.filter(
        (r) => r.role === 'pearl' && r.wing === row.wing &&
          (r.arrayIndex ?? 1) === (row.arrayIndex ?? 1),
      );
      assert.ok(active.every((r) => r.row < row.row), `${x}/${z} terminal row`);
    }
    const removed = new Set([...full.blocks.keys()].filter((key) => !lean.blocks.has(key)));
    assert.equal(removed.size, removal.removedBlocks);
    if (!x.startsWith('-') && !z.startsWith('-'))
      assert.deepEqual(removed, new Set(removal.rows.flatMap((row) => row.removedPositions.map((p) => p.join(',')))));
    for (const [key, block] of full.blocks) {
      const kept = lean.blocks.get(key);
      if (removed.has(key)) assert.equal(kept, undefined, `${x}/${z} ${key}`);
      else {
        assert.ok(kept, `${x}/${z} retained ${key}`);
        assert.equal(c.testing.stateKey(kept.state), c.testing.stateKey(block.state), `${x}/${z} ${key}`);
        assert.deepEqual(kept.tile, block.tile, `${x}/${z} block entity ${key}`);
      }
    }
  }
});

test('NBT export round-trips without changing blocks or TNT counts', async () => {
  for (const [x, z] of [
    ['100', '422'],
    ['20', '-422'],
    ['6773.1', '-422'],
    ['-13504', '-13504'],
  ]) {
    const r = c.buildCannon(template, x, z);
    const bytes = await c.exportLitematic(r, {
      allowExperimentalRotation: true,
      dataVersion: 4556,
      timestamp: 0,
    });
    const decoded = c.decodeNBT(await c.inflate(bytes));
    const out = c.inspectLitematicRoot(decoded.root);
    assert.equal(out.blocks.size, r.blocks.size);
    for (const [key, block] of r.blocks) {
      assert.equal(
        c.testing.stateKey(out.blocks.get(key)?.state),
        c.testing.stateKey(block.state),
      );
    }
    assert.equal(c.value(decoded.root, 'MinecraftDataVersion'), 4556);
  }
});
test('known damaging configuration still requires explicit acknowledgement', async () => {
  const r = c.buildCannon(template, '12702.2', '-42.2');
  assert.ok(r.plan.knownRuntimeIssue);
  assert.equal(r.plan.needsExperimentalConsent, true);
  await assert.rejects(c.exportLitematic(r));
  assert.throws(() => c.buildCannon(template, '20', '-20'));
});
test('integration targets only the pearl cannon and preserves the legacy downloader', async () => {
  const page = await readFile(
    new URL('../pages/litematica/[name].vue', import.meta.url),
    'utf8',
  );
  const downloader = await readFile(
    new URL(
      '../components/litematica/LitematicaGenDownloader.vue',
      import.meta.url,
    ),
    'utf8',
  );
  assert.ok(downloader.includes('SizeInput'));
  assert.ok(page.includes('<PearlCannonGenerator'));
  assert.ok(page.includes("selected.type === 'LitematicaGen' && !isPearlCannon"));
  assert.ok(page.includes('<LitematicaGenDownloader'));
  assert.ok(page.includes('<LitematicaShareDownloader'));
});
