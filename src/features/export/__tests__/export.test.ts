import { describe, expect, it } from 'vitest';
import { build, DEFAULT_RECIPE } from '@/engine';
import { patternToCss } from '../css';
import { exportFilename } from '../useExport';
import { patternToSvg } from '../svg';

describe('patternToSvg', () => {
  it('exports one exact repeat for unrotated patterns', () => {
    const out = patternToSvg(build({ ...DEFAULT_RECIPE, tile: 100 }));
    expect(out.seamless).toBe(true);
    expect(out.width).toBe(100);
    expect(out.svg).toMatch(
      /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="100" height="100" viewBox="0 0 100 100">/,
    );
    expect(out.svg).not.toContain('patternTransform');
    const doc = new DOMParser().parseFromString(out.svg, 'image/svg+xml');
    expect(doc.querySelector('parsererror')).toBeNull();
    expect(doc.querySelectorAll('path')).toHaveLength(
      build({ ...DEFAULT_RECIPE, tile: 100 }).shapes.length,
    );
  });

  it('exports the rotated period for diamond grids', () => {
    const out = patternToSvg(build({ ...DEFAULT_RECIPE, grid: 'diamond', tile: 100 }));
    expect(out.svg).toContain('patternTransform="rotate(45)"');
    expect(out.width).toBeCloseTo(141.42, 1);
    expect(out.seamless).toBe(true);
  });

  it('flags non seamless rotations and scales output for PNG', () => {
    const tile = build({ ...DEFAULT_RECIPE, rotation: 20 });
    expect(patternToSvg(tile).seamless).toBe(false);
    const scaled = patternToSvg(build({ ...DEFAULT_RECIPE, tile: 100, line: 1 }), { scale: 2 });
    expect(scaled.width).toBe(200);
    expect(scaled.svg).toContain('width="200"');
    expect(scaled.svg).toContain('viewBox="0 0 100 100"');
    expect(scaled.svg).toContain('stroke-width="2"');
  });
});

describe('patternToCss', () => {
  it('returns a repeating background declaration with an encoded data URI', () => {
    const css = patternToCss(build({ ...DEFAULT_RECIPE, tile: 100 }));
    expect(css).toContain('background-image: url("data:image/svg+xml,%3Csvg');
    expect(css).toContain('background-size: 100px 100px;');
    expect(css).toContain('background-repeat: repeat;');
    expect(css).not.toContain('"<');
  });
});

describe('exportFilename', () => {
  it('names files after the plate, symmetry and motif', () => {
    expect(exportFilename(DEFAULT_RECIPE, 'svg')).toBe('girih-471-p4m-petal.svg');
    expect(exportFilename(DEFAULT_RECIPE, 'png', '@2x')).toBe('girih-471-p4m-petal@2x.png');
  });
});
