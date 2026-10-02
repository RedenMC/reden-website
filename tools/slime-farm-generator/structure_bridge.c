#include "vendor/finders.h"
#include "vendor/noise.h"
#include <stdint.h>

static Generator generator;
static uint64_t world_seed;
static int version;
static int results[1024 * 6];
static uint32_t flower_row[256];
static PerlinNoise flower_legacy, flower_first, flower_second;
static Range flower_bounds, flower_source;
static int *flower_biomes;
static uint32_t *flower_pixels, flower_masks[128];
static int flower_words;
typedef struct { int x, y, z; uint32_t epoch; int16_t ids[256]; } FlowerBiomeCache;
static FlowerBiomeCache *flower_cache;
static uint32_t flower_epoch;

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
    flower_epoch++;
    uint64_t flower_seed = 0;
    setSeed(&flower_seed, 2345);
    perlinInit(&flower_legacy, &flower_seed);
    uint64_t first = (uint64_t)-1223197304453310635LL;
    uint64_t second = (uint64_t)-8087649458443489125LL;
    setSeed(&first, first);
    setSeed(&second, second);
    perlinInit(&flower_first, &first);
    perlinInit(&flower_second, &second);
    return 1;
}

int flower_noise_at(int x, int y, int z) {
    double value;
    if (version <= MC_1_17_1) {
        value = (1.0 + sampleSimplex2D(&flower_legacy, x / 48.0, z / 48.0)) / 2.0;
    } else {
        const double scale = (double)(float)0.020833334;
        double ax = x * scale, ay = y * scale, az = z * scale;
        double n1 = samplePerlin(&flower_first, ax, ay, az, 0, 0);
        double n2 = samplePerlin(&flower_second, ax * 337.0 / 331.0,
            ay * 337.0 / 331.0, az * 337.0 / 331.0, 0, 0);
        value = (1.0 + (n1 + n2) * (5.0 / 6.0)) / 2.0;
    }
    if (value < 0) value = 0;
    if (value > 0.9999) value = 0.9999;
    return 1 + (int)(value * 11);
}

static int flower_kind(int biome, int x, int y, int z) {
    if (biome == flower_forest) return flower_noise_at(x, y, z);
    if (biome == swamp) return 12;
    if (version >= MC_1_20_6 && biome == cherry_grove) return 13;
    if (version >= MC_1_21_4 && biome == pale_garden) return 14;
    if (version >= MC_1_21_5 && (biome == birch_forest || biome == old_growth_birch_forest)) return 15;
    return 0;
}

static uint32_t flower_biome_mask(int biome) {
    if (biome == flower_forest) return (1u << 11) - 1;
    int kind = flower_kind(biome, 0, 0, 0);
    return kind ? 1u << (kind - 1) : 0;
}

/* Adjacent search tiles share their biome halo. Cache exact 1:4 source blocks,
 * keyed by seed/version epoch; hash collisions only replace an entry. */
static int flower_fill_source(void) {
    if (!flower_cache) flower_cache = calloc(32768, sizeof *flower_cache);
    if (!flower_cache) return -1;
    for (int y = 0; y < flower_source.sy; y++) for (int z = 0; z < flower_source.sz; z++)
        for (int x = 0; x < flower_source.sx; x++) {
            int qx = flower_source.x + x, qy = flower_source.y + y, qz = flower_source.z + z;
            int bx = qx >> 4, bz = qz >> 4;
            uint32_t hash = (uint32_t)bx * 73856093u ^ (uint32_t)qy * 83492791u ^ (uint32_t)bz * 19349663u;
            FlowerBiomeCache *entry = flower_cache + (hash & 32767);
            if (entry->epoch != flower_epoch || entry->x != bx || entry->y != qy || entry->z != bz) {
                int values[256];
                Range range = {4, bx * 16, bz * 16, 16, 16, qy, 1};
                if (genBiomes(&generator, values, range)) return -1;
                for (int i = 0; i < 256; i++) entry->ids[i] = (int16_t)values[i];
                entry->x = bx; entry->y = qy; entry->z = bz; entry->epoch = flower_epoch;
            }
            flower_biomes[(y * flower_source.sz + z) * flower_source.sx + x] = entry->ids[(qz & 15) * 16 + (qx & 15)];
        }
    return 0;
}

