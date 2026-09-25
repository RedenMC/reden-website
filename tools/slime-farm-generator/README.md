# Slime farm schematic generator

This directory is the source for `public/slime-farm-generator.html`. The published page is a standalone Simplified Chinese tool. It runs calculations in the browser and does not call the Reden API. The litematica listing page links to it in a new tab.

## Build

Run `python tools/slime-farm-generator/build.py` from the repository root. This combines `ui.html`, `ui.css`, the JavaScript modules, the Yueyue image and the compiled structure engine into `public/slime-farm-generator.html`.

`structure_engine.js` is the checked-in Emscripten build of `structure_bridge.c` and the vendored Cubiomes sources. To rebuild that component on Windows, run `tools/slime-farm-generator/build_structure.ps1 -EmsdkRoot <emsdk path>` before `build.py`. Cubiomes was taken from [xpple/cubiomes](https://github.com/xpple/cubiomes) commit `18edd56575a60fe7129705bf972de0a511437527`; its MIT license is in `vendor/LICENSE`.

The Yueyue mascot is based on the contributor's character description. `assets/yueyue-prompt.md` records the generation prompts.

## Scope

The page supports Java slime chunk search, four portal layouts and `.litematic` export, saved-world biome and structure checks, and chunk or structure search. Seed-only structure predictions and unsaved terrain retain the limitations stated in the tool UI. The page remains usable without a network connection after it has loaded.
