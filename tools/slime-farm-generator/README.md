# Slime farm schematic generator

This directory is the source for `public/slime-farm-generator.html`. The published page is a standalone Simplified Chinese tool. It runs calculations in the browser and does not call the Reden API. The litematica listing page links to it in a new tab.

## Build

Run `python tools/slime-farm-generator/build.py` from the repository root. This combines `ui.html`, `ui.css`, the JavaScript modules, the Yueyue image and the compiled structure engine into `public/slime-farm-generator.html`.

`structure_engine.js` contains an embedded WASM module used by seed-only witch hut and ocean monument search. The HTML embeds this JavaScript file; the browser does not load a separate `.wasm` file. The C sources and recompilation script are not part of this website contribution, so `build.py` uses the checked-in engine. Recompiling that engine requires separate C sources and Emscripten. Its Cubiomes dependency came from [xpple/cubiomes](https://github.com/xpple/cubiomes) commit `18edd56575a60fe7129705bf972de0a511437527`; the MIT license is retained in `vendor/LICENSE`.

The Yueyue mascot is based on the contributor's character description. `assets/yueyue-prompt.md` records the generation prompts.

## Scope

The page supports Java slime chunk search, four portal layouts and `.litematic` export, saved-world biome and structure checks, and chunk or structure search. The uncut portal layout defaults to no outer top walkway. Seed-only structure predictions and unsaved terrain retain the limitations stated in the tool UI. The page remains usable without a network connection after it has loaded.
