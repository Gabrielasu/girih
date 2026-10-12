import { PatternSvg } from '@/components/PatternSvg';
import { HARMONY_DEFS, MOTIFS } from '@/engine';
import { cx } from '@/lib/cx';
import styles from './Canvas.module.css';
import type { StudioModel } from './useStudio';

/** The plate: rulers, crop marks and the live pattern, plus its caption. */
export function Canvas({ studio }: { studio: StudioModel }) {
  const { recipe, tile } = studio;
  return (
    <>
      <div className={styles.frame}>
        <div className={styles.corner} aria-hidden="true" />
        <div className={styles.rulerX} aria-hidden="true" />
        <div className={styles.rulerY} aria-hidden="true" />
        <div className={styles.sheet}>
          <span className={cx(styles.mark, styles.tl)} aria-hidden="true" />
          <span className={cx(styles.mark, styles.tr)} aria-hidden="true" />
          <span className={cx(styles.mark, styles.bl)} aria-hidden="true" />
          <span className={cx(styles.mark, styles.br)} aria-hidden="true" />
          <PatternSvg
            tile={tile}
            width={800}
            height={560}
            className={styles.svg}
            label="Live pattern built from the current recipe"
          />
        </div>
      </div>
      <p className={styles.caption} data-testid="plate-caption">
        <span>
          Plate {studio.plate} · {recipe.symmetry} · {MOTIFS[recipe.motif].label} ·{' '}
          {HARMONY_DEFS[recipe.harmony].label} · Seed {studio.seedLabel}
        </span>
        <span className={styles.contrast}>
          <span>Contrast {studio.contrast.toFixed(1)}:1</span>
          <span className={cx(styles.badge, studio.rating === 'LOW' && styles.badgeLow)}>
            {studio.rating}
          </span>
        </span>
      </p>
    </>
  );
}
