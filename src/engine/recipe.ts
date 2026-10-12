import { mulberry32, pick, randInt } from './random';
import {
  GRIDS,
  GROUNDS,
  HARMONIES,
  MOTIF_KINDS,
  SYMMETRIES,
  type GridKind,
  type GroundKind,
  type HarmonyKind,
  type MotifKind,
  type Recipe,
  type SymmetryKind,
} from './types';

export const DEFAULT_RECIPE: Readonly<Recipe> = Object.freeze({
  grid: 'square',
  symmetry: 'p4m',
  motif: 'petal',
  hue: 230,
  harmony: 'split',
  ground: 'paper',
  tile: 140,
  rotation: 0,
  line: 1,
  seed: 4471,
});

export interface NumericRange {
  min: number;
  max: number;
  step: number;
}

/** Valid ranges for the numeric recipe fields. Values are snapped to `step`. */
export const RANGES = {
  hue: { min: 0, max: 355, step: 5 },
  tile: { min: 60, max: 240, step: 10 },
  rotation: { min: 0, max: 90, step: 5 },
  line: { min: 0, max: 4, step: 0.5 },
  seed: { min: 0, max: 99999, step: 1 },
} as const satisfies Record<string, NumericRange>;

export type NumericField = keyof typeof RANGES;

/** Clamps to the range and snaps to its step. Non-finite input yields `fallback`. */
export function snap(value: number, range: NumericRange, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  const clamped = Math.min(range.max, Math.max(range.min, value));
  const stepped = range.min + Math.round((clamped - range.min) / range.step) * range.step;
  return Math.round(Math.min(range.max, stepped) * 1000) / 1000;
}

/** Hue wraps around the color wheel instead of clamping. */
export function snapHue(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  const stepped = Math.round(value / RANGES.hue.step) * RANGES.hue.step;
  return ((stepped % 360) + 360) % 360;
}

const oneOf =
  <T extends string>(list: readonly T[]) =>
  (v: unknown): v is T =>
    typeof v === 'string' && (list as readonly string[]).includes(v);

export const isGrid = oneOf<GridKind>(GRIDS);
export const isSymmetry = oneOf<SymmetryKind>(SYMMETRIES);
export const isMotif = oneOf<MotifKind>(MOTIF_KINDS);
export const isHarmony = oneOf<HarmonyKind>(HARMONIES);
export const isGround = oneOf<GroundKind>(GROUNDS);

const toNumber = (v: unknown): number =>
  typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;

/**
 * Turns any loosely shaped input into a valid recipe. Unknown keys are
 * ignored, invalid values fall back to `base`, numbers are clamped and snapped.
 */
export function normalizeRecipe(input: unknown, base: Readonly<Recipe> = DEFAULT_RECIPE): Recipe {
  const o = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  return {
    grid: isGrid(o.grid) ? o.grid : base.grid,
    symmetry: isSymmetry(o.symmetry) ? o.symmetry : base.symmetry,
    motif: isMotif(o.motif) ? o.motif : base.motif,
    hue: snapHue(toNumber(o.hue), base.hue),
    harmony: isHarmony(o.harmony) ? o.harmony : base.harmony,
    ground: isGround(o.ground) ? o.ground : base.ground,
    tile: snap(toNumber(o.tile), RANGES.tile, base.tile),
    rotation: snap(toNumber(o.rotation), RANGES.rotation, base.rotation),
    line: snap(toNumber(o.line), RANGES.line, base.line),
    seed: Math.trunc(snap(toNumber(o.seed), RANGES.seed, base.seed)),
  };
}

export function recipesEqual(a: Readonly<Recipe>, b: Readonly<Recipe>): boolean {
  return RECIPE_KEYS.every((k) => a[k] === b[k]);
}

export const RECIPE_KEYS = [
  'grid',
  'symmetry',
  'motif',
  'hue',
  'harmony',
  'ground',
  'tile',
  'rotation',
  'line',
  'seed',
] as const satisfies readonly (keyof Recipe)[];

/** Short, stable URL parameter names. Changing these breaks shared links. */
export const URL_KEYS: Readonly<Record<keyof Recipe, string>> = {
  grid: 'grid',
  symmetry: 'sym',
  motif: 'motif',
  hue: 'hue',
  harmony: 'harmony',
  ground: 'ground',
  tile: 'tile',
  rotation: 'rot',
  line: 'line',
  seed: 'seed',
};

/** Encodes a recipe as a query string without the leading "?". Key order is stable. */
export function encodeRecipe(recipe: Readonly<Recipe>): string {
  const params = new URLSearchParams();
  for (const key of RECIPE_KEYS) params.set(URL_KEYS[key], String(recipe[key]));
  return params.toString();
}

/** True when the query string carries at least one recipe parameter. */
export function hasRecipeParams(query: string): boolean {
  const params = new URLSearchParams(query);
  return RECIPE_KEYS.some((k) => params.has(URL_KEYS[k]));
}

/**
 * Decodes a query string (with or without "?") into a recipe. Missing or
 * invalid parameters fall back to `base`, so old or hand edited links still work.
 */
export function decodeRecipe(query: string, base: Readonly<Recipe> = DEFAULT_RECIPE): Recipe {
  const params = new URLSearchParams(query);
  const raw: Record<string, string> = {};
  for (const key of RECIPE_KEYS) {
    const value = params.get(URL_KEYS[key]);
    if (value !== null) raw[key] = value;
  }
  return normalizeRecipe(raw, base);
}

/** Three digit plate number derived from the seed, e.g. 4471 becomes "471". */
export function plateNumber(seed: number): string {
  return String(1000 + (seed % 9000))
    .slice(-3)
    .padStart(3, '0');
}

/** Seed label shown in the Studio, e.g. "4471-P4M". */
export function seedLabel(recipe: Pick<Recipe, 'seed' | 'symmetry'>): string {
  return `${String(recipe.seed).padStart(4, '0')}-${recipe.symmetry.toUpperCase()}`;
}

/** The monospaced recipe card shown in the Studio and on specimen plates. */
export function describeRecipe(
  recipe: Readonly<Recipe>,
  options: { scale?: boolean } = {},
): string {
  const lines = [
    `grid      ${recipe.grid}`,
    `symmetry  ${recipe.symmetry}`,
    `motif     ${recipe.motif}`,
    `harmony   ${recipe.harmony} @ ${recipe.hue}°`,
  ];
  if (options.scale !== false) lines.push(`tile      ${recipe.tile}px  rot ${recipe.rotation}°`);
  lines.push(`seed      ${recipe.seed}`);
  return lines.join('\n');
}

/**
 * A fresh random recipe derived from `entropy`. Rotation and line weight are
 * kept from `base` so a user's scale preferences survive randomizing.
 */
export function randomRecipe(entropy: number, base: Readonly<Recipe> = DEFAULT_RECIPE): Recipe {
  const q = mulberry32(entropy);
  return {
    ...base,
    motif: pick(q, MOTIF_KINDS),
    symmetry: pick(q, SYMMETRIES),
    harmony: pick(q, HARMONIES),
    grid: pick(q, GRIDS),
    hue: randInt(q, 0, 71) * 5,
    ground: q() < 0.75 ? 'paper' : 'ink',
    tile: 80 + randInt(q, 0, 11) * 10,
    seed: randInt(q, 0, 9972),
  };
}
