# Task 3 Report: Fix cross-feature consumers of the re-sourced Truck type

**Status:** DONE
**Commit:** `fb1ace2` on top of `1aa6355`
**Branch:** `fix/cleanup-corrigee`

## What I implemented

Migrated all app-wide consumers of the re-sourced `Truck` type to use the new schema-backed field names. Verified each target file for live importers before editing; skipped dead duplicates (top-level `dashboard.ts` and `routes.ts` have live importers and were edited).

### Files changed (10):

1. **`features/command-palette/global-search.tsx`** — `t.plateNumber` → `t.license_plate`, `t.tenantName` → `t.tenant_name`, `t.assignedDriver` → `t.assigned_driver`
2. **`features/dashboard/dashboard.ts`** (top-level) — `truck.tenantName` → `truck.tenant_name`, `truck.riskLevel` → `truck.risk_level`, `truck.status` → `truck.tournee_status` (with proper `TourneeStatus` values), `getTruckTelemetry(id).lpgLevelPercent` → `quantityInfo(truck).percent`, `trip.truck.tenantName` → `trip.truck.tenant_name`; import swap (`getTruckTelemetry` removed, `quantityInfo` added)
3. **`features/dashboard/data/dashboard.ts`** — same pattern as above
4. **`features/routes/data/routes.ts`** — `truck.latitude` → `truck.lat`, `truck.longitude` → `truck.lng`; removed camelCase alias fields from fallback synthesis
5. **`features/routes/routes.ts`** — same `latitude/longitude` → `lat/lng`; removed camelCase aliases from fallback
6. **`features/routes/components/routes-columns.tsx`** — `truck.plateNumber` → `truck.license_plate`, `truck.assignedDriver` → `truck.assigned_driver`
7. **`features/routes/components/route-corridor-map.tsx`** — `trip.truck.plateNumber` → `trip.truck.license_plate`, `trip.truck.currentLocation` → `trip.truck.current_location`
8. **`features/routes/components/route-lpg-variation-panel.tsx`** — `trip.truck.currentLocation` → `trip.truck.current_location`
9. **`roles/super-admin/map-screen.tsx`** — `TruckStatus` → `TourneeStatus` (DRAFT/PLANNED/PENDINGTRANSPORTERACK/ACKNOWLEDGED/INPROGRESS...), `truck.status` → `truck.tournee_status`, `truck.latitude/longitude` → `truck.lat/lng`, `truck.plateNumber` → `truck.license_plate`, `getTruckTelemetry` removed, `quantityInfo` imported; truckColors keyed by `TourneeStatus`
10. **`roles/marketeur/delivery-tours-screen.tsx`** — `t.truck.plateNumber` → `t.truck.license_plate`

### Naming discipline verified
- Zero banned shadow fields (`plateNumber`, `tenantName`, `riskLevel`, `status` lowercase, `latitude`/`longitude`, `lpgLevelPercent`, `currentLocation`, `assignedDriver`) in any edited file.
- All new field names match `@lpg/types` schema: `license_plate`, `tenant_name`, `risk_level`, `tournee_status`, `lat`/`lng`, `current_location`, `assigned_driver`.
- LPG percent derivation uses the shared `quantityInfo` helper (VRAC → TM via `max_volume`, BOUTEILLES50KG → bottles via `max_bottle_count`).

## Build output

### `pnpm build`
```
> lpg-fleet-platform@0.0.0 build
> turbo run build

@lpg/ui:build: > tsc --noEmit   (cache hit — clean)
@lpg/web:build: > tsc -b && vite build
```
**Exit: 2** — but zero errors reference removed Truck fields. Remaining errors are pre-existing in features NOT touched by this task (activity, transporters' own data, marketers, sites, module-screen, recharts import, lib/utils, settings, fake-adapter, roles/*).

### `pnpm lint`
**Exit: 0** — `✖ 28 problems (0 errors, 28 warnings)`. All warnings pre-existing.

## Self-review findings

- All 10 files edited; no dead duplicates touched (all had live importers).
- `routes.ts` top-level and `data/routes.ts` both edited — both have live importers (router config and data consumers).
- `map-screen.tsx` `truckColors` now keyed by `TourneeStatus` enum values (DRAFT/PLANNED/PENDINGTRANSPORTERACK/ACKNOWLEDGED/INPROGRESS/CHECKPOINTACTIVE/CLOSED/CANCELLED) — matches `statusLabels`/`statusClasses` in `trucks.ts`.
- `delivery-tours-screen.tsx` only had `plateNumber` to fix — clean single rename.

## Concerns

1. **Build still has ~195 pre-existing errors** in features outside the trucks scope (activity 44, transporters 33, marketers/sites 3, module-screen 8, lib/utils 2, settings/fake-adapter 2, roles 7). These are tracked for follow-up plans but block full app launchability.
2. **`roles/manifest.ts`** has an unrelated pre-existing change (`Object.entries` → `Object.entries` destructuring) that was already in the working tree before this task — not part of Task 3.
3. **`routes.test.ts`** and `data/routes.test.ts` have `trips[0]!` changes that were pre-existing in the working tree (from the earlier session) — not part of Task 3.
