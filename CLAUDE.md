# CLAUDE.md

Conventions for AI agents working in this repository.

## Project

Girih: a seamless pattern generator. Vite + React 18 + TypeScript (strict, `noUncheckedIndexedAccess`) + React Router. CSS Modules with design tokens. No backend.

## Commands

- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e` must all pass before you finish.
- `npm run test:coverage` enforces 90% coverage on `src/engine`.
- `npm run screenshots` writes `docs/screenshots/*.png` (1440 x 900). Look at them after visual changes.
- Playwright uses the Chromium at `/opt/pw-browsers/chromium` when present. Do not run `playwright install` in that sandbox.

## Rules

- `src/engine` is pure TypeScript. Never import React, DOM APIs, `window`, `document`, `localStorage` or UI code there.
- All recipe input goes through `normalizeRecipe`. Never put an unvalidated recipe into state.
- `useRecipeUrlSync` (`src/lib/url-state.ts`) is the only code that reads or writes the Studio query string.
- localStorage access only through `src/lib/storage.ts` (it wraps everything in try/catch). Keys live in `STORAGE_KEYS`.
- Do not change `URL_KEYS` or the output of `build()` without updating `__tests__/reference.ts` deliberately; shared links depend on both.
- Colors, fonts, spacing and rules come from `src/styles/tokens.css`. Hard 1px ink rules (`var(--rule)`) are part of the design.
- Accessibility: semantic elements, labels on every input, `aria-pressed` on toggles, visible focus, respect `prefers-reduced-motion`.
- The Claude assist is optional. The app must work with no key. The model id is only in `src/features/assist/config.ts`. Never log the API key or put it in error messages.
- Copy: plain product wording, no em dashes, never call the author a founder.

## Commits

Conventional commits. Author `Gabi <gabriela.sulek@gmail.com>`. End each message with:

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```
