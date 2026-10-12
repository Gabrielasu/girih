import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ButtonLink } from '@/components/Button';
import { Header } from '@/components/Header';
import { PatternSvg } from '@/components/PatternSvg';
import { Swatches } from '@/components/Swatches';
import { build, describeRecipe, palette, SYMMETRIES, type SymmetryKind } from '@/engine';
import { cx } from '@/lib/cx';
import { studioHref } from '@/lib/url-state';
import { FEATURED, FEATURED_TILE, PLATE_TILE, SPECIMENS, type Specimen } from './specimens';
import styles from './SpecimensPage.module.css';

const colorsOf = (s: Specimen) => {
  const p = palette(s.recipe.hue, s.recipe.harmony, s.recipe.ground);
  return [p.bg, p.c1, p.c2, p.c3];
};

function Plate({ specimen }: { specimen: Specimen }) {
  const tile = useMemo(() => build(specimen.recipe, { tile: PLATE_TILE }), [specimen]);
  const { recipe } = specimen;
  return (
    <Link
      to={studioHref(recipe)}
      className={styles.plate}
      aria-label={`${specimen.title}, plate ${specimen.num}. Open in the Studio`}
    >
      <PatternSvg tile={tile} width={300} height={220} className={styles.plateArt} />
      <div className={styles.plateBody}>
        <div className={styles.plateRow}>
          <h3 className={styles.plateTitle}>{specimen.title}</h3>
          <span className={styles.plateNum}>{specimen.num}</span>
        </div>
        <div className={cx(styles.plateRow, styles.plateRowCenter)}>
          <span className={styles.plateMeta}>
            {recipe.symmetry} · {recipe.motif} · {recipe.harmony} {recipe.hue}°
          </span>
          <Swatches variant="mini" colors={colorsOf(specimen)} />
        </div>
      </div>
    </Link>
  );
}

type Filter = 'all' | SymmetryKind;

/** /specimens: a featured plate and twelve example plates built by the engine. */
export function SpecimensPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const featuredTile = useMemo(() => build(FEATURED.recipe, { tile: FEATURED_TILE }), []);
  const visible =
    filter === 'all' ? SPECIMENS : SPECIMENS.filter((s) => s.recipe.symmetry === filter);

  useEffect(() => {
    document.title = 'Specimens · Girih';
  }, []);

  return (
    <div className={styles.page}>
      <Header>
        <div className={styles.headerSpacer} />
        <ButtonLink to="/studio" variant="blue" size="bar" className={styles.newPattern}>
          New pattern
        </ButtonLink>
      </Header>
      <main id="main" className={styles.content}>
        <div className={styles.intro}>
          <h1 className={styles.title}>
            SPECI
            <br />
            MENS
          </h1>
          <div className={styles.introText}>
            <span className={styles.mono}>{SPECIMENS.length} examples</span>
            <p className={styles.lede}>
              Example patterns made with Girih. Open any of them in the studio to view and edit its
              settings.
            </p>
          </div>
        </div>

        <section aria-label="Featured plate" className={styles.featured}>
          <PatternSvg
            tile={featuredTile}
            width={860}
            height={380}
            className={styles.featuredArt}
            label={`${FEATURED.title} pattern`}
          />
          <div className={styles.featuredBody}>
            <div className={styles.featuredHead}>
              <span className={styles.mono}>Featured · {FEATURED.num}</span>
              <h2 className={styles.featuredTitle}>{FEATURED.title}</h2>
            </div>
            <pre className={styles.recipe}>{describeRecipe(FEATURED.recipe, { scale: false })}</pre>
            <Swatches variant="compact" colors={colorsOf(FEATURED)} />
            <ButtonLink to={studioHref(FEATURED.recipe)} variant="ink" className={styles.open}>
              Open in Studio
            </ButtonLink>
          </div>
        </section>

        <div role="group" aria-label="Filter by symmetry" className={styles.filters}>
          {(['all', ...SYMMETRIES] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              className={cx(styles.filter, f === 'all' && styles.filterAll)}
              onClick={() => {
                setFilter(f);
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        <h2 className="visually-hidden">Plates</h2>
        {visible.length > 0 ? (
          <ul className={styles.grid}>
            {visible.map((s) => (
              <li key={s.num}>
                <Plate specimen={s} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>No examples use this symmetry yet.</p>
        )}
      </main>
    </div>
  );
}
