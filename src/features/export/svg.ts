import { fmt, repeatFrame, type PatternTile } from '@/engine';

export interface SvgExport {
  svg: string;
  width: number;
  height: number;
  /** False when the rotation has no small rectangular period. */
  seamless: boolean;
}

interface SvgOptions {
  /** Output scale factor (PNG export renders at 2x or 4x). */
  scale?: number;
}

const escapeAttr = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/>/g, '&gt;');

/**
 * Serialises one seamless repeat of a pattern as a standalone SVG document.
 * Rotated patterns are exported as the smallest axis aligned frame that still
 * tiles, so the file can be used directly as a repeating background.
 */
export function patternToSvg(tile: PatternTile, { scale = 1 }: SvgOptions = {}): SvgExport {
  const frame = repeatFrame(tile.width, tile.height, tile.rotation);
  const w = fmt(frame.width);
  const h = fmt(frame.height);
  const transform = tile.rotation ? ` patternTransform="rotate(${fmt(tile.rotation)})"` : '';
  const paths = tile.shapes
    .map(
      (s) =>
        `<path d="${escapeAttr(s.d)}" transform="${escapeAttr(s.transform)}" fill="${escapeAttr(s.fill)}" stroke="${escapeAttr(s.stroke)}" stroke-width="${fmt(s.strokeWidth * scale)}" vector-effect="non-scaling-stroke"/>`,
    )
    .join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${fmt(frame.width * scale)}" height="${fmt(frame.height * scale)}" viewBox="0 0 ${w} ${h}">` +
    `<defs><pattern id="girih" width="${fmt(tile.width)}" height="${fmt(tile.height)}" patternUnits="userSpaceOnUse"${transform}>` +
    `<rect width="${fmt(tile.width)}" height="${fmt(tile.height)}" fill="${escapeAttr(tile.background)}"/>` +
    paths +
    `</pattern></defs><rect width="${w}" height="${h}" fill="url(#girih)"/></svg>`;
  return {
    svg,
    width: frame.width * scale,
    height: frame.height * scale,
    seamless: frame.seamless,
  };
}
