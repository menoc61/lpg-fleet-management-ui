# Task 2 Report — Update trucks feature components (columns, page, details, sheet)

**Status:** DONE_WITH_CONCERNS
**Commit:** `1aa6355` on top of `6e7d35b`
**Branch:** `fix/cleanup-corrigee`
**Date:** 2026-08-05

---

## What I implemented

The working tree already contained the Task 2 edits for all six brief files (uncommitted). I verified each against the brief, fixed the two remaining truck-scope build blockers (see below), created the shared helper, and committed the whole `features/trucks/*` subtree plus the trucks route.

1. **Shared `quantityInfo` helper** — `apps/web/src/features/trucks/lib/quantity.ts` (new file): computes `{ amount, percent, loaded, max, unit }` from `truck.type` (VRAC → `max_volume` in TM, BOUTEILLES50KG → `max_bottle_count` in bouteilles) and `getTruckTelemetry(...).loaded_quantity`. Imported by columns, map, and both sheets — no duplicated logic.
2. **`components/trucks-columns.tsx`** — LPG accessor now `quantityInfo(truck).percent`; cell renders `{info.percent}% • {info.amount}` with width style; ETA line derives from `telemetry.expected_arrival`. Zero `eta_text` / `lpg_level_percent`.
3. **`components/trucks-map.tsx`** — popup builder uses `quantityInfo` for `Niveau GPL`/`Remplissage`, `expected_arrival` for ETA; `Pression` line removed; `truck.lat`/`truck.lng` everywhere; popup title derives `${truck.type} · ${truck.license_plate}`.
4. **`index.tsx`** — avgLpg reducer per brief (percent from total capacity via `loaded_quantity`/`max`), deps `[visible]`. **Extra fix:** replaced the `useNavigateSafe` `(to: string) => void` stub with `getRouteApi('/_authenticated/trucks/').useNavigate()` so the `NavigateFn` type error at line 200 is resolved (was a hard blocker in `features/trucks/index.tsx`).
5. **`truck-details.tsx`** — title `${truck.type} · ${truck.license_plate}`, description `${truck.id} — ${truck.tenant_name}`.
6. **`truck-details-sheet.tsx` (top-level)** — exports `TruckDetailsBody`; Speed MetricCard removed; LPG MetricCard per unit (VRAC TM / bouteilles); ETA from `expected_arrival`; no `make_model`/`plate_number`/`driver_phone`/`fleet_manager`/`operating_region`/`contract_tier`/`tank_capacity_liters`/telemetry shadow fields.
7. **`components/truck-details-sheet.tsx`** — exports `TruckDetailsSheet`; same schema-backed edits; `<MiniSignal>` grid (MapPin/Thermometer) block removed from the maintenance tab.
8. **`routes/_authenticated/trucks/index.tsx`** — the trucks page route imported removed exports (`contractTierOptions`, `truckStatusOptions`). Replaced with schema-backed `tourneeStatusOptions` from `@/config/modules/field-options` (derived from the `TourneeStatus` enum) and dropped the dead `contract` search filter (contract tiers no longer exist). This was required for the trucks page to compile.

**Naming discipline:** snake_case only. Verified zero matches of every banned shadow name in `apps/web/src/features/trucks`.

## Build output

### `pnpm build`

```
> lpg-fleet-platform@0.0.0 build
> turbo run build

@lpg/ui:build: > tsc --noEmit   (cache hit — clean)
@lpg/web:build: > tsc -b && vite build
```

**Exit: 2** — but **zero errors in the trucks feature subtree or the trucks route**. 195 `error TS` lines remain, all outside Task 2 scope:

| Group | Count | Owner |
|---|---|---|
| `features/activity/*` | 44 | Pre-existing (out of scope, documented in Task 1 report) |
| `features/routes/*` | 38 | Task 3 (cross-feature consumer) |
| `features/transporters/*` | 33 | Pre-existing (out of scope) |
| `features/dashboard/*` | 32 | Task 3 (cross-feature consumer) |
| `roles/super-admin/map-screen.tsx` + risk-dashboard | 20 | Task 3 (map-screen) + pre-existing (recharts) |
| `features/command-palette/global-search.tsx` | 6 | Task 3 (cross-feature consumer) |
| `roles/*` (supervisor, marketeur, manifest) | 7 | Pre-existing (out of scope) |
| `features/marketers`, `features/sites` | 3 | Pre-existing (out of scope) |
| `module/module-screen.tsx` | 8 | Pre-existing (out of scope) |
| `lib/utils.ts` | 2 | Pre-existing (out of scope) |
| `routes/_authenticated/settings`, `api-client/fake-adapter` | 2 | Pre-existing (out of scope) |

