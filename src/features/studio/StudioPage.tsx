import { useEffect } from 'react';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { ExportMenu } from '@/features/export/ExportMenu';
import { useExport } from '@/features/export/useExport';
import { Canvas } from './Canvas';
import { ParamsPanel } from './ParamsPanel';
import styles from './StudioPage.module.css';
import { ToolsPanel } from './ToolsPanel';
import { useStudio } from './useStudio';
import { Variations } from './Variations';

function DiceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="5" cy="5" r="1.2" fill="currentColor" />
      <circle cx="11" cy="11" r="1.2" fill="currentColor" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** /studio: build a pattern from grid, symmetry, motif, color and seed. */
export function StudioPage() {
  const studio = useStudio();
  const exporter = useExport(studio.recipe, studio.tile);

  useEffect(() => {
    document.title = `Plate ${studio.plate} · Girih Studio`;
  }, [studio.plate]);

  return (
    <div className={styles.page}>
      <Header>
        <div className={styles.headerInfo}>
          <span>Plate {studio.plate}</span>
        </div>
        <div className={styles.headerActions}>
          <Button size="bar" className={styles.randomize} onClick={studio.actions.randomize}>
            <DiceIcon />
            Randomize
          </Button>
          <ExportMenu exporter={exporter} />
        </div>
      </Header>
      <div className={styles.body}>
        <div className={styles.tools}>
          <ToolsPanel studio={studio} />
        </div>
        <main id="main" className={styles.main}>
          <h1 className="visually-hidden">Girih Studio</h1>
          <Canvas studio={studio} />
          <Variations studio={studio} />
        </main>
        <div className={styles.params}>
          <ParamsPanel studio={studio} exporter={exporter} />
        </div>
      </div>
      <p className={styles.toast} role="status" aria-live="polite">
        {exporter.status}
      </p>
    </div>
  );
}
