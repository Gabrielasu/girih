// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { normalizeRecipe, DEFAULT_RECIPE } from '../recipe';
import { mockupEngine } from './reference';
import { variations, VARIATION_COUNT } from '../variations';

describe('variations', () => {
  it('returns six valid, deterministic recipes', () => {
    const a = variations(DEFAULT_RECIPE);
    expect(a).toHaveLength(VARIATION_COUNT);
    expect(variations(DEFAULT_RECIPE)).toEqual(a);
    for (const v of a) expect(normalizeRecipe(v)).toEqual(v);
  });

  it('assigns seed + i + 1 and keeps scale settings', () => {
    variations({ ...DEFAULT_RECIPE, tile: 90, rotation: 20, line: 3 }).forEach((v, i) => {
      expect(v.seed).toBe(DEFAULT_RECIPE.seed + i + 1);
      expect(v.tile).toBe(90);
      expect(v.rotation).toBe(20);
      expect(v.line).toBe(3);
      expect(v.ground).toBe(DEFAULT_RECIPE.ground);
    });
  });

  it('changes with the seed', () => {
    expect(variations({ ...DEFAULT_RECIPE, seed: 1 })).not.toEqual(
      variations({ ...DEFAULT_RECIPE, seed: 2 }),
    );
  });

  it('draws the same choices as the mockup', () => {
    const E = mockupEngine() as { rng: (s: number) => () => number };
    const r = E.rng(DEFAULT_RECIPE.seed);
    const MK = ['petal', 'arcs', 'kite', 'wave', 'dots', 'leaf'];
    const SK = ['p1', 'p2', 'pm', 'pmm', 'p4', 'p4m'];
    const HK = ['analogous', 'complement', 'triadic', 'split'];
    const GK = ['square', 'brick', 'diamond'];
    const pick = (arr: string[]) => arr[Math.floor(r() * arr.length)];
    const s = DEFAULT_RECIPE;
    const ref = [0, 1, 2, 3, 4, 5].map(() => ({
      motif: r() < 0.6 ? pick(MK) : s.motif,
      symmetry: r() < 0.6 ? pick(SK) : s.symmetry,
      hue: (s.hue + Math.floor(r() * 140 - 70) + 360) % 360,
      harmony: r() < 0.5 ? pick(HK) : s.harmony,
      grid: r() < 0.25 ? pick(GK) : s.grid,
    }));
    variations(s).forEach((v, i) => {
      const m = ref[i];
      expect(m).toBeDefined();
      if (!m) return;
      expect(v.motif).toBe(m.motif);
      expect(v.symmetry).toBe(m.symmetry);
      expect(v.harmony).toBe(m.harmony);
      expect(v.grid).toBe(m.grid);
      // Hue is snapped to the 5 degree slider step.
      expect(Math.abs(((v.hue - m.hue + 540) % 360) - 180)).toBeLessThanOrEqual(2.5);
    });
  });
});
