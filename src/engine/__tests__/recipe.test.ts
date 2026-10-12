// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  decodeRecipe,
  DEFAULT_RECIPE,
  describeRecipe,
  encodeRecipe,
  hasRecipeParams,
  isGrid,
  normalizeRecipe,
  plateNumber,
  randomRecipe,
  RANGES,
  recipesEqual,
  seedLabel,
  snap,
  snapHue,
} from '../recipe';
import { GRIDS, HARMONIES, MOTIF_KINDS, SYMMETRIES, type Recipe } from '../types';

describe('snap', () => {
  it('clamps and snaps to the step', () => {
    expect(snap(63, RANGES.tile, 140)).toBe(60);
    expect(snap(66, RANGES.tile, 140)).toBe(70);
    expect(snap(999, RANGES.tile, 140)).toBe(240);
    expect(snap(-5, RANGES.line, 1)).toBe(0);
    expect(snap(1.3, RANGES.line, 1)).toBe(1.5);
    expect(snap(Number.NaN, RANGES.line, 1)).toBe(1);
  });

  it('wraps hue around the wheel', () => {
    expect(snapHue(362, 0)).toBe(0);
    expect(snapHue(-10, 0)).toBe(350);
    expect(snapHue(233, 0)).toBe(235);
    expect(snapHue(Number.POSITIVE_INFINITY, 40)).toBe(40);
  });
});

describe('normalizeRecipe', () => {
  it('returns the defaults for garbage', () => {
    expect(normalizeRecipe(null)).toEqual(DEFAULT_RECIPE);
    expect(normalizeRecipe('nope')).toEqual(DEFAULT_RECIPE);
    expect(normalizeRecipe({ grid: 'hex', motif: 3, tile: 'big' })).toEqual(DEFAULT_RECIPE);
  });

  it('keeps valid values and coerces numeric strings', () => {
    const out = normalizeRecipe({ grid: 'brick', tile: '100', line: '2', seed: '12.9', hue: 0 });
    expect(out.grid).toBe('brick');
    expect(out.tile).toBe(100);
    expect(out.line).toBe(2);
    expect(out.seed).toBe(13);
    expect(out.hue).toBe(0);
  });

  it('treats empty strings as missing', () => {
    expect(normalizeRecipe({ tile: '  ' }).tile).toBe(DEFAULT_RECIPE.tile);
  });

  it('uses the given base for missing fields', () => {
    const base: Recipe = { ...DEFAULT_RECIPE, motif: 'wave' };
    expect(normalizeRecipe({}, base).motif).toBe('wave');
  });

  it('exposes type guards', () => {
    expect(isGrid('diamond')).toBe(true);
    expect(isGrid('hex')).toBe(false);
    expect(isGrid(4)).toBe(false);
  });
});

describe('URL encoding', () => {
  it('round trips every combination of enums', () => {
    for (const grid of GRIDS)
      for (const symmetry of SYMMETRIES)
        for (const motif of MOTIF_KINDS)
          for (const harmony of HARMONIES) {
            const recipe: Recipe = {
              ...DEFAULT_RECIPE,
              grid,
              symmetry,
              motif,
              harmony,
              ground: 'ink',
              hue: 15,
              tile: 90,
              rotation: 35,
              line: 2.5,
              seed: 77,
            };
            expect(decodeRecipe(encodeRecipe(recipe))).toEqual(recipe);
          }
  });

  it('uses short readable keys in a stable order', () => {
    expect(encodeRecipe(DEFAULT_RECIPE)).toBe(
      'grid=square&sym=p4m&motif=petal&hue=230&harmony=split&ground=paper&tile=140&rot=0&line=1&seed=4471',
    );
  });

  it('accepts a leading "?" and falls back for bad values', () => {
    const r = decodeRecipe('?grid=diamond&tile=9999&sym=p7&utm_source=x');
    expect(r.grid).toBe('diamond');
    expect(r.tile).toBe(240);
    expect(r.symmetry).toBe(DEFAULT_RECIPE.symmetry);
  });

  it('detects recipe parameters', () => {
    expect(hasRecipeParams('?utm=1')).toBe(false);
    expect(hasRecipeParams('?sym=p2')).toBe(true);
    expect(hasRecipeParams('')).toBe(false);
  });
});

describe('labels', () => {
  it('derives the plate number from the seed', () => {
    expect(plateNumber(4471)).toBe('471');
    expect(plateNumber(5)).toBe('005');
    expect(plateNumber(9000)).toBe('000');
  });

  it('formats the seed label', () => {
    expect(seedLabel({ seed: 42, symmetry: 'p4m' })).toBe('0042-P4M');
  });

  it('describes the recipe as a card', () => {
    expect(describeRecipe(DEFAULT_RECIPE)).toBe(
      [
        'grid      square',
        'symmetry  p4m',
        'motif     petal',
        'harmony   split @ 230°',
        'tile      140px  rot 0°',
        'seed      4471',
      ].join('\n'),
    );
    expect(describeRecipe(DEFAULT_RECIPE, { scale: false })).not.toContain('tile');
  });

  it('compares recipes by value', () => {
    expect(recipesEqual(DEFAULT_RECIPE, { ...DEFAULT_RECIPE })).toBe(true);
    expect(recipesEqual(DEFAULT_RECIPE, { ...DEFAULT_RECIPE, seed: 1 })).toBe(false);
  });
});

describe('randomRecipe', () => {
  it('is deterministic for the same entropy and always valid', () => {
    expect(randomRecipe(123)).toEqual(randomRecipe(123));
    for (let e = 0; e < 200; e++) {
      const r = randomRecipe(e);
      expect(normalizeRecipe(r)).toEqual(r);
      expect(r.seed).toBeLessThan(9973);
    }
  });

  it('keeps rotation and line from the base recipe', () => {
    const base: Recipe = { ...DEFAULT_RECIPE, rotation: 30, line: 3 };
    const r = randomRecipe(5, base);
    expect(r.rotation).toBe(30);
    expect(r.line).toBe(3);
  });
});
