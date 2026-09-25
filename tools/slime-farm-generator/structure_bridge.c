#include "vendor/finders.h"
#include <stdint.h>

static Generator generator;
static uint64_t world_seed;
static int version;
static int results[1024 * 6];

int structure_profile(int profile) {
    static const int versions[] = {
        MC_1_16_1, MC_1_16_5, MC_1_17_1, MC_1_18_2,
        MC_1_19_2, MC_1_19_4, MC_1_20_6, MC_1_21_1,
        MC_1_21_3, MC_1_21_4, MC_1_21_5, MC_1_21_6,
        MC_1_21_9, MC_1_21_11, MC_26_1, MC_26_2, MC_26_3
    };
    return profile >= 0 && profile < (int)(sizeof versions / sizeof *versions)
        ? versions[profile] : -1;
}

int structure_init(int profile, uint32_t low, uint32_t high) {
    version = structure_profile(profile);
    if (version < 0) return 0;
    world_seed = ((uint64_t)high << 32) | low;
    setupGenerator(&generator, version, 0);
    applySeed(&generator, DIM_OVERWORLD, world_seed);
    return 1;
}

int structure_scan_row(int type, int region_z, int region_x_min, int region_x_max) {
    if (type != Swamp_Hut && type != Monument) return -1;
    if (region_x_max < region_x_min || region_x_max - region_x_min >= 1024) return -1;
    int count = 0;
    for (int rx = region_x_min; rx <= region_x_max; rx++) {
        Pos pos;
        if (!getStructurePos(type, version, world_seed, rx, region_z, &pos)) continue;
        if (!isViableStructurePos(type, &generator, pos.x, pos.z, 0)) continue;
        StructureVariant variant;
        if (!getVariant(&variant, type, version, world_seed, pos.x, pos.z, -1)) continue;
        int x = pos.x + variant.x;
        int z = pos.z + variant.z;
        int y = type == Monument ? 39 : 64;
        int top = type == Monument ? 61 : 70;
        int *out = results + count * 6;
        out[0] = x; out[1] = y; out[2] = z;
        out[3] = x + variant.sx - 1; out[4] = top; out[5] = z + variant.sz - 1;
        count++;
    }
    return count;
}

int *structure_results(void) { return results; }
int structure_result_at(int index) { return index >= 0 && index < 1024 * 6 ? results[index] : 0; }
