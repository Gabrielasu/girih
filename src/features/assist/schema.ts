import { z } from 'zod';
import {
  GRIDS,
  GROUNDS,
  HARMONIES,
  MOTIF_KINDS,
  normalizeRecipe,
  SYMMETRIES,
  type Recipe,
} from '@/engine';

/**
 * The JSON shape Claude must return. Structural fields are required, scale
 * fields are optional. Numbers are range checked here and snapped to the
 * slider steps by normalizeRecipe afterwards.
 */
export const AssistSuggestionSchema = z.object({
  grid: z.enum(GRIDS),
  symmetry: z.enum(SYMMETRIES),
  motif: z.enum(MOTIF_KINDS),
  hue: z.number().min(0).max(360),
  harmony: z.enum(HARMONIES),
  ground: z.enum(GROUNDS),
  tile: z.number().min(60).max(240).optional(),
  rotation: z.number().min(0).max(90).optional(),
  line: z.number().min(0).max(4).optional(),
  name: z.string().trim().max(80).optional(),
  reason: z.string().trim().max(400).optional(),
});

export type AssistSuggestion = z.infer<typeof AssistSuggestionSchema>;

export class AssistParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssistParseError';
  }
}

/** Pulls the first JSON object out of a model reply, tolerating code fences or prose. */
export function extractJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start)
    throw new AssistParseError('The reply did not contain a recipe.');
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new AssistParseError('The reply was not valid JSON.');
  }
}

/** Validates a model reply and returns it as a full recipe based on `current`. */
export function parseSuggestion(
  text: string,
  current: Recipe,
): { recipe: Recipe; name?: string; reason?: string } {
  const result = AssistSuggestionSchema.safeParse(extractJson(text));
  if (!result.success) {
    const first = result.error.issues[0];
    const where = first?.path.join('.') || 'recipe';
    throw new AssistParseError(
      `The suggested recipe was invalid (${where}: ${first?.message ?? 'unknown'}).`,
    );
  }
  const { name, reason, ...fields } = result.data;
  return {
    recipe: normalizeRecipe({ ...current, ...fields }, current),
    ...(name ? { name } : {}),
    ...(reason ? { reason } : {}),
  };
}

export interface RecipeChange {
  key: keyof Recipe;
  from: string;
  to: string;
}

const DIFF_KEYS = [
  'grid',
  'symmetry',
  'motif',
  'hue',
  'harmony',
  'ground',
  'tile',
  'rotation',
  'line',
] as const satisfies readonly (keyof Recipe)[];

/** Human readable list of fields that differ between two recipes. */
export function diffRecipes(from: Recipe, to: Recipe): RecipeChange[] {
  return DIFF_KEYS.filter((k) => from[k] !== to[k]).map((key) => ({
    key,
    from: String(from[key]),
    to: String(to[key]),
  }));
}
