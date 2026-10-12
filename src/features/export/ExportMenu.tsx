import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import styles from './ExportMenu.module.css';
import type { ExportApi } from './useExport';

/** Header export button with a small disclosure menu of every export format. */
export function ExportMenu({ exporter }: { exporter: ExportApi }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    wrap.current?.querySelector<HTMLButtonElement>('[data-menu-item]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  const run = (fn: () => unknown) => () => {
    setOpen(false);
    fn();
  };

  const items = [
    { label: 'Download SVG', meta: 'vector', fn: exporter.downloadSvg },
    { label: 'Download PNG', meta: '2x', fn: () => exporter.downloadPng(2) },
    { label: 'Download PNG', meta: '4x', fn: () => exporter.downloadPng(4) },
    { label: 'Copy CSS background', meta: 'css', fn: exporter.copyCss },
    { label: 'Copy share link', meta: 'url', fn: exporter.copyLink },
  ];

  return (
    <div className={styles.wrap} ref={wrap}>
      <Button
        ref={trigger}
        variant="blue"
        size="bar"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen((o) => !o);
        }}
      >
        Export
      </Button>
      {open && (
        <div id={menuId} className={styles.menu} role="group" aria-label="Export options">
          <span className={styles.menuTitle}>Export tile</span>
          {items.map((item) => (
            <button
              key={`${item.label}-${item.meta}`}
              type="button"
              data-menu-item
              className={styles.item}
              onClick={run(item.fn)}
            >
              {item.label}
              <span className={styles.meta}>{item.meta}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
