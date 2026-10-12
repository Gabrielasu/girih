import type { CSSProperties } from 'react';
import { cx } from '@/lib/cx';
import styles from './Swatches.module.css';

const ROLE_NAMES = ['Ground', 'Primary', 'Secondary', 'Accent'];

interface SwatchesProps {
  colors: readonly string[];
  /** full: chip + hex, compact: chips only, mini: 14px chips inline. */
  variant?: 'full' | 'compact' | 'mini';
  className?: string;
}

/** Palette chips. Hex codes are shown as text so color is never the only cue. */
export function Swatches({ colors, variant = 'full', className }: SwatchesProps) {
  if (variant === 'mini') {
    return (
      <span
        className={cx(styles.mini, className)}
        role="img"
        aria-label={`Palette ${colors.join(', ')}`}
      >
        {colors.map((hex, i) => (
          <span key={`${hex}-${i}`} className={styles.miniChip} style={{ background: hex }} />
        ))}
      </span>
    );
  }
  return (
    <ul
      className={cx(styles.row, variant === 'compact' && styles.compact, className)}
      style={{ '--count': colors.length } as CSSProperties}
      aria-label="Palette"
    >
      {colors.map((hex, i) => (
        <li key={`${hex}-${i}`} className={styles.cell}>
          <span className={styles.chip} style={{ background: hex }} />
          {variant === 'full' ? (
            <span className={styles.hex}>
              <span className="visually-hidden">{ROLE_NAMES[i] ?? 'Color'} </span>
              {hex}
            </span>
          ) : (
            <span className="visually-hidden">
              {ROLE_NAMES[i] ?? 'Color'} {hex}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
