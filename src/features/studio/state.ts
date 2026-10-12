import { nextSeed, normalizeRecipe, randomRecipe, type Recipe } from '@/engine';

export type RecipeAction =
  | { type: 'set'; patch: Partial<Recipe> }
  | { type: 'newSeed' }
  | { type: 'randomize'; entropy: number }
  | { type: 'replace'; recipe: Recipe };

/**
 * Pure reducer for the Studio recipe. Every action passes through
 * normalizeRecipe so state can never hold an invalid recipe.
 */
export function recipeReducer(state: Recipe, action: RecipeAction): Recipe {
  switch (action.type) {
    case 'set':
      return normalizeRecipe({ ...state, ...action.patch }, state);
    case 'newSeed':
      return { ...state, seed: nextSeed(state.seed) };
    case 'randomize':
      return randomRecipe(action.entropy, state);
    case 'replace':
      return normalizeRecipe(action.recipe, state);
  }
}
