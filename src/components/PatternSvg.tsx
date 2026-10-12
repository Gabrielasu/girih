import { memo, useId, type CSSProperties, type SVGProps } from 'react';
import type { PatternTile } from '@/engine';
import { fmt } from '@/engine';

interface PatternSvgProps {
  tile: PatternTile;
  /** viewBox width and height of the painted area. */
  width: number;
  height: number;
  /** Accessible description. Omit for purely decorative thumbnails. */
  label?: string;
  className?: string;
  style?: CSSProperties;
  preserveAspectRatio?: string;
  /** Force every stroke to this width (thumbnails use 1px hairlines). */
  strokeWidth?: number;
  /** Override the geometry of the filled rect, e.g. for the animated landing hero. */
  rect?: SVGProps<SVGRectElement>;
}

/**
 * Renders a pattern tile as an SVG `<pattern>` filling a rectangle. The
 * browser repeats the tile natively, so cost is independent of canvas size.
 */
export const PatternSvg = memo(function PatternSvg({
  tile,
  width,
  height,
  label,
  className,
  style,
  preserveAspectRatio = 'xMidYMid slice',
  strokeWidth,
  rect,
}: PatternSvgProps) {
  const id = `pat-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={preserveAspectRatio}
      className={className}
      style={style}
      focusable="false"
      {...a11y}
    >
      <defs>
        <pattern
          id={id}
          width={tile.width}
          height={tile.height}
          patternUnits="userSpaceOnUse"
          patternTransform={tile.rotation ? `rotate(${fmt(tile.rotation)})` : undefined}
        >
          <rect width={tile.width} height={tile.height} fill={tile.background} />
          {tile.shapes.map((s, i) => (
            <path
              key={i}
              d={s.d}
              transform={s.transform}
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={strokeWidth ?? s.strokeWidth}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </pattern>
      </defs>
      <rect width={width} height={height} {...rect} fill={`url(#${id})`} />
    </svg>
  );
});
