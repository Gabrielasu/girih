import { GRIDS, GROUNDS, HARMONIES, MOTIF_KINDS, SYMMETRIES } from '@/engine';

const list = (xs: readonly string[]) => xs.map((x) => `"${x}"`).join(', ');

/** System prompt asking for a single JSON recipe and nothing else. */
export const SYSTEM_PROMPT = [
  'You configure Girih, a seamless geometric pattern generator.',
  'Given a short style description, reply with ONLY one JSON object, no prose and no code fences.',
  'Fields:',
  `- grid: one of ${list(GRIDS)}`,
  `- symmetry: one of ${list(SYMMETRIES)} (wallpaper groups: p1 translate, p2 half turn, pm mirror, pmm kaleidoscope, p4 quarter turn, p4m full star)`,
  `- motif: one of ${list(MOTIF_KINDS)}`,
  '- hue: key hue in degrees, integer 0 to 355',
  `- harmony: one of ${list(HARMONIES)}`,
  `- ground: one of ${list(GROUNDS)} (paper is a light background, ink is dark)`,
  '- tile: optional tile size in px, 60 to 240',
  '- rotation: optional rotation in degrees, 0 to 90',
  '- line: optional outline weight, 0 to 4 (0 means no outlines)',
  '- name: a short evocative title, at most 6 words',
  '- reason: one sentence explaining the choices',
].join('\n');
