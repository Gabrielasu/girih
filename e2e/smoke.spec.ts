import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

/** Fails the test on any console error or uncaught exception. */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test.describe('routes load', () => {
  for (const [path, heading] of [
    ['/', /PURE/],
    ['/studio', /Girih Studio/],
    ['/specimens', /SPECI/],
  ] as const) {
    test(`loads ${path}`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
      await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
});

test('fonts load from the bundle', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => ({
    syne: document.fonts.check('800 40px Syne'),
    grotesk: document.fonts.check('400 15px "Schibsted Grotesk"'),
    mono: document.fonts.check('400 11px "Martian Mono"'),
  }));
  expect(loaded).toEqual({ syne: true, grotesk: true, mono: true });
});

for (const width of [1024, 1280, 1440, 1920]) {
  test(`hero headline stays clear of the pattern panel at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const h1 = page.getByRole('heading', { level: 1 });
    const overflow = await h1.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const art = page.getByRole('img', { name: 'Animated hero pattern' });
    const [hb, ab] = await Promise.all([h1.boundingBox(), art.boundingBox()]);
    if (!hb || !ab) throw new Error('missing boxes');
    // Side by side layouts: the headline must end before the art starts.
    // Stacked layouts: the headline must sit above the art.
    const sideBySide = ab.x > hb.x + 10;
    if (sideBySide) expect(hb.x + hb.width).toBeLessThanOrEqual(ab.x);
    else expect(hb.y + hb.height).toBeLessThanOrEqual(ab.y);
  });
}

test('studio: change symmetry updates caption and URL, survives reload', async ({ page }) => {
  await page.goto('/studio');
  const group = page.getByRole('group', { name: 'Symmetry' });
  await group.getByRole('button', { name: /^pmm,/ }).click();
  await expect(group.getByRole('button', { name: /^pmm,/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByTestId('plate-caption')).toContainText('pmm');
  await expect(page).toHaveURL(/sym=pmm/);
  await page.reload();
  await expect(page.getByTestId('plate-caption')).toContainText('pmm');
});

test('studio: shared links restore the full recipe', async ({ page }) => {
  await page.goto(
    '/studio?grid=brick&sym=p2&motif=dots&hue=40&harmony=triadic&ground=ink&tile=90&rot=10&line=2&seed=321',
  );
  await expect(page.getByTestId('plate-caption')).toContainText(
    'Plate 321 · p2 · Dots · Triadic · Seed 0321-P2',
  );
  await expect(page.getByTestId('recipe-card')).toContainText('tile      90px  rot 10°');
});

test('studio: export SVG downloads a valid tile', async ({ page }) => {
  await page.goto('/studio');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SVG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^girih-\d{3}-p4m-petal\.svg$/);
  const path = await download.path();
  const svg = await readFile(path, 'utf8');
  expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  expect(svg).toContain('<pattern id="girih"');
  await expect(page.getByRole('status')).toHaveText(/SVG tile downloaded/);
});

test('studio: export PNG from the header menu', async ({ page }) => {
  await page.goto('/studio');
  await page.getByRole('button', { name: 'Export' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download PNG\s*4x/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/@4x\.png$/);
  const buf = await readFile(await download.path());
  expect(buf.subarray(1, 4).toString()).toBe('PNG');
});

test('studio: keyboard operates sliders', async ({ page }) => {
  await page.goto('/studio');
  const tile = page.getByRole('slider', { name: 'Tile' });
  await tile.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('recipe-card')).toContainText('150px');
});

test('specimens: a plate opens in the studio', async ({ page }) => {
  await page.goto('/specimens');
  await page.getByRole('link', { name: /Harbour/ }).click();
  await expect(page).toHaveURL(/\/studio\?grid=brick&sym=pm&motif=wave/);
  await expect(page.getByTestId('plate-caption')).toContainText('Wave');
});

test.describe('phone width', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  for (const path of ['/', '/studio', '/specimens']) {
    test(`no horizontal scroll on ${path}`, async ({ page }) => {
      await page.goto(path);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width).toBeLessThanOrEqual(390);
    });
  }
});
