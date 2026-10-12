import type { MotifKind } from './types';

/**
 * Palette role of a motif layer. 0 to 3 index into [bg, c1, c2, c3];
 * LINE_ROLE draws an unfilled stroke in the palette's line color.
 */
export type MotifRole = -1 | 0 | 1 | 2 | 3;
export const LINE_ROLE = -1 as const;

export interface MotifLayer {
  /** SVG path data in a 100 x 100 design box anchored at the origin. */
  d: string;
  role: MotifRole;
}

export interface MotifDef {
  label: string;
  layers: readonly MotifLayer[];
}

const layer = (d: string, role: MotifRole): MotifLayer => ({ d, role });

/**
 * The six built-in motifs. Each is drawn in one quadrant of the tile and then
 * copied into the other three quadrants by the symmetry group.
 */
export const MOTIFS: Readonly<Record<MotifKind, MotifDef>> = {
  petal: {
    label: 'Petal',
    layers: [
      layer('M0 0C45 8 70 35 100 100C35 70 8 45 0 0Z', 1),
      layer('M0 0L72 72', LINE_ROLE),
      layer('M-18 0a18 18 0 1 0 36 0a18 18 0 1 0 -36 0Z', 2),
    ],
  },
  arcs: {
    label: 'Arcs',
    layers: [
      layer('M0 0L100 0A100 100 0 0 1 0 100Z', 1),
      layer('M0 0L68 0A68 68 0 0 1 0 68Z', 0),
      layer('M0 0L38 0A38 38 0 0 1 0 38Z', 2),
    ],
  },
  kite: {
    label: 'Kite',
    layers: [
      layer('M0 0L100 34L50 50L34 100Z', 1),
      layer('M50 50L100 100L66 100L50 66Z', 2),
      layer('M100 0L100 22L78 0Z', 3),
    ],
  },
  wave: {
    label: 'Wave',
    layers: [
      layer('M0 28Q25 4 50 28T100 28L100 52Q75 28 50 52T0 52Z', 1),
      layer('M0 78Q25 60 50 78T100 78L100 92Q75 74 50 92T0 92Z', 2),
    ],
  },
  dots: {
    label: 'Dots',
    layers: [
      layer('M5 25a20 20 0 1 0 40 0a20 20 0 1 0 -40 0Z', 1),
      layer('M63 75a12 12 0 1 0 24 0a12 12 0 1 0 -24 0Z', 2),
      layer('M69 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z', 3),
    ],
  },
  leaf: {
    label: 'Leaf',
    layers: [
      layer('M8 92C8 40 40 8 92 8C92 60 60 92 8 92Z', 1),
      layer('M8 92L92 8', LINE_ROLE),
      layer('M70 78a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z', 3),
    ],
  },
};
