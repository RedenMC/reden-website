import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const source = new URL(
  '../public/generators/pearl-cannon-v9.html',
  import.meta.url,
);
const target = new URL('../utils/pearl-cannon/core.mjs', import.meta.url);
const html = await readFile(source, 'utf8');
const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'Missing standalone module');
const marker = '// Standalone browser UI.';
assert.equal(script.split(marker).length, 2);
const core = script.slice(0, script.indexOf(marker));
const entry = `
// Public entry point for the native page; v9 generation code above is unchanged.
export function loadBundledTemplate() {
  return loadTemplate(Uint8Array.from(atob(TEMPLATE_BASE64), c => c.charCodeAt(0)));
}
`;
await writeFile(target, core + entry);
console.log('Synchronized unchanged v9 core and bundled-template entry point.');
