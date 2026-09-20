# Displacement-based pearl cannon generator

The opt-in panel is shown only on the `91tvzzp1` schematic detail page. The original size-based downloader, materials endpoint, attribution, comments and other generators are unchanged. Expand the panel or open `/generators/pearl-cannon-v9.html` directly. The standalone tool currently uses Simplified Chinese; its surrounding panel supports the site's three locales.

## Implementation

`public/generators/pearl-cannon-v9.html` is the complete v9 standalone source, including the NBT reader/writer, embedded templates, geometry assembly, UI and original CSS. It is intentionally self-contained and retains its existing options. The shipped file equals the previously delivered v9 artifact after CRLF-to-LF normalization only. The normalized SHA256 is `0fe65461a267904a288b396a6df6550192fd24602b66ab571e16e33029009655`; the original release SHA256 is `66d575ccde36f6b13d1ef72fdca075421b074b5250ee4a74e3a0a6a3f4f04e02`. No new production dependencies or backend endpoints are introduced.

`components/litematica/PearlCannonGenerator.vue` embeds it in a collapsed panel. The iframe permits scripts and downloads, but has an opaque origin and cannot access the parent document or its cookies. Resize messages are accepted only from that iframe, with a finite, bounded height. Local downloads do not increment the existing backend's download counter.

The standalone source has an AGPL-3.0-only SPDX declaration. Embedded schematics retain the author metadata `Yisibite`. Template SHA256 values are:

- Original template: `900be1434d843523f4dbaaa4e55b4fc5bdd7a7423670e1f2ef064dc70f1864e4`.
- Larger template: `6e43dfcea3f4bd7d7bccfedc1345be0b7858e023d1aa6d0360903fdc831a413b`.

Please review template provenance and redistribution permission before merging. A Minecraft server JAR, local credentials and test-world files are not included.

## Generation rules

Signed X/Z inputs use exact decimal rounding at 42.2 blocks per payload TNT. Halfway values round away from zero. The fixed first row of each active array contains 10 propulsion TNT; these move the other TNT and are excluded from the displacement calculation.

An axis with absolute input below 21.1 rounds to zero, so its independent array and propulsion row are omitted. Exactly 21.1 still uses one payload TNT. Both axes rounding to zero produces a validation error instead of a schematic.

At absolute input 6773.1, the payload rounds to 161 TNT and the second array is enabled. Each array holds at most 160 payload TNT, with at most two arrays per axis. Inputs below 13525.1 that round to 320 are accepted; 13525.1 requires 321 and is rejected. The nominal maximum is 13504 blocks per axis.

Surplus TNT is replaced with glass from the end opposite the coral fan. Large layouts omit all-glass payload rows and their dedicated replication parts, while preserving shared power and transport. Negative Z mirrors the complete upper cannon including the signal tower; the lower pearl correction keeps its direction and is translated and reconnected. Do not rotate or mirror the exported whole structure again.

The core still accepts `omitZeroAxes: false`, `removeEmptyRows: false`, and `negativeZMode: 'legacy-bypass'`. The last option is retained for compatibility and is outside the current validation scope. Preview layers, material CSV, parameter export, original-template download and DataVersion override are retained.

## Known limitations and prior game tests

This integration is submitted for review as experimental. Payload count and nominal distance are not a guarantee of the actual landing position. Receiving height, loaded chunks and directional drift still require checking.

The recorded v9 tests used an isolated Minecraft Java 1.21.10 server with Carpet 1.4.188. Across 24 real upward pearl throws, all payload TNT reached the expected per-axis clusters and there was no material loss. Only 20 pearls exited; four collided early in the unchanged lower correction. These are historical v9 tests, not game tests rerun for this website integration. The original raw traces remain in the development archive, rather than being included in this repository.

A known damaging combination is payload X=301, Z=-1 (nominal input X=12702.2, Z=-42.2). It also failed in the earlier layout with glass rows retained. Its cause has not been fixed. The existing red warning, explicit test-world acknowledgement and output metadata are preserved. Other untested extreme ratios must not be assumed safe.

## Reproducing the integration checks

Run `pnpm test:pearl-cannon` (or `node --test test/pearl-cannon.test.mjs`) using Node 22 or later. The tests execute the core extracted from the actual shipped HTML, so they do not accidentally test a different copy of the generator. They cover decimal boundaries, all 1280 single-axis count/direction combinations, TNT accounting, retained option overrides, NBT round trips and the known-failure guard.

The full-site build also depends on the existing top-level request in `nuxt.config.ts` to the production sitemap API. An unavailable sitemap is a build prerequisite failure; do not replace it with a fake result in production. Any offline fixture build must be reported separately from a normal production build.

For this PR, the six Node tests passed. The normal build failed at the sitemap request. A temporary offline sitemap fixture allowed client and server compilation to finish; Nitro packaging then ran out of its 4 GB heap. A complete production build and browser integration acceptance remain outstanding. No test fixture or generated build hash is committed.
