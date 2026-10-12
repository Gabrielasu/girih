import { DEFAULT_RECIPE, type Recipe } from '@/engine';

export interface Specimen {
  /** Three digit plate number shown on the card. */
  num: string;
  title: string;
  recipe: Recipe;
}

type Seed = Pick<
  Recipe,
  'grid' | 'symmetry' | 'motif' | 'hue' | 'harmony' | 'ground' | 'line' | 'seed'
>;

const make = (index: number, title: string, s: Seed): Specimen => ({
  num: String(index + 1).padStart(3, '0'),
  title,
  recipe: { ...DEFAULT_RECIPE, rotation: 0, tile: 140, ...s },
});

/** The twelve example plates on /specimens, in display order. */
export const SPECIMENS: readonly Specimen[] = [
  make(0, 'Blue Hour', {
    grid: 'square',
    symmetry: 'p4m',
    motif: 'petal',
    hue: 230,
    harmony: 'split',
    ground: 'paper',
    line: 1,
    seed: 4471,
  }),
  make(1, 'Terracotta Fans', {
    grid: 'square',
    symmetry: 'pmm',
    motif: 'arcs',
    hue: 12,
    harmony: 'analogous',
    ground: 'paper',
    line: 0,
    seed: 1180,
  }),
  make(2, 'Night Kites', {
    grid: 'diamond',
    symmetry: 'p4',
    motif: 'kite',
    hue: 160,
    harmony: 'triadic',
    ground: 'ink',
    line: 0,
    seed: 3021,
  }),
  make(3, 'Harbour', {
    grid: 'brick',
    symmetry: 'pm',
    motif: 'wave',
    hue: 190,
    harmony: 'complement',
    ground: 'paper',
    line: 0,
    seed: 772,
  }),
  make(4, 'Confetti Study', {
    grid: 'square',
    symmetry: 'p2',
    motif: 'dots',
    hue: 330,
    harmony: 'split',
    ground: 'paper',
    line: 0,
    seed: 5502,
  }),
  make(5, 'Fern Lattice', {
    grid: 'square',
    symmetry: 'p4m',
    motif: 'leaf',
    hue: 95,
    harmony: 'analogous',
    ground: 'ink',
    line: 1,
    seed: 2219,
  }),
  make(6, 'Gilded Scales', {
    grid: 'brick',
    symmetry: 'p1',
    motif: 'arcs',
    hue: 45,
    harmony: 'complement',
    ground: 'ink',
    line: 1,
    seed: 8090,
  }),
  make(7, 'Pinwheel', {
    grid: 'square',
    symmetry: 'p4',
    motif: 'petal',
    hue: 280,
    harmony: 'triadic',
    ground: 'paper',
    line: 0,
    seed: 6614,
  }),
  make(8, 'Signal', {
    grid: 'diamond',
    symmetry: 'pmm',
    motif: 'dots',
    hue: 205,
    harmony: 'analogous',
    ground: 'ink',
    line: 0,
    seed: 909,
  }),
  make(9, 'Red Kite', {
    grid: 'square',
    symmetry: 'pm',
    motif: 'kite',
    hue: 0,
    harmony: 'split',
    ground: 'paper',
    line: 1,
    seed: 3377,
  }),
  make(10, 'Greenhouse', {
    grid: 'square',
    symmetry: 'p2',
    motif: 'leaf',
    hue: 140,
    harmony: 'complement',
    ground: 'paper',
    line: 0,
    seed: 4120,
  }),
  make(11, 'Moiré', {
    grid: 'brick',
    symmetry: 'p4m',
    motif: 'wave',
    hue: 255,
    harmony: 'triadic',
    ground: 'ink',
    line: 0,
    seed: 7701,
  }),
];

/** The featured plate at the top of /specimens. */
export const FEATURED: Specimen = make(13, 'Quarter Turn in Ultramarine', {
  grid: 'square',
  symmetry: 'p4',
  motif: 'arcs',
  hue: 232,
  harmony: 'split',
  ground: 'paper',
  line: 1,
  seed: 2604,
});

/** Tile sizes used for the gallery thumbnails, matching the mockup. */
export const PLATE_TILE = 56;
export const FEATURED_TILE = 110;
