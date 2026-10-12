/**
 * Geometry for the five classical girih tiles shown on the index page.
 * Each tile is traced edge by edge from its interior angles, scaled into a
 * 100 x 100 box, and its strapwork is the polyline joining edge midpoints.
 */

export interface GirihTileDef {
  name: string;
  /** Interior angles in degrees, in drawing order. */
  angles: readonly number[];
  caption: string;
  fill: string;
  knot: string;
}

export interface GirihTile extends GirihTileDef {
  points: string;
  strap: string;
}

export const GIRIH_TILE_DEFS: readonly GirihTileDef[] = [
  {
    name: 'Decagon',
    angles: Array<number>(10).fill(144),
    caption: '10 × 144°',
    fill: '#2135F5',
    knot: '#FFFFFF',
  },
  {
    name: 'Pentagon',
    angles: Array<number>(5).fill(108),
    caption: '5 × 108°',
    fill: '#FBFBFA',
    knot: '#2135F5',
  },
  {
    name: 'Hexagon',
    angles: [72, 144, 144, 72, 144, 144],
    caption: '72° · 144°',
    fill: '#121212',
    knot: '#FFFFFF',
  },
  {
    name: 'Bowtie',
    angles: [72, 72, 216, 72, 72, 216],
    caption: '72° · 216°',
    fill: '#C9CEFF',
    knot: '#121212',
  },
  {
    name: 'Rhombus',
    angles: [72, 108, 72, 108],
    caption: '72° · 108°',
    fill: '#2135F5',
    knot: '#FFFFFF',
  },
];

type Point = readonly [number, number];

const toList = (pts: readonly Point[]) =>
  pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/** Traces a unit-edge polygon from its interior angles and fits it in a 100 box. */
export function tracePolygon(angles: readonly number[]): Point[] {
  let x = 0;
  let y = 0;
  let heading = 0;
  const pts: Point[] = [[0, 0]];
  for (const a of angles.slice(0, -1)) {
    x += Math.cos((heading * Math.PI) / 180);
    y += Math.sin((heading * Math.PI) / 180);
    pts.push([x, y]);
    heading += 180 - a;
  }
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX;
  const h = Math.max(...ys) - minY;
  const k = 100 / Math.max(w, h);
  const ox = (100 - w * k) / 2;
  const oy = (100 - h * k) / 2;
  return pts.map(([px, py]) => [ox + (px - minX) * k, oy + (py - minY) * k] as const);
}

/** Closed polyline through the midpoint of every edge. */
export function edgeMidpoints(pts: readonly Point[]): Point[] {
  const mids = pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length] ?? p;
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] as const;
  });
  const first = mids[0];
  return first ? [...mids, first] : mids;
}

export const GIRIH_TILES: readonly GirihTile[] = GIRIH_TILE_DEFS.map((def) => {
  const pts = tracePolygon(def.angles);
  return { ...def, points: toList(pts), strap: toList(edgeMidpoints(pts)) };
});
