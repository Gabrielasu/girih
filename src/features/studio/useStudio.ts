import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useLocation } from 'react-router';
import {
  build,
  contrastRating,
  palette as makePalette,
  paletteContrast,
  plateNumber,
  seedLabel,
  variations,
  type Recipe,
} from '@/engine';
import { saveRecipe } from '@/lib/storage';
import { initialRecipe, useRecipeUrlSync } from '@/lib/url-state';
import { recipeReducer } from './state';

/** Everything the Studio renders, derived once per recipe change. */
export function useStudio() {
  const location = useLocation();
  const [recipe, dispatch] = useReducer(recipeReducer, location.search, initialRecipe);

  const replace = useCallback((next: Recipe) => {
    dispatch({ type: 'replace', recipe: next });
  }, []);
  useRecipeUrlSync(recipe, replace);

  useEffect(() => {
    saveRecipe(recipe);
  }, [recipe]);

  const derived = useMemo(() => {
    const palette = makePalette(recipe.hue, recipe.harmony, recipe.ground);
    const ratio = paletteContrast(palette);
    return {
      palette,
      tile: build(recipe, { palette }),
      contrast: ratio,
      rating: contrastRating(ratio),
      plate: plateNumber(recipe.seed),
      seedLabel: seedLabel(recipe),
      variations: variations(recipe),
    };
  }, [recipe]);

  const actions = useMemo(
    () => ({
      set: (patch: Partial<Recipe>) => {
        dispatch({ type: 'set', patch });
      },
      newSeed: () => {
        dispatch({ type: 'newSeed' });
      },
      randomize: () => {
        dispatch({ type: 'randomize', entropy: Date.now() % 100000 });
      },
      replace,
    }),
    [replace],
  );

  return { recipe, ...derived, actions };
}

export type StudioModel = ReturnType<typeof useStudio>;
