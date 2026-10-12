/** A deterministic source of floats in [0, 1). */
export type Rng = () => number;

/** Mulberry32: a tiny, fast, well distributed 32 bit PRNG. */
export function mulberry32(seed: number): Rng {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Picks one element of a non-empty list. */
export function pick<T>(rng: Rng, list: readonly T[]): T {
  if (list.length === 0) throw new Error('pick() needs a non-empty list');
  const item = list[Math.floor(rng() * list.length)];
  return item as T;
}

/** Integer in [min, max], inclusive. */
export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Seeds cycle through a prime modulus so "New seed" never repeats quickly. */
export const SEED_MODULUS = 9973;

export function nextSeed(seed: number): number {
  return (seed * 7 + 13) % SEED_MODULUS;
}
