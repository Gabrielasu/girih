# Architecture

Girih is a static single page app: Vite, React 18, TypeScript (strict, `noUncheckedIndexedAccess`) and React Router. There is no backend. Everything, including the optional Claude call, happens in the browser.

## Layers

```
app/  ->  features/  ->  components/  ->  engine/
                \-> lib/ ------------------^
```

Dependencies only point to the right. The engine depends on nothing.

| Folder                   | Responsibility                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/engine`             | Pure pattern engine. No React, DOM or browser globals (enforced by ESLint `no-restricted-imports` and `no-restricted-globals`). |
| `src/features/studio`    | Studio route: `useStudio` hook (reducer, derived data, URL and storage sync) and the panels.                                    |
| `src/features/specimens` | Specimens data and gallery route.                                                                                               |
| `src/features/landing`   | Index route and the girih tile geometry.                                                                                        |
| `src/features/export`    | SVG, PNG and CSS exporters, downloads, clipboard, header export menu.                                                           |
| `src/features/assist`    | Optional Claude integration: config, prompt, zod schema, API client, hook and panel.                                            |
| `src/components`         | Shared primitives: `Header`, `Button`, `Segmented`, `Slider`, `Swatches`, `PatternSvg`, `MonoLabel`, `Logo`.                    |
| `src/lib`                | `storage` (safe localStorage), `url-state` (URL and recipe sync), `cx`.                                                         |
| `src/styles`             | `tokens.css` (all colors, type, spacing, rules), `fonts.css`, `global.css`.                                                     |
| `src/app`                | Router, layout, not found page, public links.                                                                                   |

## Engine

| Module          | Exports                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `types.ts`      | `Recipe`, `Palette`, `Shape`, `PatternTile` and the enum lists (`GRIDS`, `SYMMETRIES`, `MOTIF_KINDS`, `HARMONIES`, `GROUNDS`). |
| `motifs.ts`     | `MOTIFS`: path data and palette roles per motif.                                                                               |
| `symmetry.ts`   | `SYMMETRY_GROUPS`, `opTransform`, `fmt`.                                                                                       |
| `grid.ts`       | `GRID_DEFS`, `gridOffsets`, `repeatSize`, `patternRotation`, `repeatFrame`.                                                    |
| `color.ts`      | `hsl`, `luminance`, `contrast`, `contrastRating`, `palette` with contrast auto-correction.                                     |
| `random.ts`     | `mulberry32`, `pick`, `randInt`, `nextSeed`.                                                                                   |
| `build.ts`      | `build(recipe, options)` returning a `PatternTile`.                                                                            |
| `recipe.ts`     | Defaults, ranges, `normalizeRecipe`, `encodeRecipe` / `decodeRecipe`, labels, `randomRecipe`.                                  |
| `variations.ts` | `variations(recipe)`: six seeded neighbours.                                                                                   |

`src/engine/__tests__/reference.ts` is a verbatim copy of the engine from the approved design mockup. `parity.test.ts` checks the TypeScript port against it for every grid, symmetry and motif.

### Rendering

`build()` returns a list of paths with transforms for one repeat. `PatternSvg` drops them into an SVG `<pattern>` with `patternUnits="userSpaceOnUse"` and the grid rotation as `patternTransform`, then fills a rectangle with it. The browser tiles the pattern, so a large canvas costs the same as a small one. Strokes use `vector-effect="non-scaling-stroke"` so the line weight is in screen pixels whatever the tile size.

## State

The Studio recipe lives in a `useReducer` with pure actions (`set`, `newSeed`, `randomize`, `replace`). Every action passes through `normalizeRecipe`, so state is always valid.

- **URL**: `useRecipeUrlSync` in `lib/url-state.ts` is the only place that touches the query string. State changes replace the URL (no history spam); external URL changes such as back, forward or a pasted link are pushed into state.
- **Storage**: the latest recipe is written to `localStorage` (`girih:recipe:v1`). On load, URL parameters win, then the saved recipe, then the default. All storage access is wrapped in try/catch.
- **Derived data** (palette, tile, contrast, variations) is computed once per recipe change with `useMemo`.

## Export

`patternToSvg` uses `repeatFrame` to find the smallest axis aligned rectangle that is an exact period of the rotated pattern: the tile itself at 0 or 90 degrees, a square of side `sqrt(2) * w * h / gcd(w, h)` at 45 degrees. Other angles have no small rectangular period, so a large swatch is exported and the UI says it will not tile seamlessly. PNG export draws that SVG onto a canvas at 2x or 4x. CSS export inlines the SVG as a data URI.

## Assist

1. The user's key is read from `localStorage` (`girih:anthropic-api-key`).
2. `requestSuggestion` POSTs to the Messages API with `anthropic-dangerous-direct-browser-access: true`, using `ASSIST_MODEL` from `config.ts`.
3. The reply text is parsed as JSON and validated with `AssistSuggestionSchema` (zod), then normalised.
4. The panel shows a diff of the proposed changes. Nothing changes until the user clicks Apply.

Errors are mapped to friendly messages and never include the key.

## Testing

- **Unit** (Vitest, node environment): the engine, with a 90% coverage threshold.
- **Component and integration** (Vitest + Testing Library, jsdom): primitives, Studio flows, Specimens, Index, assist with a mocked `fetch`.
- **End to end** (Playwright, Chromium): every route loads without console errors, fonts load, the hero headline never overlaps the pattern panel, changing symmetry updates the URL, SVG and PNG exports download valid files.
