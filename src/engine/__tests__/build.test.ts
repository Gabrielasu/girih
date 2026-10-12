// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { build, buildShapes } from '../build';
import { palette } from '../color';
import { MOTIFS } from '../motifs';
import { DEFAULT_RECIPE } from '../recipe';
import type { Recipe } from '../types';

const r = (patch: Partial<Recipe> = {}): Recipe => ({ ...DEFAULT_RECIPE, ...patch });

describe('build', () => {
  it('is deterministic', () => {
    expect(build(r())).toEqual(build(r()));
  });

  it('builds 4 quadrants x layers, doubled for p4m and tripled for brick', () => {
    const layers = MOTIFS.petal.layers.length;
    expect(build(r({ symmetry: 'p4' })).shapes).toHaveLength(4 * layers);
    expect(build(r({ symmetry: 'p4m' })).shapes).toHaveLength(8 * layers);
    expect(build(r({ symmetry: 'p4', grid: 'brick' })).shapes).toHaveLength(12 * layers);
  });

  it('reports size, rotation and background', () => {
    const t = build(r({ grid: 'diamond', rotation: 15, tile: 100 }));
    expect(t.width).toBe(100);
    expect(t.height).toBe(100);
    expect(t.rotation).toBe(60);
    expect(t.background).toBe(palette(230, 'split', 'paper').bg);
    expect(build(r({ grid: 'brick', tile: 100 })).height).toBe(200);
  });

  it('honours tile, line and palette overrides', () => {
    const custom = { bg: '#000000', c1: '#111111', c2: '#222222', c3: '#333333', line: '#444444' };
    const t = build(r(), { tile: 40, line: 0, palette: custom });
    expect(t.width).toBe(40);
    expect(t.background).toBe('#000000');
    const filled = t.shapes.filter((s) => s.fill !== 'none');
    expect(filled.every((s) => s.stroke === 'none' && s.strokeWidth === 0)).toBe(true);
  });

  it('always strokes line layers at least 1px, even with outlines off', () => {
    const shapes = buildShapes(r({ motif: 'leaf' }), 100, palette(0, 'split', 'paper'), 0);
    const lines = shapes.filter((s) => s.fill === 'none');
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((s) => s.strokeWidth === 1 && s.stroke === '#121212')).toBe(true);
  });

  it('outlines filled shapes when line > 0', () => {
    const shapes = buildShapes(r({ motif: 'dots' }), 100, palette(0, 'split', 'ink'), 2);
    expect(shapes.every((s) => s.stroke === '#F1F1EC' && s.strokeWidth === 2)).toBe(true);
  });

  it('changes the geometry when the symmetry changes', () => {
    const a = build(r({ symmetry: 'p1' })).shapes.map((s) => s.transform);
    const b = build(r({ symmetry: 'pmm' })).shapes.map((s) => s.transform);
    expect(a).not.toEqual(b);
  });
});
