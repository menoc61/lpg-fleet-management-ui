# Task 2 Report — Extract shared map helpers from /trucks into features/map/utils/

## Status

**DONE_WITH_CONCERNS**

All refactor work completed as specified. Tests, typecheck, and lint all pass for the
actual changes. Concerns are limited to environment-only issues (see below).

## Files created

- `apps/web/src/features/map/utils/map-theme.ts`
- `apps/web/src/features/map/utils/map-theme.test.ts`
- `apps/web/src/features/map/utils/legend.tsx`
- `apps/web/src/features/map/utils/format.ts`
- `apps/web/src/features/map/utils/format.test.ts`

## Files modified

- `apps/web/src/features/trucks/components/trucks-map.tsx`
  - Lines 1–37 (import block): replaced asset imports with shared-module imports;
    added `siteMarkerTokens` re-import from `features/sites/utils/site-graphics`,
    added `MapTheme` and the five helper imports from `@/features/map/utils/map-theme`,
    added `LegendSiteIcon` import from `@/features/map/utils/legend`.
  - Removed local `type MapTheme = 'light' | 'dark'` declaration (was line 45 in the
    original file).
  - Removed the inline `siteMarkerTokens` block (was lines 60–123 in the original
    file, ~64 lines).
  - Removed the inline `function getSiteIconUrl(...)` (was around lines 434–442
    after the first edit, ~9 lines).
  - Removed the seven bottom-of-file helpers: `getArcgisBasemap`, `getArcgisViewTheme`,
    `getMarkerOutlineColor`, `getSiteOutlineColor`, `getLpgMarkerIcon`,
    `svgToDataUri`, `rgbaFromTuple`, plus the local `LegendSiteIcon` component
    (was ~86 lines spanning the bottom of the file).
  - Final length: 533 lines (was 687 — net 154 lines removed; refactor replaces them
    with a single canonical re-export).

The file was reduced from 687 to 533 lines; no behavior was changed. All call sites
(`createTruckGraphic`, `createSiteGraphics`, the legend JSX, etc.) keep the same
function names — the only difference is that they now resolve to the shared helpers
in `features/map/utils/`.

## Test command + output

The brief's exact command (`cd apps/web && npm test -- features/trucks features/map`)
cannot complete in this sandbox because Vitest's browser-mode API server fails to
bind to port `63315` (`EACCES: permission denied ::1:63315`) — a Windows sandbox
limitation, not a code defect. The same error is reproducible against unmodified
test files (`npm test -- src/features/sites`); it is environment-bound.

To obtain green output I created a temporary `vitest.local.config.ts` (Node env,
browser disabled) and ran:

```
& ./node_modules/.bin/vitest run -c vitest.local.config.ts
```

Output:

```
 RUN  v4.1.10 C:/Users/DTA_WorkStation/Documents/manga/lpg-fleet-management-ui/apps/web


 Test Files  2 passed (2)
      Tests  10 passed (10)
   Start at  18:44:31
   Duration  257ms (transform 67ms, setup 0ms, import 118ms, tests 10ms, environment 0ms)
```

The temporary config was deleted after collecting the result; it is not committed.

## Typecheck command + output

```
cd apps/web && npm run typecheck
```

```
> typecheck
> tsc --noEmit -p tsconfig.app.json

```

(no output — clean).

## Lint command + output

```
cd apps/web && npm run lint
```

Final line:

```
✖ 52 problems (0 errors, 52 warnings)
```

All 52 warnings are pre-existing in the codebase (TanStack Table fast-refresh,
react-refresh/only-export-components, react-hooks/incompatible-library). Zero
errors.

## One-line test summary

`2 test files passed, 10/10 tests passed (formatTm, formatBtl, formatPercent,
map-theme helpers).`

## Concerns

1. **Environment-only: vitest browser port blocked.** The brief's exact test
   command (`npm test -- features/trucks features/map`) fails in this Windows
   sandbox because Vitest's API server can't bind to port `63315` (EACCES on
   `::1:63315`). The same error happens for any unmodified test in the repo, so
   it is an environment limitation, not a code defect. A developer with a normal
   Node + Playwright environment will run the brief's command successfully.

2. **Test assertion corrected for Node 24 ICU.** The brief's
   `format.test.ts` asserted `'1 234,5 TM'` (regular space U+0020). Node 24's
   `Intl.NumberFormat('fr-FR')` returns a NARROW NO-BREAK SPACE (U+202F) as the
   thousands separator. I kept the assertion semantically identical (it still
   verifies "VRAC volume formatted with French separators in TM") but used the
   actual separator character the runtime produces. The binding constraint from
   the brief — `formatTm` never matches `/kg/i` — is still enforced and verified
   by the third `it` block.

3. **Out-of-scope duplication still present.** `apps/web/src/features/sites/utils/site-graphics.ts`
   continues to declare its own copies of `getLpgMarkerIcon`, `getSiteIconUrl`,
   `getSiteOutlineColor`, and `svgToDataUri`. The brief scoped this task to
   deleting the inline copies inside `trucks-map.tsx` only (AGENTS.md §3
   duplication budget). Cleaning up `site-graphics.ts` should be a follow-up
   task; it was intentionally left untouched here.

4. **No commit.** Per the brief, no `git commit` was performed. Working tree
   contains the new `apps/web/src/features/map/` directory (untracked) and the
   modified `trucks-map.tsx`.
