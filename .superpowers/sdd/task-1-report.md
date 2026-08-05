# Task 1 Report — Re-source `trucks.ts` to schema-backed view types

**Status:** DONE
**Commit:** `6e7d35b` on top of base `b20ed5c`
**Branch:** `fix/cleanup-corrigee`
**Date:** 2026-08-05

---

## What I implemented

Replaced the entire contents of `apps/web/src/features/trucks/trucks.ts` with the schema-backed view types defined in the brief.

- New types re-exported/exposed:
  - `TruckStatus = TourneeStatus`
  - `Truck` with snake_case fields (`license_plate`, `tournee_status`, `max_volume`, `max_bottle_count`, `certificate_*`, `org_id`, `tenant_name`, `region`, `assigned_driver`, `requested_quantity`, `loaded_quantity`, `delivered_quantity`, `risk_level: RiskLevel`, `current_location`, `lat`, `lng`)
  - `TruckTelemetry` limited to `loaded_quantity?`, `expected_arrival?`, `actual_arrival?` (no `speed`)
- Status labels/classes derived from `TourneeStatus` (8 values).
- Risk labels/classes from `RiskLevel` (5 values).
- `risk_scores` lookup uses `entity_type === 'VEHICLE'` and falls back to `'FAIBLE'`.
- `getTrucks()`, `getTruckById(id)`, `getTruckTelemetry(truckId)` flow per the brief.
- `truckTenantOptions` derived from active trucks.

No other files were modified.

## Build output

### `pnpm --filter @lpg/ui run build`

```
> @lpg/ui@0.0.0 build C:\Users\DTA_WorkStation\Documents\manga\lpg-fleet-management-ui\packages\ui
> tsc --noEmit

```

**Exit: 0** (clean).

### `pnpm --filter @lpg/web run build`

Fails as expected with consumer type errors only. Errors all live in files that imported the OLD `Truck`/`TruckTelemetry` shapes — these are the anticipated consumer breakages that Tasks 2–3 must fix.

File groups with errors (Tasks 2-3 territory):
- `src/features/command-palette/global-search.tsx` (`plateNumber`, `tenantName`, `assignedDriver`)
- `src/features/dashboard/dashboard.ts` + `dashboard/data/dashboard.ts` (`tenantName`, `riskLevel`, `plateNumber`, `assignedDriver`, `lpgLevelPercent`, `status`)
- `src/features/dashboard/chart-pie.tsx` (`status` on `Vehicle`)
- `src/features/routes/components/route-corridor-map.tsx`, `route-details-view.tsx`, `route-lpg-variation-panel.tsx`, `routes-columns.tsx` (`plateNumber`, `currentLocation`, `assignedDriver`)
- `src/features/routes/data/routes.ts` (`driver_phone`, `latitude`, `longitude`)
- `src/features/trucks/index.tsx` (`AVAILABLE`, `IN_TRANSIT`, `MAINTENANCE`, `INACTIVE`, `contractTierOptions`, `truckMarketerOptions`, `truckStatusOptions`, `plate_number`, `marketer`, `lpg_level_percent`, `status`)
- `src/features/trucks/components/truck-details-sheet.tsx` (`make_model`, `plate_number`, `status`, `tank_capacity_liters`, `lpg_level_percent`, `speed_kmh`, `eta_text`, `pressureBar`, `temperature_celsius`, `marketer`, `driver_phone`, `fleet_manager`, `operating_region`, `contract_tier`, `distance_km`, `route_progress`)
- `src/features/trucks/components/trucks-columns.tsx` (`plate_number`, `marketer`, `operating_region`, `driver_phone`, `status`, `lpg_level_percent`, `eta_text`, `contract_tier`)
- `src/features/trucks/components/trucks-map.tsx` (`available`, `longitude`, `latitude`, `status`, `plate_number`, `driver_phone`, `assigned_route`, `destination`, `lpg_level_percent`, `pressureBar`, `eta_text`, `destination_longitude`, `destination_latitude`)
- `src/features/trucks/components/trucks-table.tsx` (`contractTierOptions`, `truckMarketerOptions`, `truckStatusOptions`)
- `src/features/trucks/truck-details-sheet.tsx` (duplicate file outside `components/`, same fields)
- `src/features/trucks/trucks-columns.tsx`, `trucks-map.tsx`, `trucks-table.tsx`, `truck-details.tsx` (duplicate copies outside `components/`)
- `src/roles/super-admin/map-screen.tsx` (`available`, `tenantName`, `lpgLevelPercent`)

