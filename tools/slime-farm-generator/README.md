# Slime farm schematic generator

This directory is the source for `public/slime-farm-generator.html`. The published page is a standalone Simplified Chinese tool. It runs calculations in the browser and does not call the Reden API. The litematica listing page links to it in a new tab.

## Build

Run `python tools/slime-farm-generator/build.py` from the repository root. This combines `ui.html`, `ui.css`, the JavaScript modules, the Yueyue image and the compiled structure engine into `public/slime-farm-generator.html`.

`structure_engine.js` contains an embedded WASM module used by seed-only witch hut and ocean monument search. The HTML embeds this JavaScript file; the browser does not load a separate `.wasm` file. Its complete C source is included as `structure_bridge.c` and `vendor/`. To rebuild it on Windows, run `tools/slime-farm-generator/build_structure.ps1 -EmsdkRoot <emsdk path>` with Emscripten, then run `build.py`. Cubiomes came from [xpple/cubiomes](https://github.com/xpple/cubiomes) commit `18edd56575a60fe7129705bf972de0a511437527`; its MIT license is in `vendor/LICENSE`. Rebuilding with the local Emscripten installation produced the checked-in engine byte for byte.

The Yueyue mascot is based on the contributor's character description. `assets/yueyue-prompt.md` records the generation prompts.

## Scope

The page supports Java slime chunk search, four portal layouts and `.litematic` export, saved-world biome and structure checks, and chunk or structure search. The uncut portal layout defaults to no outer top walkway. Seed-only structure predictions and unsaved terrain retain the limitations stated in the tool UI. The page remains usable without a network connection after it has loaded.

## Browser hardware (v1.16.0)

Farm area, T shape, unrestricted and spawn-ring searches accept a radius of up to 216,000 blocks (default 4,000). Square and rectangle chunk searches instead stream rows and accept up to 29,999,000 blocks; the complete search bounds must stay within +/-29,999,000 to retain the existing boundary margin. Structure search remains capped at 108,000 and flower search at 10,800. Doubling the radius quadruples the area. Whole-world search still computes every chunk; the change removes the full-grid allocation, not the total computational cost.

The streaming reducer retains two Uint32 row arrays for squares, or a Uint32 histogram and Int32 stack for rectangles. State persists across batch boundaries, avoiding missed shapes; Uint32 heights avoid overflow beyond 65,535 rows. GPU buffers and decoded chunk flags are reused per batch, with at most max(1,048,576, row width) flag bytes. CPU mode generates bounded batches. GPU failure in automatic mode discards partial row state and restarts from the first row on CPU. Cancel terminates the worker; there is no pause/resume or checkpoint support. Non-slime searches retain the requirement for imported biome coverage, whose memory is additional to the streaming buffers.

Tests compare streaming and grid results for 54 seed/range/shape/batch combinations, imported biomes and translated centers, and cover out-of-order batches, incomplete scans and heights beyond 65,535. World-width reducer arrays total 29,999,016 bytes. Real-browser GPU search with seed 0 and radius 216,000 completed 729,054,001 chunks in 7.5 seconds; its 3x3 winning rectangle at chunk X -8405..-8403 / Z -5752..-5750 matched a Node CPU streaming run (47,866 ms, sampled peak RSS about 221 MiB). Before streaming, the same CPU rectangle search took 50,957 ms with about 746 MiB RSS. Radius 300,000 completed 1,406,325,001 chunks in 13.8 seconds on GPU (best rectangle: 10 chunks). Real-browser CPU/GPU results also matched for both square and rectangle searches at radius 4,000. These are local test results, not a general hardware guarantee. World-border GPU search reached row 743/3,749,876 and stopped successfully; a complete world-border scan has not been performed.

The page includes a visible v1.16.0 update report dated 2026-10-02 covering local CPU/GPU processing, configurable search centers, T shapes and version-aware flower searches. It credits the code references with: 感谢sunnyslopes、minelogy、li_zi_o_o的代码参考！让我们的搜索更快

All searching, saved-world reading and exports run on the user's device. This update adds optional WebGPU slime-grid generation inside the existing Web Workers. No compute server, API endpoint, telemetry, external script or CUDA binary is added. JavaScript CPU search remains available. HTTPS (or localhost for development), browser WebGPU support and an available adapter are required for GPU mode.

The selector offers automatic, CPU and GPU modes. Automatic attempts GPU for grids of at least 4,194,304 chunks; smaller grids use CPU to avoid GPU initialization overhead. Failure in automatic mode discards the GPU grid and recomputes it on CPU. Forced GPU mode reports failure. Terminating the worker cancels either path. Completed status reports the backend actually used. The scoring/shape algorithms are unchanged and still run on CPU; structures and flowers use the embedded WASM/JavaScript CPU engine.

`browser_compute.js` implements exact Java 48-bit LCG with paired 32-bit WGSL integers, including `nextInt(10)` rejection. GPU output packs 32 chunk flags per word, reducing readback by 32 times relative to one u32 per chunk. Batches limit temporary GPU buffers. Squares and rectangles consume and discard each decoded batch; other search shapes still reconstruct the complete byte grid before scoring. Boundaries, halos, biome checks, deterministic ties and complete candidates retain their existing rules.

This update also synchronizes the previously local v1.13–v1.15 features: flower targets by version, Y intervals and maximum dimensions, configurable centers for all tools, and connected T shapes. Their source and required WASM exports are included; no template-based flower projection is added.

### Checks

Run `npm test --prefix tools/slime-farm-generator` for native Node regression (Java vectors, centers, T shapes, automatic CPU fallback and flower rectangle/cache checks). `node tools/slime-farm-generator/test_flowers.js` validates the real embedded WASM. The optional DOM integration test requires jsdom: set `JSDOM_MODULE` to its installed module path and run `node tools/slime-farm-generator/test_startup.js public/slime-farm-generator.html`. Canvas is mocked in that test; it is not browser evidence.

Serve the repo root over localhost and open `/tools/slime-farm-generator/test_local_compute.html`; click the test button for actual WebGPU comparison. It checks five coordinate/seed grids including signed 64-bit extremes, eight forced RNG rejection cases, and eight full search modes including imported-biome non-slime rectangles and spawn annuli. The page does not transmit its inputs or results.

Actual Chromium verification on this machine passed those comparisons, GPU and CPU farm searches (seed 0, ±4000: area 10075, AFK -1528/3943), and immediate stop of a ±108000 GPU search with controls restored. A 4097×4097 grid measured about 1047 ms CPU / 235 ms GPU. This is a single-device grid-generation measurement, not a promise of full-search speed or world-wide performance. GPU timings include per-call setup; small grids were slower on GPU, informing the automatic cutoff. Other devices and browsers have not been validated.

The bit-packing idea was informed by [OvOliziOvO/slime](https://github.com/OvOliziOvO/slime). Its CUDA implementation and 221-chunk circle are not included or substituted for this tool's block annulus. No source was copied from that repository; it does not specify a license for its own core code. Existing cubiomes provenance and MIT notices above remain intact.

The actual browser `.litematic` download was decoded and compared with the CPU reference: every NBT field matched after removing creation/modification timestamps. Rebuilding the updated WASM from the included C sources produced the same engine bytes. `NODE_OPTIONS=--max-old-space-size=8192 npm run build` passed with normal SSR and no backend fixtures, using the repository CI heap setting; the initial build without that setting ran out of heap. Existing BigInt target/dependency deprecation warnings remain. The production static HTML exactly matches the checked-in generated HTML. Machine-independent results are recorded in `test_results.json`; screenshots are kept outside the repository.
