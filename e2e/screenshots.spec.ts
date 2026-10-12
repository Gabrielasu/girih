import { expect, test } from '@playwright/test';

/**
 * Captures reference screenshots of each route at 1440 x 900 into
 * docs/screenshots. Run with `npm run screenshots`.
 */
const ROUTES = [
  { path: '/', name: 'index' },
  { path: '/studio', name: 'studio' },
  { path: '/specimens', name: 'specimens' },
] as const;

test.use({ viewport: { width: 1440, height: 900 } });

for (const route of ROUTES) {
  test(`screenshot ${route.name}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route.path);
    await page.evaluate(() => document.fonts.ready);
    const syne = await page.evaluate(() => document.fonts.check('800 40px Syne'));
    expect(syne).toBe(true);
    await page.screenshot({ path: `docs/screenshots/${route.name}.png` });
    await page.screenshot({ path: `docs/screenshots/${route.name}-full.png`, fullPage: true });
  });
}
