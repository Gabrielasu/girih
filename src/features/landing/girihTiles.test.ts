import { describe, expect, it } from 'vitest';
import { edgeMidpoints, GIRIH_TILES, tracePolygon } from './girihTiles';

describe('girih tiles', () => {
  it('has the five classical tiles', () => {
    expect(GIRIH_TILES.map((t) => t.name)).toEqual([
      'Decagon',
      'Pentagon',
      'Hexagon',
      'Bowtie',
      'Rhombus',
    ]);
  });

  it('closes every polygon (angles sum to (n - 2) x 180)', () => {
    for (const t of GIRIH_TILES) {
      const sum = t.angles.reduce((a, b) => a + b, 0);
      expect(sum).toBe((t.angles.length - 2) * 180);
    }
  });

  it('fits each tile inside the 100 x 100 box, touching at least one side', () => {
    for (const t of GIRIH_TILES) {
      const pts = tracePolygon(t.angles);
      expect(pts).toHaveLength(t.angles.length);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      expect(Math.min(...xs)).toBeGreaterThanOrEqual(-1e-9);
      expect(Math.max(...xs)).toBeLessThanOrEqual(100 + 1e-9);
      const spanX = Math.max(...xs) - Math.min(...xs);
      const spanY = Math.max(...ys) - Math.min(...ys);
      expect(Math.max(spanX, spanY)).toBeCloseTo(100, 6);
    }
  });

  it('closes the strapwork polyline', () => {
    const square = tracePolygon([90, 90, 90, 90]);
    const strap = edgeMidpoints(square);
    expect(strap).toHaveLength(5);
    expect(strap[0]).toEqual(strap[4]);
  });
});
