import { useCallback, useEffect, useRef, useState } from 'react';
import { plateNumber, type PatternTile, type Recipe } from '@/engine';
import { studioHref } from '@/lib/url-state';
import { patternToCss } from './css';
import { copyText, downloadBlob } from './download';
import { patternToPng, type PngScale } from './png';
import { patternToSvg } from './svg';

export function exportFilename(recipe: Recipe, ext: string, suffix = ''): string {
  return `girih-${plateNumber(recipe.seed)}-${recipe.symmetry}-${recipe.motif}${suffix}.${ext}`;
}

/** Export actions for the current pattern plus a status message for a live region. */
export function useExport(recipe: Recipe, tile: PatternTile) {
  const [status, setStatus] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Status messages clear themselves after a few seconds.
  useEffect(() => {
    if (!status) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStatus('');
    }, 4000);
    return () => {
      clearTimeout(timer.current);
    };
  }, [status]);

  const run = useCallback(async (task: () => Promise<string> | string) => {
    try {
      setStatus(await task());
    } catch (err) {
      setStatus(err instanceof Error ? `Export failed: ${err.message}` : 'Export failed.');
    }
  }, []);

  const downloadSvg = useCallback(
    () =>
      run(() => {
        const { svg, seamless } = patternToSvg(tile);
        downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), exportFilename(recipe, 'svg'));
        return seamless
          ? 'SVG tile downloaded.'
          : 'SVG swatch downloaded. This rotation does not tile seamlessly.';
      }),
    [recipe, tile, run],
  );

  const downloadPng = useCallback(
    (scale: PngScale) =>
      run(async () => {
        const blob = await patternToPng(tile, scale);
        downloadBlob(blob, exportFilename(recipe, 'png', `@${scale}x`));
        return `PNG at ${scale}x downloaded.`;
      }),
    [recipe, tile, run],
  );

  const copyCss = useCallback(
    () =>
      run(async () => {
        await copyText(patternToCss(tile));
        return 'CSS background copied to the clipboard.';
      }),
    [tile, run],
  );

  const copyLink = useCallback(
    () =>
      run(async () => {
        const base = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}`;
        await copyText(`${base}${studioHref(recipe)}`);
        return 'Share link copied to the clipboard.';
      }),
    [recipe, run],
  );

  return { status, downloadSvg, downloadPng, copyCss, copyLink };
}

export type ExportApi = ReturnType<typeof useExport>;
