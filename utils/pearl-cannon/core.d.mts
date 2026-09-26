export type Point = [number, number, number];
export interface BlockState {
  Name: string;
  Properties?: Record<string, string>;
}
export interface CannonBlock {
  p: Point;
  state: BlockState;
  tntRole?: string;
}
export interface Removal {
  axes?: string[];
  rows?: unknown[];
  removedBlocks: number;
}
export interface CannonPlan {
  requested: { x: number; z: number; textX: string; textZ: string };
  counts: {
    x: number;
    z: number;
    total: number;
    propulsion: number;
    structureTotal: number;
  };
  predicted: { textX: string; textZ: string; x: number; z: number };
  error: { x: number; z: number };
  degrees: number;
  quarterTurns: number;
  mirrorZ: boolean;
  largeArrays: boolean;
  activeArrays: number;
  omittedAxes: string[];
  needsExperimentalConsent: boolean;
  knownRuntimeIssue?: { code: string; message: string } | null;
  farArraySupport?: {
    material: string;
    canonicalPositions: Point[];
    nearSupportsUnchanged: boolean;
    lowerCorrectionUnchanged: boolean;
    allConfigurationsTested: boolean;
  };
  warnings: string[];
  zeroAxisRemoval?: Removal;
  emptyRowRemoval?: Removal;
  banks: Record<
    'east' | 'south',
    { omitted: boolean; arrays: { index: number; tnt: number }[] }
  >;
  structure: {
    nonAir: number;
    bounds: { size: Point };
    [key: string]: unknown;
  };
}
export interface CannonRow {
  wing: 'east' | 'south';
  role: string;
  arrayIndex?: number;
  row: number;
  kept: number;
  replaced: number;
  positions: Point[];
  outputPositions?: Point[];
}
export interface CannonTemplate {
  originalBytes: Uint8Array;
  author: string;
  sourceDataVersion: number;
}
export interface CannonResult {
  plan: CannonPlan;
  blocks: Map<string, CannonBlock>;
  rows: CannonRow[];
  materials: Record<string, number>;
}
export interface CannonOptions {
  omitZeroAxes?: boolean;
  removeEmptyRows?: boolean;
  negativeZMode?: string;
  pivot?: { x: number; z: number };
}
export function loadBundledTemplate(): Promise<CannonTemplate>;
export function buildCannon(
  template: CannonTemplate,
  x: string,
  z: string,
  options?: CannonOptions,
): CannonResult;
export function parseDisplacement(input: string): {
  number: number;
  n: bigint;
  d: bigint;
  text: string;
};
export function exactDistance(count: number): string;
export function rotateVector(
  x: number,
  z: number,
  turns: number,
): [number, number];
export function exportLitematic(
  result: CannonResult,
  options?: {
    allowExperimentalRotation?: boolean;
    dataVersion?: number;
    timestamp?: number;
  },
): Promise<Uint8Array>;
export function suggestedFilename(plan: CannonPlan): string;
