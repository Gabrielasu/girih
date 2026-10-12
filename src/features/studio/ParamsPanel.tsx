import { Button } from '@/components/Button';
import { MonoLabel } from '@/components/MonoLabel';
import { Segmented } from '@/components/Segmented';
import { Slider } from '@/components/Slider';
import { Swatches } from '@/components/Swatches';
import { describeRecipe, GROUND_LABELS, GROUNDS, HARMONIES, HARMONY_DEFS, RANGES } from '@/engine';
import type { ExportApi } from '@/features/export/useExport';
import { cx } from '@/lib/cx';
import styles from './Panel.module.css';
import type { StudioModel } from './useStudio';

const harmonyOptions = HARMONIES.map((h) => ({ value: h, label: HARMONY_DEFS[h].label }));
const groundOptions = GROUNDS.map((g) => ({ value: g, label: GROUND_LABELS[g] }));

/** Right column: scale, color and the recipe card with export buttons. */
export function ParamsPanel({ studio, exporter }: { studio: StudioModel; exporter: ExportApi }) {
  const { recipe, actions, palette } = studio;
  return (
    <aside aria-label="Parameters" className={cx(styles.aside, 'studio-params')}>
      <section className={cx(styles.section, styles.tight)} aria-label="Scale">
        <MonoLabel>06 Scale</MonoLabel>
        <Slider
          label="Tile"
          {...RANGES.tile}
          value={recipe.tile}
          format={(v) => `${v} px`}
          onChange={(tile) => {
            actions.set({ tile });
          }}
        />
        <Slider
          label="Rotation"
          {...RANGES.rotation}
          value={recipe.rotation}
          format={(v) => `${v}°`}
          onChange={(rotation) => {
            actions.set({ rotation });
          }}
        />
        <Slider
          label="Line"
          {...RANGES.line}
          value={recipe.line}
          onChange={(line) => {
            actions.set({ line });
          }}
        />
      </section>

      <section className={cx(styles.section)} aria-label="Color">
        <MonoLabel>07 Color</MonoLabel>
        <Slider
          label="Key hue"
          variant="hue"
          {...RANGES.hue}
          value={recipe.hue}
          format={(v) => `${v}°`}
          onChange={(hue) => {
            actions.set({ hue });
          }}
        />
        <Segmented
          label="Harmony"
          columns={2}
          options={harmonyOptions}
          value={recipe.harmony}
          onChange={(harmony) => {
            actions.set({ harmony });
          }}
        />
        <Segmented
          label="Ground"
          columns={2}
          tone="ink"
          options={groundOptions}
          value={recipe.ground}
          onChange={(ground) => {
            actions.set({ ground });
          }}
        />
        <Swatches colors={[palette.bg, palette.c1, palette.c2, palette.c3]} />
      </section>

      <section className={cx(styles.section, styles.pushDown)} aria-label="Recipe">
        <MonoLabel>08 Recipe</MonoLabel>
        <pre className={styles.recipe} data-testid="recipe-card">
          {describeRecipe(recipe)}
        </pre>
        <div className={styles.exportRow} role="group" aria-label="Export">
          <Button size="sm" onClick={() => void exporter.downloadSvg()} aria-label="Download SVG">
            SVG
          </Button>
          <Button
            size="sm"
            onClick={() => void exporter.downloadPng(2)}
            aria-label="Download PNG at 2x"
          >
            PNG
          </Button>
          <Button
            size="sm"
            onClick={() => void exporter.copyCss()}
            aria-label="Copy CSS background"
          >
            CSS
          </Button>
        </div>
      </section>
    </aside>
  );
}
