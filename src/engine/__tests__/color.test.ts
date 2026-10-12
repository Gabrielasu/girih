// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  contrast,
  contrastRating,
  HARMONY_DEFS,
  hsl,
  isHex,
  luminance,
  MIN_PRIMARY_CONTRAST,
  palette,
  paletteContrast,
} from '../color';
import { GROUNDS, HARMONIES } from '../types';

describe('hsl', () => {
  it('converts primaries', () => {
    expect(hsl(0, 100, 50)).toBe('#FF0000');
    expect(hsl(120, 100, 50)).toBe('#00FF00');
    expect(hsl(240, 100, 50)).toBe('#0000FF');
  });

  it('handles greys and extremes', () => {
    expect(hsl(0, 0, 0)).toBe('#000000');
    expect(hsl(0, 0, 100)).toBe('#FFFFFF');
    expect(hsl(200, 0, 50)).toBe('#808080');
  });

  it('wraps hue in both directions', () => {
    expect(hsl(360, 70, 40)).toBe(hsl(0, 70, 40));
    expect(hsl(-30, 70, 40)).toBe(hsl(330, 70, 40));
    expect(hsl(725, 70, 40)).toBe(hsl(5, 70, 40));
  });

  it('clamps saturation and lightness', () => {
    expect(hsl(10, 150, 50)).toBe(hsl(10, 100, 50));
    expect(hsl(10, 50, -20)).toBe('#000000');
  });
});

describe('luminance and contrast', () => {
  it('matches WCAG reference values', () => {
    expect(luminance('#FFFFFF')).toBeCloseTo(1, 6);
    expect(luminance('#000000')).toBe(0);
    expect(contrast('#FFFFFF', '#000000')).toBeCloseTo(21, 6);
    expect(contrast('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
  });

  it('is symmetric and at least 1', () => {
    expect(contrast('#2135F5', '#FBFBFA')).toBeCloseTo(contrast('#FBFBFA', '#2135F5'), 10);
    expect(contrast('#123456', '#123456')).toBe(1);
  });

  it('rejects malformed colors', () => {
    expect(isHex('#12345G')).toBe(false);
    expect(isHex('#abcdef')).toBe(true);
    expect(() => luminance('red')).toThrow(/Invalid hex/);
  });
});

describe('contrastRating', () => {
  it('uses WCAG thresholds', () => {
    expect(contrastRating(7)).toBe('AA');
    expect(contrastRating(4.5)).toBe('AA');
    expect(contrastRating(4.49)).toBe('AA LARGE');
    expect(contrastRating(3)).toBe('AA LARGE');
    expect(contrastRating(2.99)).toBe('LOW');
  });
});

describe('palette', () => {
  it('reproduces the mockup default palette', () => {
    const p = palette(230, 'split', 'paper');
    expect(p.line).toBe('#121212');
    expect(p.bg).toBe(hsl(230 + 150, 18, 95));
    expect(p.c2).toBe(hsl(380, 64, 66));
    expect(p.c3).toBe(hsl(440, 80, 30));
    expect(paletteContrast(p)).toBeGreaterThanOrEqual(MIN_PRIMARY_CONTRAST);
  });

  it('uses a dark ground and light lines on ink', () => {
    const p = palette(160, 'triadic', 'ink');
    expect(p.bg).toBe(hsl(160, 28, 9));
    expect(p.line).toBe('#F1F1EC');
    expect(luminance(p.bg)).toBeLessThan(luminance(p.c1));
  });

  it('auto-corrects the primary color to reach the minimum contrast on every hue', () => {
    for (const harmony of HARMONIES) {
      for (const ground of GROUNDS) {
        for (let hue = 0; hue < 360; hue += 5) {
          const p = palette(hue, harmony, ground);
          expect(paletteContrast(p), `${harmony} ${ground} ${hue}`).toBeGreaterThanOrEqual(
            MIN_PRIMARY_CONTRAST,
          );
        }
      }
    }
  });

  it('darkens yellow on paper until it passes', () => {
    // Pure yellow at 44% lightness fails on a light ground, so it must be corrected.
    const uncorrected = hsl(60, 72, 44);
    const p = palette(60, 'analogous', 'paper');
    expect(contrast(uncorrected, p.bg)).toBeLessThan(MIN_PRIMARY_CONTRAST);
    expect(p.c1).not.toBe(uncorrected);
    expect(luminance(p.c1)).toBeLessThan(luminance(uncorrected));
  });

  it('applies each harmony offset to c2', () => {
    for (const harmony of HARMONIES) {
      const off = HARMONY_DEFS[harmony].offsets[1];
      expect(palette(100, harmony, 'paper').c2).toBe(hsl(100 + off, 64, 66));
    }
  });
});