Full log: `%TEMP%\web-build-task2.log`.

### `pnpm lint`

**Exit: 0** — `✖ 28 problems (0 errors, 28 warnings)`. All warnings are pre-existing (`react-refresh/only-export-components`, unused `eslint-disable` directives, etc.); none introduced by this task. Full log: `%TEMP%\web-lint-task2.log`.

## Commit

```
1aa6355 refactor(trucks): update components to schema-backed Truck/TruckTelemetry
 12 files changed, 390 insertions(+), 844 deletions(-)
 create mode 100644 apps/web/src/features/trucks/lib/quantity.ts
```

## Files changed

- `apps/web/src/features/trucks/lib/quantity.ts` (new — shared helper)
- `apps/web/src/features/trucks/components/trucks-columns.tsx`
- `apps/web/src/features/trucks/components/trucks-map.tsx`
- `apps/web/src/features/trucks/components/truck-details-sheet.tsx`
- `apps/web/src/features/trucks/components/trucks-table.tsx`
- `apps/web/src/features/trucks/index.tsx`
- `apps/web/src/features/trucks/truck-details.tsx`
- `apps/web/src/features/trucks/truck-details-sheet.tsx`
- `apps/web/src/features/trucks/trucks-columns.tsx`
- `apps/web/src/features/trucks/trucks-map.tsx`
- `apps/web/src/features/trucks/trucks-table.tsx`
- `apps/web/src/routes/_authenticated/trucks/index.tsx`

(Note: the brief's six files were already edited in the working tree when I started; the top-level duplicate copies `trucks-columns/map/table.tsx` and `components/trucks-table.tsx` carry the same schema-backed fixes and were part of the staged `features/trucks` subtree per the brief's `git add apps/web/src/features/trucks`.)

## Self-review findings

- **Zero shadow fields reintroduced.** `rg` for `lpg_level_percent|eta_text|plate_number|make_model|contract_tier|driver_phone|fleet_manager|operating_region|tank_capacity_liters|pressureBar|temperature_celsius|route_progress|distance_km|speed_kmh|speedKmh|tenantName|assignedDriver|plateNumber|riskLevel|lpgLevelPercent|currentLocation|truck.status|makeModel|driverPhone|fleetManager|operatingRegion|contractTier` over `apps/web/src/features/trucks` → 0 matches.
- **`features/trucks/*` subtree import-clean.** `pnpm build` log contains **0** references to `features/trucks` or `_authenticated/trucks`.
- **LPG units are type-dependent** (VRAC → TM via `max_volume`; BOUTEILLES50KG → bouteilles via `max_bottle_count`), shared through `lib/quantity.ts` so columns/map/sheets can't drift.
- **Telemetry shape respected:** only `loaded_quantity` / `expected_arrival` / `actual_arrival` are consumed — no `speed`, no pressure/temperature/distance fabrications.
- **Route search schema** now validates `status` against the real `TourneeStatus` enum values (DRAFT…CANCELLED) instead of fictional AVAILABLE/IN_TRANSIT.

## Concerns

1. **`pnpm build` does NOT exit 0.** The task's hard checkpoint cannot be met by Task 2 alone: 195 errors remain, of which the cross-feature truck consumers (dashboard, global-search, routes, super-admin map-screen ≈ 76 errors) are explicitly Task 3, and the rest (activity, transporters, marketers, sites, module-screen, settings, lib/utils, fake-adapter ≈ 119 errors) are pre-existing breakage documented as out of scope in the Task 1 report. The trucks feature itself is green and the app's trucks pages compile.
2. **Working tree hygiene:** the repo was already mid-refactor with many unrelated uncommitted changes across `features/`, `roles/`, `module/`, `packages/` before this task. I staged only the trucks scope per the brief; nothing unrelated was committed. A stray empty file `null` at the repo root (0 bytes, pre-existing) was left untouched.
3. `roles/marketeur/delivery-tours-screen.tsx` (2 errors: `truck.plateNumber`) is a cross-feature truck consumer not listed in Task 3's file list — worth confirming Task 3 covers it, or it remains broken.
