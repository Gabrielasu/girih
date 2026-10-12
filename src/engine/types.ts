/**
 * Core vocabulary of the pattern engine. Everything here is plain data so a
 * recipe can be serialised, compared and shared without losing information.
 */

export const GRIDS = ['square', 'brick', 'diamond'] as const;
export type GridKind = (typeof GRIDS)[number];

export const SYMMETRIES = ['p1', 'p2', 'pm', 'pmm', 'p4', 'p4m'] as const;
export type SymmetryKind = (typeof SYMMETRIES)[number];

export const MOTIF_KINDS = ['petal', 'arcs', 'kite', 'wave', 'dots', 'leaf'] as const;
export type MotifKind = (typeof MOTIF_KINDS)[number];

export const HARMONIES = ['analogous', 'complement', 'triadic', 'split'] as const;
export type HarmonyKind = (typeof HARMONIES)[number];

export const GROUNDS = ['paper', 'ink'] as const;
export type GroundKind = (typeof GROUNDS)[number];

/** A complete, deterministic description of a pattern. */
export interface Recipe {
  grid: GridKind;
  symmetry: SymmetryKind;
  motif: MotifKind;
  /** Key hue in degrees, 0 to 355 in steps of 5. */
  hue: number;
  harmony: HarmonyKind;
  ground: GroundKind;
  /** Tile edge in px, 60 to 240 in steps of 10. */
  tile: number;
  /** Extra pattern rotation in degrees, 0 to 90 in steps of 5. */
  rotation: number;
  /** Outline weight in px, 0 to 4 in steps of 0.5. 0 disables outlines. */
  line: number;
  /** Integer seed, 0 to 99999. */
  seed: number;
}

/** Hex colors (#RRGGBB) used to paint a pattern. */
export interface Palette {
  bg: string;
  c1: string;
  c2: string;
  c3: string;
  line: string;
}

/** One painted path inside a pattern tile. */
export interface Shape {
  d: string;
  transform: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

/** One repeat of a pattern, ready to drop into an SVG `<pattern>`. */
export interface PatternTile {
  width: number;
  height: number;
  /** Rotation applied via `patternTransform`, in degrees. */
  rotation: number;
  background: string;
  shapes: Shape[];
}
