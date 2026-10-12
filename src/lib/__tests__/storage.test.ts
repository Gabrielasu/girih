import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_RECIPE } from '@/engine';
import {
  loadRecipe,
  readStorage,
  removeStorage,
  saveRecipe,
  STORAGE_KEYS,
  writeStorage,
} from '../storage';
import { initialRecipe, studioHref } from '../url-state';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('storage', () => {
  it('round trips a recipe', () => {
    saveRecipe({ ...DEFAULT_RECIPE, motif: 'wave' });
    expect(loadRecipe()).toEqual({ ...DEFAULT_RECIPE, motif: 'wave' });
  });

  it('returns null for missing or corrupt data', () => {
    expect(loadRecipe()).toBeNull();
    writeStorage(STORAGE_KEYS.recipe, '{not json');
    expect(loadRecipe()).toBeNull();
  });

  it('normalises stored recipes', () => {
    writeStorage(STORAGE_KEYS.recipe, JSON.stringify({ grid: 'hex', tile: 1000 }));
    expect(loadRecipe()).toEqual({ ...DEFAULT_RECIPE, tile: 240 });
  });

  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readStorage(STORAGE_KEYS.recipe)).toBeNull();
    expect(writeStorage(STORAGE_KEYS.recipe, 'x')).toBe(false);
    expect(() => {
      removeStorage(STORAGE_KEYS.apiKey);
    }).not.toThrow();
    expect(() => {
      saveRecipe(DEFAULT_RECIPE);
    }).not.toThrow();
  });
});

describe('url state', () => {
  it('prefers URL parameters over the saved recipe, filling gaps from it', () => {
    saveRecipe({ ...DEFAULT_RECIPE, motif: 'leaf', hue: 90 });
    expect(initialRecipe('?sym=p2')).toEqual({
      ...DEFAULT_RECIPE,
      motif: 'leaf',
      hue: 90,
      symmetry: 'p2',
    });
  });

  it('falls back to the saved recipe, then the default', () => {
    expect(initialRecipe('')).toEqual(DEFAULT_RECIPE);
    saveRecipe({ ...DEFAULT_RECIPE, seed: 5 });
    expect(initialRecipe('?utm=x').seed).toBe(5);
  });

  it('builds studio links', () => {
    expect(studioHref(DEFAULT_RECIPE)).toMatch(/^\/studio\?grid=square&sym=p4m/);
  });
});
