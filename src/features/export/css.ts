import { fmt, type PatternTile } from '@/engine';
import { patternToSvg } from './svg';

/** A CSS declaration block that paints the pattern as a repeating background. */
export function patternToCss(tile: PatternTile): string {
  const { svg, width, height } = patternToSvg(tile);
  const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return [
    `background-color: ${tile.background};`,
    `background-image: url("${uri}");`,
    `background-size: ${fmt(width)}px ${fmt(height)}px;`,
    'background-repeat: repeat;',
  ].join('\n');
}
