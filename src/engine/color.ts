import type { GroundKind, HarmonyKind, Palette } from './types';

export interface HarmonyDef {
  label: string;
  /** Hue offsets in degrees for c1, c2 and c3 relative to the key hue. */
  offsets: readonly [number, number, number];
}

export const HARMONY_DEFS: Readonly<Record<HarmonyKind, HarmonyDef>> = {
  analogous: { label: 'Analogous', offsets: [0, 32, -32] },
  complement: { label: 'Complement', offsets: [0, 180, 24] },
  triadic: { label: 'Triadic', offsets: [0, 120, 240] },
  split: { label: 'Split', offsets: [0, 150, 210] },
};

export const GROUND_LABELS: Readonly<Record<GroundKind, string>> = {
  paper: 'Paper ground',
  ink: 'Ink ground',
};

/** Line color on each ground. */
export const LINE_COLORS: Readonly<Record<GroundKind, string>> = {
  paper: '#121212',
  ink: '#F1F1EC',
};

/** Minimum contrast between the primary color and the ground. */
export const MIN_PRIMARY_CONTRAST = 3.2;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Converts HSL (degrees, percent, percent) to an uppercase #RRGGBB string. */
export function hsl(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const lig = clamp(l, 0, 100) / 100;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const x = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${x(f(0))}${x(f(8))}${x(f(4))}`.toUpperCase();
}

const HEX_RE = /^#[0-9a-f]{6}$/i;

export function isHex(value: string): boolean {
  return HEX_RE.test(value);
}

/** WCAG 2.x relative luminance of a #RRGGBB color. */
export function luminance(hex: string): number {
  if (!isHex(hex)) throw new Error(`Invalid hex color: ${hex}`);
  const [r = 0, g = 0, b = 0] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors, from 1 to 21. */
export function contrast(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export type ContrastRating = 'AA' | 'AA LARGE' | 'LOW';

export function contrastRating(ratio: number): ContrastRating {
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA LARGE';
  return 'LOW';
}

/**
 * Builds a four color palette from a key hue and a harmony rule. The primary
 * color is darkened on paper (or lightened on ink) in 3% steps until it
 * reaches MIN_PRIMARY_CONTRAST against the ground.
 */
export function palette(hue: number, harmony: HarmonyKind, ground: GroundKind): Palette {
  const [o0, o1, o2] = HARMONY_DEFS[harmony].offsets;
  const paper = ground === 'paper';
  const bg = paper ? hsl(hue + o1, 18, 95) : hsl(hue, 28, 9);
  let l1 = paper ? 44 : 64;
  let c1 = hsl(hue + o0, 72, l1);
  for (let i = 0; i < 12 && contrast(c1, bg) < MIN_PRIMARY_CONTRAST; i++) {
    l1 += paper ? -3 : 3;
    c1 = hsl(hue + o0, 72, l1);
  }
  return {
    bg,
    c1,
    c2: hsl(hue + o1, 64, paper ? 66 : 42),
    c3: hsl(hue + o2, 80, paper ? 30 : 74),
    line: LINE_COLORS[ground],
  };
}

/** Contrast of the primary color against the ground, as shown in the Studio badge. */
export function paletteContrast(p: Palette): number {
  return contrast(p.c1, p.bg);
}
