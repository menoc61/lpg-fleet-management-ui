# Task 3: Fix cross-feature consumers of the re-sourced Truck type

**Goal:** After Tasks 1-2 re-sourced `apps/web/src/features/trucks/trucks.ts` to a schema-backed view type and made the trucks subtree green, the cross-feature consumers still reference the old removed Truck fields. Task 3 fixes ALL of them app-wide so every file that imports the `Truck` type compiles against the new shape.

**Files to fix (all that import `Truck` / `trucks` / `getTruckTelemetry` and reference removed fields):**
- `apps/web/src/features/dashboard/data/dashboard.ts` (aggregates trucks — uses `tenantName`, `riskLevel`, `status`, `getTruckTelemetry(id).lpgLevelPercent`)
- `apps/web/src/features/dashboard/dashboard.ts` (top-level duplicate of `data/dashboard.ts` — same edits)
- `apps/web/src/features/dashboard/index.tsx` (if it reads truck fields)
- `apps/web/src/features/dashboard/chart-pie.tsx`, `chart-bar.tsx`, `chart-line.tsx` (if they read truck/vehicle status)
- `apps/web/src/features/routes/data/routes.ts` (top-level `routes.ts` + `data/routes.ts` — imports `Truck`; uses `lpgLevelPercent` on its OWN RouteTelemetry which stays, but check `truck.*` field reads)
- `apps/web/src/roles/super-admin/map-screen.tsx` (imports `TRUCKS` + truck fields)
- `apps/web/src/features/command-palette/global-search.tsx` (imports `trucks`)
- `apps/web/src/roles/marketeur/delivery-tours-screen.tsx` (uses `truck.plateNumber` — flagged by Task 2 reviewer as missing from the file list)
- `apps/web/src/features/transporters/transporter-trucks-list.tsx`, `transporter-overview.tsx` and `components/*` copies (if they read truck fields)

**Interfaces (new Truck shape from Task 1):**
- `Truck`: `id`, `license_plate`, `type` ('VRAC'|'BOUTEILLES50KG'), `tournee_status` (DRAFT/PLANNED/PENDINGTRANSPORTERACK/ACKNOWLEDGED/INPROGRESS/CHECKPOINTACTIVE/CLOSED/CANCELLED), `max_volume?`, `max_bottle_count?`, `certificate_number?`, `certificate_expiry_at?`, `org_id`, `tenant_name`, `region`, `assigned_driver?`, `requested_quantity`, `loaded_quantity?`, `delivered_quantity?`, `risk_level` (FAIBLE/MODERE/ELEVE/CRITIQUE/CRITIQUEEXTREME), `current_location?`, `lat`, `lng`.
- `TruckTelemetry`: `loaded_quantity?`, `expected_arrival?`, `actual_arrival?` (NO speed).
- **Removed fields to replace app-wide:** `tenantName`→`tenant_name`, `riskLevel`→`risk_level`, `plate_number`/`plateNumber`→`license_plate`, `make_model`/`makeModel`→`${type} · ${license_plate}`, `currentLocation`→`current_location`, `status`→`tournee_status`, `latitude`/`longitude`→`lat`/`lng`, `getTruckTelemetry(id).lpgLevelPercent`→derived percent (use the shared `quantityInfo` helper from `apps/web/src/features/trucks/lib/quantity.ts` when possible, or inline the same type-dependent max logic).

**Global Constraints:**
- snake_case only; no camelCase alias pairs; no invented fields.
- VRAC → TM (max_volume); BOUTEILLES50KG → bottle count (max_bottle_count).
- UPPERCASE enums; no underscores.
- Do NOT rename/edit `@lpg/types` or `@lpg/mock-data`.
- The `routes.ts` features have their OWN RouteTelemetry type with `lpgLevelPercent` — that field stays for routes; only fix `truck.*` field reads there.
- `dashboard` fields like `transportedKg`/`loadedQuantityKg` belong to routes' own types — leave routes' own status/telemetry handling intact; only fix truck-field reads.

## Step 1: Inventory remaining errors

Run: `pnpm build`
Expected: FAILS with the cross-feature consumer errors (dashboard, routes truck-reads, map-screen, global-search, delivery-tours-screen, transporters). Identify which files reference removed `Truck` fields.

## Step 2: Fix each consumer

For each file, replace removed Truck field reads with the new snake_case fields per the mapping above. Use the shared `quantityInfo` helper for LPG-percent derivations where the consumer aggregates trucks; otherwise inline the same type-dependent max logic.

Key dashboard aggregation (in `dashboard/data/dashboard.ts` and duplicate `dashboard.ts`):
```ts
const entry = fleets.get(truck.tenant_name)!
entry.truckCount += 1
entry.activeTruckCount += ['PLANNED', 'INPROGRESS', 'CHECKPOINTACTIVE', 'PENDINGTRANSPORTERACK', 'ACKNOWLEDGED'].includes(truck.tournee_status) ? 1 : 0
entry.riskTruckCount += truck.risk_level === 'FAIBLE' ? 0 : 1
const telemetry = getTruckTelemetry(truck.id)
const max = truck.type === 'VRAC' ? truck.max_volume : truck.max_bottle_count
entry.averageLpgLevelPercent += max && max > 0 ? Math.round(((telemetry.loaded_quantity ?? 0) / max) * 100) : 0
```
And replace `trip.truck.tenantName` → `trip.truck.tenant_name` in the route loop.

## Step 3: Build + lint

Run: `pnpm build`
Expected: **zero errors related to removed Truck fields** across the app. Other pre-existing errors in features NOT related to trucks (activity, transporters' own data, marketers, sites, module-screen, etc.) may remain — those are out of this task's scope and tracked for follow-up.
Run: `pnpm lint`
Expected: exit 0 (may keep existing warnings).

## Step 4: Commit

```bash
git add apps/web/src/features/dashboard apps/web/src/features/routes apps/web/src/features/command-palette apps/web/src/roles/super-admin/map-screen.tsx apps/web/src/roles/marketeur/delivery-tours-screen.tsx apps/web/src/features/transporters
git commit -m "refactor(trucks): migrate cross-feature consumers to schema-backed Truck"
```

(Only stage the specific files you changed; do not stage unrelated edits.)
