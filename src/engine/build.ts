import { palette as makePalette } from './color';
import { gridOffsets, patternRotation, repeatSize } from './grid';
import { LINE_ROLE, MOTIFS } from './motifs';
import { DIAGONAL_MIRROR, opTransform, SYMMETRY_GROUPS } from './symmetry';
import type { Palette, PatternTile, Recipe, Shape } from './types';

export interface BuildOptions {
  /** Override the recipe tile size, used for thumbnails. */
  tile?: number;
  /** Override the recipe line weight. */
  line?: number;
  /** Supply a palette instead of deriving one from the recipe. */
  palette?: Palette;
}

type Geometry = Pick<Recipe, 'grid' | 'symmetry' | 'motif'>;

/**
 * Lays out every motif layer for one repeat. The tile is split into four
 * quadrants; the symmetry group decides how the motif is transformed in
 * each, and the grid decides where copies of the whole block go.
 */
export function buildShapes(g: Geometry, tile: number, pal: Palette, line: number): Shape[] {
  const half = tile / 2;
  const group = SYMMETRY_GROUPS[g.symmetry];
  const layers = MOTIFS[g.motif].layers;
  const roles = [pal.bg, pal.c1, pal.c2, pal.c3] as const;
  const quads = [
    [0, 0],
    [half, 0],
    [0, half],
    [half, half],
  ] as const;
  const shapes: Shape[] = [];
  for (const [ox, oy] of gridOffsets(g.grid, tile)) {
    quads.forEach(([qx, qy], qi) => {
      const base = opTransform(group.ops[qi as 0 | 1 | 2 | 3], qx + ox, qy + oy, half);
      const transforms = group.diagonal ? [base, `${base} ${DIAGONAL_MIRROR}`] : [base];
      for (const transform of transforms) {
        for (const { d, role } of layers) {
          const isLine = role === LINE_ROLE;
          shapes.push({
            d,
            transform,
            fill: isLine ? 'none' : roles[role],
            stroke: isLine || line > 0 ? pal.line : 'none',
            strokeWidth: isLine ? Math.max(line, 1) : line,
          });
        }
      }
    });
  }
  return shapes;
}

/** Builds one repeat of the pattern described by `recipe`. Pure and deterministic. */
export function build(recipe: Recipe, options: BuildOptions = {}): PatternTile {
  const tile = options.tile ?? recipe.tile;
  const line = options.line ?? recipe.line;
  const pal = options.palette ?? makePalette(recipe.hue, recipe.harmony, recipe.ground);
  const { width, height } = repeatSize(recipe.grid, tile);
  return {
    width,
    height,
    rotation: patternRotation(recipe.grid, recipe.rotation),
    background: pal.bg,
    shapes: buildShapes(recipe, tile, pal, line),
  };
}
