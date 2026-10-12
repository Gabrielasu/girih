import type { GridKind } from './types';

export interface GridDef {
  label: string;
  /** 22 x 22 icon path used by the UI. */
  icon: string;
}

export const GRID_DEFS: Readonly<Record<GridKind, GridDef>> = {
  square: { label: 'Square', icon: 'M2 2h18v18H2zM11 2v18M2 11h18' },
  brick: { label: 'Brick', icon: 'M2 3h18v16H2zM2 11h18M11 3v8M6 11v8M16 11v8' },
  diamond: { label: 'Diamond', icon: 'M11 1l10 10-10 10L1 11zM6 6l10 10M16 6L6 16' },
};

/** Where copies of the four-quadrant block are placed inside one repeat. */
export function gridOffsets(grid: GridKind, tile: number): readonly (readonly [number, number])[] {
  if (grid === 'brick') {
    return [
      [0, 0],
      [tile / 2, tile],
      [-tile / 2, tile],
    ];
  }
  return [[0, 0]];
}

/** Size of one repeat. Brick stacks two rows, offset by half a tile. */
export function repeatSize(grid: GridKind, tile: number): { width: number; height: number } {
  return { width: tile, height: grid === 'brick' ? 2 * tile : tile };
}

/** Total `patternTransform` rotation. Diamond is a square grid turned 45 degrees. */
export function patternRotation(grid: GridKind, rotation: number): number {
  return (grid === 'diamond' ? 45 : 0) + rotation;
}

export interface RepeatFrame {
  width: number;
  height: number;
  /** True when the frame is an exact period of the rotated pattern. */
  seamless: boolean;
}

/**
 * The smallest axis aligned rectangle that tiles seamlessly once the repeat
 * is rotated. Exact for multiples of 45 degrees; for other angles no small
 * rectangular period exists, so a generous swatch is returned instead.
 */
export function repeatFrame(width: number, height: number, rotationDeg: number): RepeatFrame {
  const a = ((rotationDeg % 180) + 180) % 180;
  if (a === 0) return { width, height, seamless: true };
  if (a === 90) return { width: height, height: width, seamless: true };
  if (a === 45 || a === 135) {
    // Lattice vectors (w,0) and (0,h) rotated by 45 degrees. Solving for the
    // shortest integer combination that is purely horizontal (or vertical)
    // gives a square period of side sqrt(2) * w * h / gcd(w, h).
    const side = (Math.SQRT2 * width * height) / gcd(Math.round(width), Math.round(height));
    return { width: side, height: side, seamless: true };
  }
  const side = Math.max(4 * Math.max(width, height), 480);
  return { width: side, height: side, seamless: false };
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}
