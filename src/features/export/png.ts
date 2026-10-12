import type { PatternTile } from '@/engine';
import { patternToSvg } from './svg';

export type PngScale = 2 | 4;

/** Rasterises one repeat of the pattern to a PNG blob via an offscreen canvas. */
export async function patternToPng(tile: PatternTile, scale: PngScale): Promise<Blob> {
  const { svg, width, height } = patternToSvg(tile, { scale });
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not available in this browser.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not encode the PNG.'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
