import { describe, expect, it } from 'vitest';
import { DEFAULT_RECIPE, nextSeed, randomRecipe } from '@/engine';
import { recipeReducer } from '../state';

describe('recipeReducer', () => {
  it('applies patches and normalises them', () => {
    const s = recipeReducer(DEFAULT_RECIPE, { type: 'set', patch: { tile: 333, motif: 'kite' } });
    expect(s.tile).toBe(240);
    expect(s.motif).toBe('kite');
  });

  it('ignores invalid patch values', () => {
    const s = recipeReducer(DEFAULT_RECIPE, { type: 'set', patch: { grid: 'hex' as never } });
    expect(s).toEqual(DEFAULT_RECIPE);
  });

  it('advances the seed', () => {
    expect(recipeReducer(DEFAULT_RECIPE, { type: 'newSeed' }).seed).toBe(
      nextSeed(DEFAULT_RECIPE.seed),
    );
  });

  it('randomizes deterministically from entropy', () => {
    expect(recipeReducer(DEFAULT_RECIPE, { type: 'randomize', entropy: 42 })).toEqual(
      randomRecipe(42, DEFAULT_RECIPE),
    );
  });

  it('replaces the whole recipe', () => {
    const next = { ...DEFAULT_RECIPE, ground: 'ink' as const, seed: 9 };
    expect(recipeReducer(DEFAULT_RECIPE, { type: 'replace', recipe: next })).toEqual(next);
  });

  it('does not mutate the previous state', () => {
    const prev = { ...DEFAULT_RECIPE };
    recipeReducer(prev, { type: 'set', patch: { hue: 10 } });
    expect(prev).toEqual(DEFAULT_RECIPE);
  });
});
