param([Parameter(Mandatory=$true)][string]$EmsdkRoot)
$ErrorActionPreference = 'Stop'
$env:EMSDK_QUIET = '1'
. (Join-Path $EmsdkRoot 'emsdk_env.ps1') | Out-Null
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$vendor = Join-Path $here 'vendor'
$sources = @(
    (Join-Path $here 'structure_bridge.c'),
    (Join-Path $vendor 'finders.c'),
    (Join-Path $vendor 'generator.c'),
    (Join-Path $vendor 'layers.c'),
    (Join-Path $vendor 'biomenoise.c'),
    (Join-Path $vendor 'biomes.c'),
    (Join-Path $vendor 'noise.c'),
    (Join-Path $vendor 'terrainnoise.c'),
    (Join-Path $vendor 'util.c'),
    (Join-Path $vendor 'xradv.c'),
    (Join-Path $vendor 'features/abandoned_camp.c'),
    (Join-Path $vendor 'features/end_city.c'),
    (Join-Path $vendor 'features/fortress.c'),
    (Join-Path $vendor 'features/stronghold.c')
)
& (Join-Path $EmsdkRoot 'upstream/emscripten/emcc.exe') @sources -O3 -fwrapv `
    -s SINGLE_FILE=1 -s MODULARIZE=1 -s EXPORT_NAME=createStructureEngine `
    -s ENVIRONMENT=worker,node -s FILESYSTEM=0 -s ALLOW_MEMORY_GROWTH=1 `
    '-sEXPORTED_FUNCTIONS=["_structure_profile","_structure_init","_structure_scan_row","_structure_result_at"]' `
    -o (Join-Path $here 'structure_engine.js')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
