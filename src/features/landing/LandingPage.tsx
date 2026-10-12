import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { AUTHOR_HANDLE, AUTHOR_NAME, AUTHOR_URL, REPO_URL } from '@/app/config';
import { ButtonLink } from '@/components/Button';
import { Header } from '@/components/Header';
import { PatternSvg } from '@/components/PatternSvg';
import { build, DEFAULT_RECIPE, type Recipe } from '@/engine';
import { cx } from '@/lib/cx';
import { studioHref } from '@/lib/url-state';
import { GIRIH_TILES } from './girihTiles';
import styles from './LandingPage.module.css';

type Look = Pick<Recipe, 'grid' | 'symmetry' | 'motif' | 'hue' | 'harmony' | 'ground' | 'line'>;
const recipeOf = (look: Look): Recipe => ({ ...DEFAULT_RECIPE, ...look });

const HERO: Recipe = recipeOf({
  grid: 'square',
  symmetry: 'p4m',
  motif: 'petal',
  hue: 230,
  harmony: 'split',
  ground: 'paper',
  line: 1,
});

const STRIP: readonly Look[] = [
  {
    grid: 'square',
    symmetry: 'pmm',
    motif: 'arcs',
    hue: 12,
    harmony: 'analogous',
    ground: 'paper',
    line: 0,
  },
  {
    grid: 'diamond',
    symmetry: 'p4',
    motif: 'kite',
    hue: 160,
    harmony: 'triadic',
    ground: 'ink',
    line: 0,
  },
  {
    grid: 'brick',
    symmetry: 'pm',
    motif: 'wave',
    hue: 190,
    harmony: 'complement',
    ground: 'paper',
    line: 0,
  },
  {
    grid: 'square',
    symmetry: 'p2',
    motif: 'dots',
    hue: 330,
    harmony: 'split',
    ground: 'paper',
    line: 0,
  },
  {
    grid: 'square',
    symmetry: 'p4m',
    motif: 'leaf',
    hue: 95,
    harmony: 'analogous',
    ground: 'ink',
    line: 1,
  },
  {
    grid: 'brick',
    symmetry: 'p1',
    motif: 'arcs',
    hue: 45,
    harmony: 'complement',
    ground: 'ink',
    line: 1,
  },
  {
    grid: 'square',
    symmetry: 'p4',
    motif: 'petal',
    hue: 280,
    harmony: 'triadic',
    ground: 'paper',
    line: 0,
  },
  {
    grid: 'square',
    symmetry: 'pm',
    motif: 'kite',
    hue: 0,
    harmony: 'split',
    ground: 'paper',
    line: 1,
  },
];

const STEPS = [
  {
    num: '01',
    tag: 'Grid',
    title: 'Choose a grid',
    body: 'Square, brick or diamond. The grid controls how each tile repeats.',
    look: {
      grid: 'brick',
      symmetry: 'p1',
      motif: 'dots',
      hue: 230,
      harmony: 'split',
      ground: 'paper',
      line: 0,
    },
  },
  {
    num: '02',
    tag: 'Symmetry',
    title: 'Apply a symmetry',
    body: 'Six symmetry groups, from simple repetition to mirrored quarter turns.',
    look: {
      grid: 'square',
      symmetry: 'p4',
      motif: 'kite',
      hue: 230,
      harmony: 'split',
      ground: 'paper',
      line: 0,
    },
  },
  {
    num: '03',
    tag: 'Motif',
    title: 'Pick a motif',
    body: 'Six built-in motifs, each designed to join cleanly at the tile edges.',
    look: {
      grid: 'square',
      symmetry: 'pmm',
      motif: 'petal',
      hue: 230,
      harmony: 'split',
      ground: 'paper',
      line: 1,
    },
  },
  {
    num: '04',
    tag: 'Color rule',
    title: 'Set the colors',
    body: 'Choose a base hue and a color harmony. Palettes with low contrast are adjusted automatically.',
    look: {
      grid: 'square',
      symmetry: 'p4m',
      motif: 'arcs',
      hue: 18,
      harmony: 'triadic',
      ground: 'paper',
      line: 0,
    },
  },
] as const satisfies readonly { look: Look; [k: string]: unknown }[];

function Thumb({
  look,
  tile,
  width,
  height,
  className,
}: {
  look: Look;
  tile: number;
  width: number;
  height: number;
  className?: string;
}) {
  const pattern = useMemo(() => build(recipeOf(look), { tile }), [look, tile]);
  return <PatternSvg tile={pattern} width={width} height={height} className={className} />;
}

