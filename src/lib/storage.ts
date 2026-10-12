import { normalizeRecipe, type Recipe } from '@/engine';

/** All localStorage keys used by the app, in one place. */
export const STORAGE_KEYS = {
  recipe: 'girih:recipe:v1',
  apiKey: 'girih:anthropic-api-key',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/*
 * Storage can throw (private mode, quota, disabled cookies), so every access
 * is wrapped and failures degrade to "nothing stored".
 */

export function readStorage(key: StorageKey): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: StorageKey, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key: StorageKey): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}

/** The last recipe used in the Studio, or null if none (or unreadable). */
export function loadRecipe(): Recipe | null {
  const raw = readStorage(STORAGE_KEYS.recipe);
  if (!raw) return null;
  try {
    return normalizeRecipe(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveRecipe(recipe: Recipe): void {
  writeStorage(STORAGE_KEYS.recipe, JSON.stringify(recipe));
}
