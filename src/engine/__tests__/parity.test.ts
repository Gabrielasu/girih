// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { build } from '../build';
import { contrast, hsl, palette } from '../color';
import { mulberry32 } from '../random';
import { GRIDS, GROUNDS, HARMONIES, MOTIF_KINDS, SYMMETRIES, type Recipe } from '../types';
import { DEFAULT_RECIPE } from '../recipe';
import { mockupEngine } from './reference';

/** Normalises numbers in a transform string so float noise does not matter. */
const norm = (t: string) =>
  t.replace(/-?\d+(\.\d+)?(e-?\d+)?/g, (n) => String(Number(Number(n).toFixed(4)) || 0));

interface MockShape {
  d: string;
  t: string;
  fill: string;
  stroke: string;
  sw: number;
}

const E = mockupEngine() as {
  hsl: typeof hsl;
  contrast: typeof contrast;
  palette: typeof palette;
  build: (
    cfg: { grid: string; sym: string; motif: string },
    T: number,
    pal: ReturnType<typeof palette>,
    sw: number,
  ) => { w: number; h: number; shapes: MockShape[] };
  rng: (seed: number) => () => number;
};

describe('parity with the approved mockup engine', () => {
  it('matches hsl and contrast', () => {
    for (let h = -40; h < 400; h += 13) {
      expect(hsl(h, 72, 44)).toBe(E.hsl(h, 72, 44));
    }
    expect(contrast('#2135F5', '#FBFBFA')).toBe(E.contrast('#2135F5', '#FBFBFA'));
  });

  it('matches every palette', () => {
    for (const harmony of HARMONIES)
      for (const ground of GROUNDS)
        for (let hue = 0; hue < 360; hue += 5)
          expect(palette(hue, harmony, ground)).toEqual(E.palette(hue, harmony, ground));
  });

  it('matches the RNG stream', () => {
    const a = mulberry32(4471);
    const b = E.rng(4471);
    for (let i = 0; i < 50; i++) expect(a()).toBe(b());
  });

  it('matches build() for every grid, symmetry and motif', () => {
    for (const grid of GRIDS)
      for (const symmetry of SYMMETRIES)
        for (const motif of MOTIF_KINDS)
          for (const [tile, line] of [
            [140, 1],
            [56, 0],
            [110, 2.5],
          ] as const) {
            const recipe: Recipe = { ...DEFAULT_RECIPE, grid, symmetry, motif, tile, line };
            const ours = build(recipe);
            const pal = palette(recipe.hue, recipe.harmony, recipe.ground);
            const ref = E.build({ grid, sym: symmetry, motif }, tile, pal, line);
            expect(ours.width).toBe(ref.w);
            expect(ours.height).toBe(ref.h);
            expect(ours.shapes).toHaveLength(ref.shapes.length);
            ours.shapes.forEach((s, i) => {
              const r = ref.shapes[i];
              expect(r).toBeDefined();
              if (!r) return;
              expect(s.d).toBe(r.d);
              expect(norm(s.transform)).toBe(norm(r.t));
              expect(s.fill).toBe(r.fill);
              expect(s.stroke).toBe(r.stroke);
              expect(s.strokeWidth).toBe(r.sw);
            });
          }
  });
});