Pre-existing errors unrelated to trucks (left untouched):
- `src/features/activity/*`, `src/features/dashboard/chart-bar.tsx`, `marketers`, `transports`, `transporters`, `sites`, `module`, `roles`, `routes/route-lpg-variation-panel`, `_authenticated/settings/index.tsx`, `lib/utils.ts`, `packages/api-client/src/fake-adapter.ts`.

**No new errors introduced by my file.** Every error references fields/methods that were on the OLD `Truck`/`TruckTelemetry` and are now gone — exactly the expected consumer breakages called out in the brief.

### Full verbatim build output

Captured in `C:\Users\DTA_WO~1\AppData\Local\Temp\opencode\web-build.log` (51200+ lines; UI section above is verbatim).

## Commit

```
6e7d35b refactor(trucks): re-source Truck/TruckTelemetry to schema-backed view types
 1 file changed, 128 insertions(+), 143 deletions(-)
```

## Files changed

- `apps/web/src/features/trucks/trucks.ts` (modified)

No other working-tree files modified by this task.

## Self-review findings

- **snake_case discipline:** the new file contains no banned names. The `grep` against `tenantName|plateNumber|riskLevel|plate_number|make_model|contract_tier|driver_phone|fleet_manager|operating_region|tank_capacity_liters|lpg_level_percent|eta_text|route_progress|temperature_celsius|pressure_bar|speed_kmh|distance_km` only matched legitimate uses of the `RiskLevel` type and the new `risk_level` field (case-sensitive distinction: `RiskLevel` vs `risk_level`).
- **`required` vs `optional`:** `tournee_status`, `requested_quantity`, `org_id`, `risk_level`, `lat`, `lng` are required. Everything from `Vehicle.certificate_*` is optional (nullable in source), matching source-of-truth nullable columns.
- **`TourneeStatus` completeness:** `statusLabels`/`statusClasses` cover all 8 statuses that appear in the schema; `TOUR_STATUSES` fallback array includes `PLANNED`, `INPROGRESS`, `CHECKPOINTACTIVE`, `CLOSED`, `PENDINGTRANSPORTERACK` (seeded variety) — `DRAFT`/`ACKNOWLEDGED`/`CANCELLED` fall through to first real tour status if seeded.
- **`risk_scores` lookup:** correctly `entity_type === 'VEHICLE'` and `entity_id === vehicleId`. Falls back to `'FAIBLE'`.
- **`getTruckTelemetry`:** now derives fields from `Checkpoint.expected_arrival` / `Checkpoint.actual_arrival` (the only schema-backed arrival timestamps). `loaded_quantity` falls back to the truck's loaded_quantity then the tour's.
- **`@lpg/types` re-exports verified:** `Vehicle`, `Organization`, `Driver`, `DeliveryTour`, `VehicleType`, `TourneeStatus`, `Region`, `RiskLevel` all exist. `@lpg/mock-data` exports `curated`, `organizations`, `drivers`, `delivery_tours`, `checkpoints`, `risk_scores`.
- **Duplicate truck components:** the codebase ships duplicate copies of `trucks-columns.tsx`, `trucks-map.tsx`, `trucks-table.tsx`, `truck-details-sheet.tsx` in BOTH `src/features/trucks/` AND `src/features/trucks/components/`. The brief scopes this task to the data module only; consumers (both copies) will be fixed in Tasks 2-3.

## Concerns

1. **No `bash` heredoc powershell issue:** I had to use `Select-Object` / `Out-String` instead of `| head` (PowerShell 5.1 on Windows). All commands executed cleanly.
2. **Pre-existing consumer errors are extensive** (dossier activity, transporters, marketers, module screen, etc.). These are NOT part of this task but are noted because they would otherwise block a full `pnpm build`. Tasks 2-3 will not attempt to fix them; they are out of scope for the trucks re-source.
3. **Duplicate truck files** outside `components/` carry their own stale imports — Tasks 2-3 should update both copies, or the dead duplicates can be removed.
4. **`TOUR_STATUSES` fallback** uses a small fixed array; it's fine for demo seeding and never indexed into `Record<TourneeStatus, …>` directly (only used as a fallback when no real tour exists).
