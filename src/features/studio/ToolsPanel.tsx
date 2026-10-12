import { MonoLabel } from '@/components/MonoLabel';
import { Segmented } from '@/components/Segmented';
import { AssistPanel } from '@/features/assist/AssistPanel';
import { Button } from '@/components/Button';
import {
  GRID_DEFS,
  GRIDS,
  LINE_ROLE,
  MOTIF_KINDS,
  MOTIFS,
  SYMMETRIES,
  SYMMETRY_GROUPS,
  type MotifKind,
  type Palette,
} from '@/engine';
import { cx } from '@/lib/cx';
import styles from './Panel.module.css';
import type { StudioModel } from './useStudio';

const DEMO_PALETTE: Palette = {
  bg: '#FBFBFA',
  c1: '#121212',
  c2: '#8C8C88',
  c3: '#2135F5',
  line: '#121212',
};
const SELECTED_PALETTE: Palette = {
  bg: '#2135F5',
  c1: '#FFFFFF',
  c2: '#AEB6FF',
  c3: '#FFFFFF',
  line: '#FFFFFF',
};

function MotifGlyph({ kind, selected }: { kind: MotifKind; selected: boolean }) {
  const p = selected ? SELECTED_PALETTE : DEMO_PALETTE;
  const roles = [p.bg, p.c1, p.c2, p.c3];
  return (
    <svg viewBox="-8 -8 116 116" aria-hidden="true" focusable="false">
      {MOTIFS[kind].layers.map((l, i) => (
        <path
          key={i}
          d={l.d}
          fill={l.role === LINE_ROLE ? 'none' : roles[l.role]}
          stroke={l.role === LINE_ROLE ? p.line : 'none'}
          strokeWidth={4}
        />
      ))}
    </svg>
  );
}

const gridOptions = GRIDS.map((g) => ({ value: g, label: GRID_DEFS[g].label }));
const symOptions = SYMMETRIES.map((s) => ({
  value: s,
  label: s,
  ariaLabel: `${s}, ${SYMMETRY_GROUPS[s].label}`,
}));
const motifOptions = MOTIF_KINDS.map((m) => ({
  value: m,
  label: MOTIFS[m].label,
  ariaLabel: `Motif ${MOTIFS[m].label}`,
}));

/** Left column: construction tools (01 to 04) and the optional assist. */
export function ToolsPanel({ studio }: { studio: StudioModel }) {
  const { recipe, actions } = studio;
  return (
    <aside aria-label="Construction tools" className={cx(styles.aside, 'studio-tools')}>
      <section className={styles.section} aria-label="Grid">
        <MonoLabel aside={GRID_DEFS[recipe.grid].label}>01 Grid</MonoLabel>
        <Segmented
          label="Grid"
          options={gridOptions}
          value={recipe.grid}
          onChange={(grid) => {
            actions.set({ grid });
          }}
          optionClassName={styles.gridOption}
          renderOption={(o) => (
            <>
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
                <path
                  d={GRID_DEFS[o.value].icon}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
              {o.label}
            </>
          )}
        />
      </section>

      <section className={styles.section} aria-label="Symmetry">
        <MonoLabel aside="Wallpaper group">02 Symmetry</MonoLabel>
        <Segmented
          label="Symmetry"
          layout="gapped"
          options={symOptions}
          value={recipe.symmetry}
          onChange={(symmetry) => {
            actions.set({ symmetry });
          }}
          optionClassName={styles.symOption}
          renderOption={(o) => (
            <>
              <span className={styles.symKey}>{o.value}</span>
              <span className={styles.symLabel}>{SYMMETRY_GROUPS[o.value].label}</span>
            </>
          )}
        />
      </section>

      <section className={styles.section} aria-label="Motif">
        <MonoLabel aside={MOTIFS[recipe.motif].label}>03 Motif</MonoLabel>
        <Segmented
          label="Motif"
          layout="gapped"
          options={motifOptions}
          value={recipe.motif}
          onChange={(motif) => {
            actions.set({ motif });
          }}
          optionClassName={styles.motifOption}
          renderOption={(o, selected) => (
            <>
              <MotifGlyph kind={o.value} selected={selected} />
              <span className={styles.motifName}>{o.label}</span>
            </>
          )}
        />
      </section>

      <section className={cx(styles.section, styles.sectionLast, styles.tight)} aria-label="Seed">
        <MonoLabel>04 Seed</MonoLabel>
        <div className={styles.seedRow}>
          <span className={styles.seedValue} data-testid="seed-value">
            <span className="visually-hidden">Current seed </span>
            {studio.seedLabel}
          </span>
          <Button variant="ink" size="sm" className={styles.seedButton} onClick={actions.newSeed}>
            New seed
          </Button>
        </div>
        <p className={styles.hint}>The same seed always produces the same pattern.</p>
      </section>

      <AssistPanel recipe={recipe} onApply={actions.replace} />
    </aside>
  );
}