/* Cache all biome source cells that can influence this tile and height range.
 * The 1:4 mask is only a conservative rejection test, never a positive result. */
int flower_prepare(int x, int z, int width, int height, int min_y, int max_y) {
    if (width < 1 || height < 1 || width > 1087 || height > 1087 ||
        min_y > max_y || min_y < -63 || max_y > 319) return -1;
    flower_bounds = (Range){1, x, z, width, height, min_y, max_y - min_y + 1};
    flower_source = version <= MC_1_17_1 ? flower_bounds : getVoronoiSrcRange(flower_bounds);
    if (version <= MC_1_17_1) flower_source.sy = 1;
    if (flower_source.sy > 128) return -1;
    free(flower_biomes);
    flower_biomes = allocCache(&generator, flower_source);
    if (!flower_biomes) return -1;
    if (version <= MC_1_17_1 ? genBiomes(&generator, flower_biomes, flower_source) : flower_fill_source()) return -1;
    flower_words = (width * height + 3) / 4;
    uint32_t *pixels = realloc(flower_pixels, (size_t)flower_words * sizeof *pixels);
    if (!pixels) return -1;
    flower_pixels = pixels;
    uint32_t mask = 0;
    int plane = flower_source.sx * flower_source.sz;
    for (int k = 0; k < flower_source.sy; k++) {
        uint32_t layer = 0;
        for (int i = 0; i < plane; i++) layer |= flower_biome_mask(flower_biomes[k * plane + i]);
        flower_masks[k] = layer;
        mask |= layer;
    }
    return (int)mask;
}

int flower_prepared_mask(int y) {
    if (y < flower_bounds.y || y >= flower_bounds.y + flower_bounds.sy) return -1;
    if (version <= MC_1_17_1) return (int)flower_masks[0];
    int k = ((y - 2) >> 2) - flower_source.y;
    return (int)(flower_masks[k] | flower_masks[k + 1]);
}

int flower_prepared_layer(int y) {
    if (flower_prepared_mask(y) < 0) return -1;
    for (int i = 0; i < flower_words; i++) flower_pixels[i] = 0;
    uint32_t mask = 0;
    for (int z = 0; z < flower_bounds.sz; z++) for (int x = 0; x < flower_bounds.sx; x++) {
        int i = z * flower_bounds.sx + x, biome;
        int wx = flower_bounds.x + x, wz = flower_bounds.z + z;
        if (version <= MC_1_17_1) biome = flower_biomes[i];
        else {
            int qx, qy, qz;
            voronoiAccess3D(generator.sha, wx, y, wz, &qx, &qy, &qz);
            int index = ((qy - flower_source.y) * flower_source.sz + qz - flower_source.z) * flower_source.sx + qx - flower_source.x;
            biome = flower_biomes[index];
        }
        int kind = flower_kind(biome, wx, y, wz);
        if (kind) mask |= 1u << (kind - 1);
        flower_pixels[i / 4] |= (uint32_t)kind << ((i % 4) * 8);
    }
    return (int)mask;
}

uint32_t flower_layer_word(int i) { return i >= 0 && i < flower_words ? flower_pixels[i] : 0; }

/* 0: unavailable, 1..11: flower forest, 12: blue orchid,
 * 13: pink petals, 14: eyeblossom, 15: wildflowers. */
int flower_scan_row(int x, int y, int z, int width) {
    if (width < 1 || width > 1024 || version < 0) return 0;
    Range range = {1, x, z, width, 1, y, 1};
    int *biomes = allocCache(&generator, range);
    if (!biomes) return 0;
    int ok = genBiomes(&generator, biomes, range) == 0;
    for (int i = 0; i < (width + 3) / 4; i++) flower_row[i] = 0;
    if (ok) for (int i = 0; i < width; i++) {
        int kind = flower_kind(biomes[i], x + i, y, z);
        flower_row[i / 4] |= (uint32_t)kind << ((i % 4) * 8);
    }
    free(biomes);
    return ok;
}

uint32_t flower_result_word(int i) { return i >= 0 && i < 256 ? flower_row[i] : 0; }
int flower_biome_at(int x, int y, int z) { return getBiomeAt(&generator, 1, x, y, z); }

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
