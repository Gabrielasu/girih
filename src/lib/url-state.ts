import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  decodeRecipe,
  DEFAULT_RECIPE,
  encodeRecipe,
  hasRecipeParams,
  recipesEqual,
  type Recipe,
} from '@/engine';
import { loadRecipe } from './storage';

/** Studio URL for a recipe, relative to the router basename. */
export function studioHref(recipe: Recipe): string {
  return `/studio?${encodeRecipe(recipe)}`;
}

/**
 * Picks the starting recipe: URL parameters win, then the last saved recipe,
 * then the default. Partial URLs are filled in from the saved recipe.
 */
export function initialRecipe(search: string): Recipe {
  const saved = loadRecipe() ?? DEFAULT_RECIPE;
  return hasRecipeParams(search) ? decodeRecipe(search, saved) : saved;
}

/**
 * Keeps the Studio URL and recipe state in sync, in both directions:
 * state changes replace the query string (no history spam), and external
 * URL changes (back, forward, a pasted link) are pushed into state.
 */
export function useRecipeUrlSync(recipe: Recipe, onUrlRecipe: (recipe: Recipe) => void): void {
  const location = useLocation();
  const navigate = useNavigate();
  const latest = useRef(recipe);
  latest.current = recipe;
  const onUrl = useRef(onUrlRecipe);
  onUrl.current = onUrlRecipe;

  // State to URL.
  useEffect(() => {
    const query = encodeRecipe(recipe);
    if (location.search.replace(/^\?/, '') !== query) {
      void navigate({ search: query, hash: location.hash }, { replace: true });
    }
    // location is intentionally read but not a dependency: this effect only reacts to state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, navigate]);

  // URL to state.
  useEffect(() => {
    if (!hasRecipeParams(location.search)) return;
    const fromUrl = decodeRecipe(location.search, latest.current);
    if (!recipesEqual(fromUrl, latest.current)) onUrl.current(fromUrl);
  }, [location.search]);
}
