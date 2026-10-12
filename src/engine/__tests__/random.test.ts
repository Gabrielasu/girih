// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { mulberry32, nextSeed, pick, randInt, SEED_MODULUS } from '../random';

describe('mulberry32', () => {
  it('is deterministic per seed', () => {
    const a = mulberry32(4471);
    const b = mulberry32(4471);
    const xs = Array.from({ length: 20 }, () => a());
    const ys = Array.from({ length: 20 }, () => b());
    expect(xs).toEqual(ys);
  });

  it('differs between seeds', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it('matches the known first output for seed 0', () => {
    // Reference value of the canonical Mulberry32 implementation.
    expect(mulberry32(0)()).toBeCloseTo(0.26642920868471265, 12);
  });

  it('stays within [0, 1) and is roughly uniform', () => {
    const r = mulberry32(99);
    let sum = 0;
    for (let i = 0; i < 5000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      sum += v;
    }
    expect(sum / 5000).toBeGreaterThan(0.45);
    expect(sum / 5000).toBeLessThan(0.55);
  });
});

describe('pick and randInt', () => {
  it('picks every element eventually and nothing else', () => {
    const r = mulberry32(7);
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(pick(r, ['a', 'b', 'c']));
    expect([...seen].sort()).toEqual(['a', 'b', 'c']);
  });

  it('throws on an empty list', () => {
    expect(() => pick(mulberry32(1), [])).toThrow();
  });

  it('returns inclusive integers', () => {
    const r = mulberry32(3);
    const values = new Set<number>();
    for (let i = 0; i < 500; i++) values.add(randInt(r, 2, 4));
    expect([...values].sort()).toEqual([2, 3, 4]);
  });
});

describe('nextSeed', () => {
  it('follows the mockup formula and stays below the modulus', () => {
    expect(nextSeed(4471)).toBe((4471 * 7 + 13) % 9973);
    let s = 1;
    for (let i = 0; i < 100; i++) {
      s = nextSeed(s);
      expect(s).toBeLessThan(SEED_MODULUS);
    }
  });
});
