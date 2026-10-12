import { useMemo } from 'react';
import { PatternSvg } from '@/components/PatternSvg';
import { build, type Recipe } from '@/engine';
import { MonoLabel } from '@/components/MonoLabel';
import styles from './Variations.module.css';
import type { StudioModel } from './useStudio';

function VariationThumb({ recipe, onPick }: { recipe: Recipe; onPick: () => void }) {
  const tile = useMemo(() => build(recipe, { tile: 40, line: recipe.line > 0 ? 1 : 0 }), [recipe]);
  const label = `${recipe.symmetry} · ${recipe.motif}`;
  return (
    <button
      type="button"
      className={styles.item}
      onClick={onPick}
      aria-label={`Use variation ${label}`}
    >
      <PatternSvg tile={tile} width={120} height={84} strokeWidth={1} className={styles.thumb} />
      <span className={styles.label}>{label}</span>
    </button>
  );
}

/** 05 Variations: six seeded neighbours of the current pattern. */
export function Variations({ studio }: { studio: StudioModel }) {
  return (
    <section aria-label="Variations" className={styles.strip}>
      <div className={styles.intro}>
        <MonoLabel>05 Variations</MonoLabel>
        <span className={styles.text}>
          Variations of the current pattern. Select one to use it.
        </span>
      </div>
      <ul className={styles.list}>
        {studio.variations.map((v) => (
          <li key={v.seed}>
            <VariationThumb
              recipe={v}
              onPick={() => {
                studio.actions.replace(v);
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
