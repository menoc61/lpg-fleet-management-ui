# Task 8 Report — `features/map/data/national-map.ts` + test

## Status

**PASS** — RED confirmed, then GREEN (2/2), typecheck clean (0 errors). No commit performed.

## Files created

- `apps/web/src/features/map/data/sites.ts` — pre-req map-shaped `SiteView` view (mirrors `client-sites.ts` Task 4 style; imports `@lpg/types`'s `Site`, not the canonical `features/sites/data/sites.ts`).
- `apps/web/src/features/map/data/national-map.test.ts` — 2 tests (composition contract + anomaly assertion).
- `apps/web/src/features/map/data/national-map.ts` — pure composition pass-through exposing `NationalMapView` and `getNationalMapView()`.

## Verification evidence

### Step 3 — Run test (RED)
```
npx vitest run features/map/data/national-map.test.ts --reporter=verbose --browser=false

 FAIL  src/features/map/data/national-map.test.ts
Error: Cannot find module './national-map' imported from .../national-map.test.ts
 ❯ src/features/map/data/national-map.test.ts:2:1
      2| import { getNationalMapView } from './national-map'
      | ^
 Serialized Error: { code: 'ERR_MODULE_NOT_FOUND' }

 Test Files  1 failed (1)
      Tests  no tests
```
RED as expected — module did not yet exist.

### Step 5 — Run test (GREEN)
```
 RUN  v4.1.10 C:/.../apps/web

 ✓ src/features/map/data/national-map.test.ts > getNationalMapView > exposes every aggregated sub-view 3ms
 ✓ src/features/map/data/national-map.test.ts > getNationalMapView > flags at least one anomaly present in the mock 0ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Duration  399ms (transform 169ms, setup 0ms, import 225ms, tests 5ms, environment 0ms)
```

### Step 6 — typecheck
```
npm run typecheck  ->  tsc --noEmit -p tsconfig.app.json
(none)   # 0 errors
```

## Notes / concerns

- **Browser EACCES fallback.** The brief's default `npx vitest run` command hits the env-wide browser port-bind failure (`Error: listen EACCES ... :::63315`) because `vite.config.ts` has `browser.enabled: true`. Per the brief's fallback, I ran in Node mode with `--browser=false` — equivalent goal (no temp `vitest.local.config.ts` file needed since the test is pure data with no DOM). This is the preferred minimal approach and leaves no temp artifact behind.
- **`sites.ts` geo cast.** The brief's `sites.ts` casts `s.geo_point as [number, number] | undefined`. Matches the `curated.sites as CuratedSite[]` cast idiom already used in `zones.ts` (Task 6), so type-checking is consistent with the existing pattern.
- **Re-export.** `sites.ts` re-exports `ClientSiteView` (`export type { ClientSiteView } from './client-sites'`) per brief spec, although `national-map.ts` imports `ClientSiteView` directly from `./client-sites`. Kept as briefed to honor the specified content verbatim; harmless.
- `vrac-volume.ts` imports `getTruckTelemetry` from `../trucks`; that path resolves to `features/trucks/trucks.ts` ✓ (present, verified).
