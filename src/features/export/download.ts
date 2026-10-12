/** Triggers a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/** Copies text to the clipboard. Requires a secure context (https or localhost). */
export async function copyText(text: string): Promise<void> {
  if (!('clipboard' in navigator)) {
    throw new Error('Clipboard access is not available in this browser.');
  }
  await navigator.clipboard.writeText(text);
}
