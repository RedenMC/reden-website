import { NbtType } from 'deepslate';

export class Litematic {
  public regions: LitematicRegion[];

  constructor() {
    this.regions = [];
  }
}

export class LitematicRegion {
  public x: number;
  public y: number;
  public z: number;
  public width: number;
  public height: number;
  public depth: number;
  public blockPalette: any;
  public blocks: any[][][];

  constructor(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.blocks = [];
  }
}

export function readLitematicFromNBTData(nbtdata: any): Litematic {
  // Get rid of all the annoying stuff basically

  const litematica = new Litematic();
  const regions = nbtdata.root.Regions.value;
  for (let regionName in regions) {
    const region = regions[regionName].value;

    const blockPalette = __stripNBTTyping(region.BlockStatePalette);

    // Find the minimum number of bits needed to express all blocks
    const nbits = Math.ceil(Math.log2(blockPalette.length));

    const x = region.Position.value.x.value as number;
    const y = region.Position.value.y.value as number;
    const z = region.Position.value.z.value as number;
    const width = region.Size.value.x.value as number;
    const height = region.Size.value.y.value as number;
    const depth = region.Size.value.z.value as number;

    let blockData = region.BlockStates.value;

    let blocks = processNBTRegionData(blockData, nbits, width, height, depth);

    let litematicRegion = new LitematicRegion(x, y, z, width, height, depth);
    litematicRegion.blocks = blocks;
    litematicRegion.blockPalette = blockPalette;

    litematica.regions.push(litematicRegion);
  }

  return litematica;
}

/**
 *
 * @param regionData nbt: longs[]
 * @param nbits
 * @param width
 * @param height
 * @param depth
 */
function processNBTRegionData(
  regionData: [number, number][],
  nbits: number,
  width: number,
  height: number,
  depth: number,
) {
  // Function to take the raw array and convert it into a 3D array
  // The raw data is a list of nbits-wide numbers all packed together into a single array of 64-bit* ints
  // I ripped off some python code for this, can't remember where from.
  // (* of course this is javascript so each int is split into an array fo 2 32-bit ints)

  let mask = (1 << nbits) - 1;

  let y_shift = Math.abs(width * depth);
  let z_shift = Math.abs(width);
  const blocks: any[][][] = [];
  for (let x = 0; x < Math.abs(width); x++) {
    blocks[x] = [];
    for (let y = 0; y < Math.abs(height); y++) {
      blocks[x][y] = [];
      for (let z = 0; z < Math.abs(depth); z++) {
        let index = y * y_shift + z * z_shift + x;

        let start_offset = index * nbits;

        let start_arr_index = start_offset >>> 5; /// divide by 32
        let end_arr_index = ((index + 1) * nbits - 1) >>> 5;
        let start_bit_offset = start_offset & 0x1f; // % 32

        // This bit here is to handle the fact that the 64 bit numbers have to be broken down to
        // 32bit numbers in javascript.
        let half_ind = start_arr_index >>> 1;
        let blockStart;
        let blockEnd;
        if ((start_arr_index & 0x1) == 0) {
          blockStart = regionData[half_ind][1];
          blockEnd = regionData[half_ind][0];
        } else {
          blockStart = regionData[half_ind][0];
          if (half_ind + 1 < regionData.length) {
            blockEnd = regionData[half_ind + 1][1];
          } else {
            // It seems that sometimes the index can extend past the end of the array, but this fix works (for now)
            blockEnd = 0x0;
          }
        }

        if (start_arr_index == end_arr_index) {
          blocks[x][y][z] = (blockStart >>> start_bit_offset) & mask;
        } else {
          let end_offset = 32 - start_bit_offset; // num curtailed bits
          blocks[x][y][z] =
            ((blockStart >>> start_bit_offset) & mask) |
            ((blockEnd << end_offset) & mask); // & mask;
        }
      }
    }
  }
  return blocks;
}

/**
 * Hacky function needed to convert NBT to pure JSON
 * use at your own risk
 *
 * edited for new deepslate NBG implementation
 * exercise extreme caution
 * @param nbtData
 */
export function __stripNBTTyping(nbtData: any): any {
  if (nbtData.hasOwnProperty('type')) {
    switch (NbtType[nbtData.type]) {
      case 'Compound':
        const newDict: Record<string, any> = {};
        for (const [k, v] of Object.entries(nbtData.value)) {
          newDict[k] = __stripNBTTyping(v);
        }
        return newDict;
      case 'List':
        const newList: Record<string, any> = [];
        for (const [k, v] of Object.entries(nbtData.value.items)) {
          newList[k] = __stripNBTTyping(v);
        }
        return newList;
      default:
        return nbtData.value;
    }
  } else {
    switch (nbtData.constructor) {
      case Object:
        const newDict: Record<string, any> = {};
        for (const [k, v] of Object.entries(nbtData)) {
          newDict[k] = __stripNBTTyping(v);
        }
        return newDict;
      default:
        return nbtData;
    }
  }
}
