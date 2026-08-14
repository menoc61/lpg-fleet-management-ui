# Task 7 Report — `features/map/lib/vrac-volume.ts` + test (TDD)

## Status: DONE

## Process (TDD)

1. **Test first (RED)** — created `vrac-volume.test.ts` importing `aggregateVracVolume` from `./vrac-volume` (which did not exist).
2. **Run (RED)** — `npx vitest run` hit the known `EACCES: permission denied ::1:<port>` browser port-bind error (root `vitest.config.ts` enables `browser: { provider: playwright() }`). Worked around it with the temporary `vitest.local.config.ts` (Node-only, `browser.enabled: false`), per the brief's fallback. Temp config deleted after use.
3. **Implement (GREEN)** — created `vrac-volume.ts`.
4. **Run (GREEN)** — 2/2 passed.
5. **Typecheck** — `npm run typecheck` (apps/web) passed, zero errors.

## Files

- **Created** `apps/web/src/features/map/lib/vrac-volume.test.ts` — 2 tests (finite totalTM ≥ 0; unit is `'TM'`, never kg).
- **Created** `apps/web/src/features/map/lib/vrac-volume.ts` — `VracSummary` interface + `aggregateVracVolume()`.
- **Deleted** `apps/web/vitest.local.config.ts` (temporary Node-only runner, per brief §3 fallback).

## Implementation

`aggregateVracVolume()` reuses the canonical truck accessor and quantity model (no local re-declaration):

- `getTrucks()` from `features/trucks/trucks.ts:114` → filters `type === 'VRAC'` with `max_volume > 0`.
- `quantityInfo(truck)` from `features/trucks/lib/quantity.ts:11` → for VRAC returns `unit: ' TM'`, `loaded` already in TM (from `telemetry.loaded_quantity ?? truck.loaded_quantity ?? 0`, i.e. tonnes métriques, never litres/kg).
- Internal loop guards `info.unit === ' TM'` so non-VRAC trucks are skipped.
- `VracSummary.unit` is typed `'TM'` (no leading space), distinct from `quantityInfo`'s `' TM'`.
- `totalTM` rounded to 2 decimals; `activeTruckCount` = VRAC truck count with capacity.

## Test output

### RED (before implementation)
```
 FAIL  src/features/map/lib/vrac-volume.test.ts
Error: Cannot find module './vrac-volume' imported from .../vrac-volume.test.ts
❯ src/features/map/lib/vrac-volume.test.ts:2:1
 ✗
 Test Files  1 failed (1)
   Tests  no tests
```

### GREEN (after implementation)
```
 RUN  v4.19.10

 ✓ src/features/map/lib/vrac-volume.test.ts > aggregateVracVolume > returns a finite TM total 2ms
 ✓ src/features/map/lib/vrac-volume.test.ts > aggregateVracVolume > never reports kg 0ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
 Duration 372ms
```

## Typecheck output
```
> typecheck
> tsc --noEmit -p tsconfig.app.json
(Exit 0 — no errors)
```

## Concerns / notes
- **Root `vite.config.ts` browser test runner**: every `npx vitest run` (without `--config`) fails with `EACCES` on this machine because it binds a browser provider that has no permission to listen. The temporary Node config is the documented bypass. Consider setting `pool: 'forks'`/`browser.enabled: false` as a permanent `test.run` override for this environment, or document the `--config vitest.local.config.ts` fallback in AGENTS.md.
- VRAC quantities are guaranteed TM (not kg): they flow through `quantityInfo` → `formatTm`, which the map already uses (see `features/map/utils/format.ts:11: formatTm` with the `never kg` invariant).
- `getTrucks()` is deterministic (seeded), so `totalTM` and `activeTruckCount` are stable across runs.
