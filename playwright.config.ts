import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * Local sandboxes ship a pre-installed Chromium. When it is present we point
 * Playwright at it directly; CI installs its own browser with
 * `npx playwright install --with-deps chromium`.
 */
const LOCAL_CHROMIUM = process.env.PW_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const executablePath = existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined;

const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /screenshots\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
    {
      name: 'screenshots',
      testMatch: /screenshots\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
  webServer: {
    command: `npx vite build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