/** / : the index page introducing Girih and the girih tradition. */
export function LandingPage() {
  const hero = useMemo(() => build(HERO, { tile: 120 }), []);

  useEffect(() => {
    document.title = 'Girih · Pure geometry, endless surfaces';
  }, []);

  return (
    <div className={styles.page}>
      <Header>
        <div className={styles.spacer} />
        <a href={REPO_URL} className={styles.ghLink} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <ButtonLink to="/studio" variant="blue" size="bar" className={styles.cta}>
          Open the studio
        </ButtonLink>
      </Header>

      <main id="main">
        <section className={styles.hero} aria-label="Introduction">
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              PURE
              <br />
              GEOMETRY.
              <br />
              <span className={styles.blue}>ENDLESS</span>
              <br />
              SURFACES.
            </h1>
            <div className={styles.heroFoot}>
              <p className={styles.heroLede}>
                A pattern studio in the spirit of girih, the geometric tilework of Isfahan. Set a
                grid, a symmetry, a motif and a palette, and the surface builds itself.
              </p>
              <div className={styles.heroActions}>
                <ButtonLink to="/studio" variant="ink">
                  Open the studio
                </ButtonLink>
                <ButtonLink to="/specimens" variant="paper">
                  Browse specimens
                </ButtonLink>
              </div>
            </div>
          </div>
          <div className={styles.heroArt}>
            <PatternSvg
              tile={hero}
              width={760}
              height={680}
              className={styles.heroSvg}
              label="Animated hero pattern"
              rect={{ x: -480, y: -480, width: 1720, height: 1640, className: styles.pan }}
            />
            <p className={styles.heroLabel}>
              Plate 001 · p4m · petal
              <br />
              split harmony @ 230° · seed 4471
            </p>
          </div>
        </section>

        <ul className={styles.strip} aria-label="Contact sheet">
          {STRIP.map((look, i) => {
            const num = String(i + 2).padStart(3, '0');
            return (
              <li key={num}>
                <Link
                  to={studioHref(recipeOf(look))}
                  className={styles.stripLink}
                  aria-label={`Plate ${num}, ${look.symmetry} ${look.motif}. Open in the Studio`}
                >
                  <Thumb
                    look={look}
                    tile={44}
                    width={180}
                    height={150}
                    className={styles.stripArt}
                  />
                  <span className={styles.stripCap}>
                    {num} · {look.symmetry} · {look.motif}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <section id="story" aria-labelledby="story-title" className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.eyebrowStack}>
              <span className={styles.mono}>
                Why the name · <span lang="fa">گره</span>
              </span>
              <h2 id="story-title" className={styles.h2}>
                GIRIH MEANS
                <br />
                <span className={styles.blue}>KNOT.</span>
              </h2>
            </div>
            <p className={styles.sectionLede}>
              In Persian, <em>girih</em> means knot. The word names a style of geometric strapwork
              in Islamic architecture: interlacing lines that form star and polygon patterns across
              walls, domes and doors.
            </p>
          </div>

          <div className={styles.story}>
            <div className={styles.storyText}>
              <div className={cx(styles.mono, styles.storyMeta)}>
                <span>Plate A</span>
                <span>Isfahan, 1453</span>
              </div>
              <h3 className={styles.h3}>The five girih tiles</h3>
              <p className={styles.body}>
                Girih patterns can be laid out with a set of five tiles, each marked with lines that
                connect across tile edges. In 2007, Peter Lu and Paul Steinhardt published research
                showing that the tilework of the Darb-i Imam shrine in Isfahan, built in 1453, is
                nearly quasicrystalline: ordered, but never exactly repeating. Western mathematics
                described this kind of structure in the 1970s.
              </p>
              <p className={styles.bodyMuted}>
                The app is named after this tradition of building complex patterns from a small set
                of rules.
              </p>
            </div>
            <ul className={styles.tiles} aria-label="The five girih tiles">
              {GIRIH_TILES.map((t) => (
                <li key={t.name}>
                  <figure className={styles.tile}>
                    <svg
                      viewBox="-6 -6 112 112"
                      className={styles.tileSvg}
                      role="img"
                      aria-label={`${t.name} girih tile`}
                    >
                      <polygon
                        points={t.points}
                        fill={t.fill}
                        stroke="var(--color-ink)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points={t.strap}
                        fill="none"
                        stroke={t.knot}
                        strokeWidth="2.6"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <figcaption className={styles.tileCap}>
                      <span className={styles.tileName}>{t.name}</span>
                      <span className={styles.tileAngles}>{t.caption}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="how-title" className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 id="how-title" className={styles.h2}>
              HOW IT
              <br />
              WORKS
            </h2>
            <p className={styles.sectionLede}>
              Each pattern is defined by four settings and a seed. The same settings always produce
              the same result, so any pattern can be saved, shared and recreated exactly.
            </p>
          </div>
          <ol className={styles.steps}>
            {STEPS.map((st) => (
              <li key={st.num}>
                <div className={cx(styles.mono, styles.stepHead)}>
                  <span>{st.num}</span>
                  <span>{st.tag}</span>
                </div>
                <Thumb
                  look={st.look}
                  tile={40}
                  width={200}
                  height={120}
                  className={styles.stepArt}
                />
                <h3 className={styles.stepTitle}>{st.title}</h3>
                <p className={styles.bodyMuted}>{st.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="cta-title" className={styles.band}>
          <h2 id="cta-title" className={styles.bandTitle}>
            FIVE TILES
            <br />
            WERE ENOUGH
          </h2>
          <div className={styles.bandBody}>
            <p>
              Isfahan’s tile makers built endless patterns from five shapes. Girih gives you six,
              and the same rules.
            </p>
            <ButtonLink to="/studio" variant="white">
              Open the studio
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Girih is open source</span>
        <span>
          Built by {AUTHOR_NAME} ·{' '}
          <a href={AUTHOR_URL} target="_blank" rel="noreferrer">
            {AUTHOR_HANDLE}
          </a>
        </span>
      </footer>
    </div>
  );
}
