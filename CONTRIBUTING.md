# Contributing

Thanks for helping improve Girih.

## Setup

```bash
nvm use        # Node 22
npm ci
npm run dev
```

Playwright needs Chromium. On a fresh machine run `npx playwright install chromium` once. If you already have a Chromium build, point `PW_CHROMIUM_PATH` at its executable.

## Before you open a pull request

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```

CI runs the same steps.

## Guidelines

- Keep `src/engine` pure: no React, no DOM, no browser globals. ESLint enforces this.
- Engine changes need unit tests. If you change pattern output on purpose, update `__tests__/reference.ts` and explain why in the pull request, because existing shared links will render differently.
- Never rename the URL keys in `URL_KEYS`; shared links depend on them.
- Styles use CSS Modules and the tokens in `src/styles/tokens.css`. Do not hard code colors or fonts in components.
- Every control needs an accessible name. Toggles use `aria-pressed`. Check keyboard use.
- Copy: plain product wording, no em dashes.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

## Adding a motif

1. Add the id to `MOTIF_KINDS` in `src/engine/types.ts`.
2. Add its layers to `MOTIFS` in `src/engine/motifs.ts`. Draw in the 100 x 100 box from the origin; edges should meet cleanly when mirrored or rotated.
3. Add it to the prompt list if needed (it is generated from `MOTIF_KINDS`).
4. Run the tests and check the Studio.
