import { mulberry32, pick } from './random';
import { snapHue } from './recipe';
import { GRIDS, HARMONIES, MOTIF_KINDS, SYMMETRIES, type Recipe } from './types';

export const VARIATION_COUNT = 6;

/**
 * Six seeded neighbours of a recipe. Each keeps the scale settings and may
 * swap motif, symmetry, harmony or grid and nudge the hue (snapped to the
 * 5 degree hue step so every variation is a valid recipe). The seed fully
 * determines the set, and adopting variation i moves the seed to seed + i + 1.
 */
export function variations(recipe: Readonly<Recipe>, count = VARIATION_COUNT): Recipe[] {
  const r = mulberry32(recipe.seed);
  return Array.from({ length: count }, (_, i) => {
    // Evaluation order matters: it fixes which random draw feeds which field.
    const motif = r() < 0.6 ? pick(r, MOTIF_KINDS) : recipe.motif;
    const symmetry = r() < 0.6 ? pick(r, SYMMETRIES) : recipe.symmetry;
    const hue = snapHue(recipe.hue + Math.floor(r() * 140 - 70), recipe.hue);
    const harmony = r() < 0.5 ? pick(r, HARMONIES) : recipe.harmony;
    const grid = r() < 0.25 ? pick(r, GRIDS) : recipe.grid;
    return { ...recipe, motif, symmetry, hue, harmony, grid, seed: recipe.seed + i + 1 };
  });
}
