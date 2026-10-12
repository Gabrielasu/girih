// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { gridOffsets, patternRotation, repeatFrame, repeatSize } from '../grid';
import { LINE_ROLE, MOTIFS } from '../motifs';
import { fmt, opTransform, SYMMETRY_GROUPS } from '../symmetry';
import { MOTIF_KINDS, SYMMETRIES } from '../types';

describe('motifs', () => {
  it('defines all six motifs with valid roles', () => {
    expect(Object.keys(MOTIFS)).toEqual([...MOTIF_KINDS]);
    for (const kind of MOTIF_KINDS) {
      const def = MOTIFS[kind];
      expect(def.layers.length).toBeGreaterThan(0);
      for (const l of def.layers) {
        expect(l.d).toMatch(/^M/);
        expect([LINE_ROLE, 0, 1, 2, 3]).toContain(l.role);
      }
    }
  });
});

describe('symmetry', () => {
  it('defines six wallpaper groups and only p4m mirrors the diagonal', () => {
    expect(Object.keys(SYMMETRY_GROUPS)).toEqual([...SYMMETRIES]);
    for (const k of SYMMETRIES) {
      expect(SYMMETRY_GROUPS[k].ops).toHaveLength(4);
      expect(SYMMETRY_GROUPS[k].diagonal).toBe(k === 'p4m');
    }
  });

  it('produces the expected transforms for each op', () => {
    expect(opTransform('id', 0, 0, 70)).toBe('translate(0 0) scale(0.7)');
    expect(opTransform('mx', 70, 0, 70)).toBe('translate(140 0) scale(-0.7 0.7)');
    expect(opTransform('my', 0, 70, 70)).toBe('translate(0 140) scale(0.7 -0.7)');
    expect(opTransform('r180', 70, 70, 70)).toBe('translate(140 140) scale(-0.7 -0.7)');
    expect(opTransform('r90', 70, 0, 70)).toBe('translate(140 0) rotate(90) scale(0.7)');
    expect(opTransform('r270', 0, 70, 70)).toBe('translate(0 140) rotate(-90) scale(0.7)');
  });

  it('formats numbers without float noise or negative zero', () => {
    expect(fmt(0.35000000000000003)).toBe('0.35');
    expect(fmt(-0)).toBe('0');
    expect(fmt(1 / 3)).toBe('0.3333');
  });
});

describe('grid', () => {
  it('places one block for square and diamond, three for brick', () => {
    expect(gridOffsets('square', 100)).toEqual([[0, 0]]);
    expect(gridOffsets('diamond', 100)).toEqual([[0, 0]]);
    expect(gridOffsets('brick', 100)).toEqual([
      [0, 0],
      [50, 100],
      [-50, 100],
    ]);
  });

  it('doubles the height for brick', () => {
    expect(repeatSize('square', 80)).toEqual({ width: 80, height: 80 });
    expect(repeatSize('brick', 80)).toEqual({ width: 80, height: 160 });
  });

  it('turns diamond grids by 45 degrees on top of the recipe rotation', () => {
    expect(patternRotation('square', 10)).toBe(10);
    expect(patternRotation('diamond', 10)).toBe(55);
  });
});

describe('repeatFrame', () => {
  it('is the tile itself when not rotated', () => {
    expect(repeatFrame(100, 200, 0)).toEqual({ width: 100, height: 200, seamless: true });
    expect(repeatFrame(100, 200, 180)).toEqual({ width: 100, height: 200, seamless: true });
  });

  it('swaps sides at 90 degrees', () => {
    expect(repeatFrame(100, 200, 90)).toEqual({ width: 200, height: 100, seamless: true });
  });

  it('computes the exact square period at 45 degrees', () => {
    const sq = repeatFrame(100, 100, 45);
    expect(sq.width).toBeCloseTo(100 * Math.SQRT2, 8);
    expect(sq.seamless).toBe(true);
    const brick = repeatFrame(100, 200, 135);
    expect(brick.width).toBeCloseTo(200 * Math.SQRT2, 8);
    expect(brick.height).toBe(brick.width);
    expect(repeatFrame(100, 100, -45).width).toBeCloseTo(100 * Math.SQRT2, 8);
  });

  it('falls back to a large non seamless swatch for other angles', () => {
    expect(repeatFrame(100, 100, 30)).toEqual({ width: 480, height: 480, seamless: false });
    expect(repeatFrame(140, 280, 20)).toEqual({ width: 1120, height: 1120, seamless: false });
  });
});
