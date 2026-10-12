import type { SymmetryKind } from './types';

/** An isometry applied to one quadrant of the tile. */
export type SymmetryOp = 'id' | 'mx' | 'my' | 'r90' | 'r180' | 'r270';

export interface SymmetryDef {
  label: string;
  /** Ops for the quadrants in reading order: top left, top right, bottom left, bottom right. */
  ops: readonly [SymmetryOp, SymmetryOp, SymmetryOp, SymmetryOp];
  /** Also reflect each quadrant across its diagonal (p4m). */
  diagonal: boolean;
}

export const SYMMETRY_GROUPS: Readonly<Record<SymmetryKind, SymmetryDef>> = {
  p1: { label: 'Translate', ops: ['id', 'id', 'id', 'id'], diagonal: false },
  p2: { label: 'Half turn', ops: ['id', 'r180', 'r180', 'id'], diagonal: false },
  pm: { label: 'Mirror', ops: ['id', 'id', 'my', 'my'], diagonal: false },
  pmm: { label: 'Kaleido', ops: ['id', 'mx', 'my', 'r180'], diagonal: false },
  p4: { label: 'Quarter turn', ops: ['id', 'r90', 'r270', 'r180'], diagonal: false },
  p4m: { label: 'Full star', ops: ['id', 'r90', 'r270', 'r180'], diagonal: true },
};

/** Reflection across the motif's main diagonal, appended for p4m. */
export const DIAGONAL_MIRROR = 'matrix(0 1 1 0 0 0)';

/** Rounds to 4 decimals and drops float noise such as 0.35000000000000003. */
export const fmt = (n: number): string => {
  const r = Math.round(n * 10000) / 10000;
  return String(Object.is(r, -0) ? 0 : r);
};

/**
 * SVG transform that maps the 100 x 100 motif box onto a quadrant of edge
 * `size` whose top left corner is at (qx, qy).
 */
export function opTransform(op: SymmetryOp, qx: number, qy: number, size: number): string {
  const s = size / 100;
  switch (op) {
    case 'mx':
      return `translate(${fmt(qx + size)} ${fmt(qy)}) scale(${fmt(-s)} ${fmt(s)})`;
    case 'my':
      return `translate(${fmt(qx)} ${fmt(qy + size)}) scale(${fmt(s)} ${fmt(-s)})`;
    case 'r180':
      return `translate(${fmt(qx + size)} ${fmt(qy + size)}) scale(${fmt(-s)} ${fmt(-s)})`;
    case 'r90':
      return `translate(${fmt(qx + size)} ${fmt(qy)}) rotate(90) scale(${fmt(s)})`;
    case 'r270':
      return `translate(${fmt(qx)} ${fmt(qy + size)}) rotate(-90) scale(${fmt(s)})`;
    case 'id':
      return `translate(${fmt(qx)} ${fmt(qy)}) scale(${fmt(s)})`;
  }
}
