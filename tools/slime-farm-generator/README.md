# Slime farm schematic generator

This directory is the source for `public/slime-farm-generator.html`. The published page is a standalone Simplified Chinese tool. It runs calculations in the browser and does not call the Reden API. The litematica listing page links to it in a new tab.

## Build

Run `python tools/slime-farm-generator/build.py` from the repository root. This combines `ui.html`, `ui.css`, the JavaScript modules, the Yueyue image and the compiled structure engine into `public/slime-farm-generator.html`.

`structure_engine.js` contains an embedded WASM module used by seed-only witch hut and ocean monument search. The HTML embeds this JavaScript file; the browser does not load a separate `.wasm` file. Its complete C source is included as `structure_bridge.c` and `vendor/`. To rebuild it on Windows, run `tools/slime-farm-generator/build_structure.ps1 -EmsdkRoot <emsdk path>` with Emscripten, then run `build.py`. Cubiomes came from [xpple/cubiomes](https://github.com/xpple/cubiomes) commit `18edd56575a60fe7129705bf972de0a511437527`; its MIT license is in `vendor/LICENSE`. Rebuilding with the local Emscripten installation produced the checked-in engine byte for byte.

The Yueyue mascot is based on the contributor's character description. `assets/yueyue-prompt.md` records the generation prompts.

## Scope

The page supports Java slime chunk search, four portal layouts and `.litematic` export, saved-world biome and structure checks, and chunk or structure search. The uncut portal layout defaults to no outer top walkway. Seed-only structure predictions and unsaved terrain retain the limitations stated in the tool UI. The page remains usable without a network connection after it has loaded.
