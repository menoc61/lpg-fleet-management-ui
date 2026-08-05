# Task 2: Update trucks feature components (columns, page, details, sheet)

**Files:**
- Modify: `apps/web/src/features/trucks/components/trucks-columns.tsx`
- Modify: `apps/web/src/features/trucks/components/trucks-map.tsx`
- Modify: `apps/web/src/features/trucks/index.tsx`
- Modify: `apps/web/src/features/trucks/truck-details.tsx`
- Modify: `apps/web/src/features/trucks/truck-details-sheet.tsx` (top-level; exports `TruckDetailsBody`, imported by `truck-details.tsx`)
- Modify: `apps/web/src/features/trucks/components/truck-details-sheet.tsx` (exports `TruckDetailsSheet`, imported by `index.tsx`)

**Interfaces:**
- Consumes: `getTruckTelemetry`, `type Truck`, `statusLabels`, `statusClasses`, `riskLabels`, `riskClasses` from `./trucks` (new shapes from Task 1).
- Notes: `getTruckTelemetry(...).lpg_level_percent` is gone; LPG level is now type-dependent from `truck.max_volume` (VRAC, TM) or `truck.max_bottle_count` (BOUTEILLES50KG). `truck.make_model`, `truck.contract_tier`, `truck.driver_phone`, `truck.fleet_manager`, `truck.operating_region`, `truck.status` no longer exist.

## Step 1: Screenshot the pre-edit build errors

Run: `pnpm build`
Expected: FAILS at the truck components. This is the task's fail signal — you fix exactly these.

## Step 2: Fix `components/trucks-columns.tsx`

Find every use of `getTruckTelemetry(...)` and LPG/ETA/status logic and replace with schema-backed equivalents. Replace the LPG accessor (currently `accessorFn: (truck) => getTruckTelemetry(truck.id).lpg_level_percent`) with a shared quantity helper.

Add a small local helper in the columns file:

```ts
function quantityInfo(truck: Truck): { amount: string; percent: number } {
  const telemetry = getTruckTelemetry(truck.id)
  const max = truck.type === 'VRAC' ? truck.max_volume : truck.max_bottle_count
  const loaded = telemetry.loaded_quantity ?? truck.loaded_quantity ?? 0
  const percent = max && max > 0 ? Math.round((loaded / max) * 100) : 0
  const unit = truck.type === 'VRAC' ? ' TM' : ' bouteilles'
  return { amount: `${Math.round(loaded)}/${max ?? '—'}${unit}`, percent }
}
```

Tip: the same helper is also needed in `components/trucks-map.tsx`. **Put it in a shared file** like `apps/web/src/features/trucks/lib/quantity.ts` and import from both locations. Do not duplicate the logic.

Then update the telemetry column:
```ts
accessorFn: (truck) => quantityInfo(truck).percent,
```
and the cell body (replacing the `{telemetry.lpg_level_percent}% • ETA {telemetry.eta_text}` line):
```ts
const info = quantityInfo(row.original)
// ...
style={{ width: `${info.percent}%` }}
// ...
{info.percent}% • {info.amount}
```
Remove every reference to `eta_text`, `lpg_level_percent`, and `getTruckTelemetry(...).lpg_level_percent` in this file.

## Step 3: Fix `components/trucks-map.tsx`

Replace telemetry parsing in the popup builder (currently reads `telemetry.lpg_level_percent`, `telemetry.eta_text`, `telemetry.pressureBar`):

```ts
const info = quantityInfo(truck) // import from lib/quantity.ts
// ${popupLine('Niveau GPL', info.amount)}
// ${popupLine('ETA', telemetry.expected_arrival ? new Date(telemetry.expected_arrival).toLocaleTimeString() : '—')}
```
Remove the `Pression` line. Replace `truck.latitude`/`truck.longitude` uses with `truck.lat`/`truck.lng`. Remove any `make_model` usage (derive `${truck.type} · ${truck.license_plate}`).

## Step 4: Fix `index.tsx`

The average-LPG reducer currently does `getTruckTelemetry(truck.id).lpg_level_percent`. Replace with a percent derived from total capacity:

```ts
const avgLpg = useMemo(() => {
  const list = visible.length > 0 ? visible : trucks
  if (list.length === 0) return 0
  const { sum, count } = list.reduce(
    (acc, truck) => {
      const telemetry = getTruckTelemetry(truck.id)
      const max = truck.type === 'VRAC' ? truck.max_volume : truck.max_bottle_count
      if (!max || max <= 0) return acc
      const pct = Math.round(((telemetry.loaded_quantity ?? 0) / max) * 100)
      return { sum: acc.sum + pct, count: acc.count + 1 }
    },
    { sum: 0, count: 0 },
  )
  return count === 0 ? 0 : Math.round(sum / count)
}, [visible])
```

## Step 5: Fix `truck-details.tsx` + BOTH sheet files

The page title uses `truck.make_model` and `truck.plate_number` — replace with `${truck.type} · ${truck.license_plate}` and update the description to `truck.id — truck.tenant_name`.

**Apply the SAME edits to both sheets** (`truck-details-sheet.tsx` top-level AND `components/truck-details-sheet.tsx`), since they are both live (top-level exports `TruckDetailsBody` used by `truck-details.tsx`; `components/` exports `TruckDetailsSheet` used by `index.tsx`): remove all uses of `make_model`, `plate_number` (`→ license_plate`), `driver_phone`, `fleet_manager`, `operating_region` (`→ region`), `contract_tier`, `tank_capacity_liters`, and `telemetry.pressureBar` / `telemetry.temperature_celsius` / `telemetry.route_progress` / `telemetry.distance_km` / `telemetry.speed_kmh`. Keep ETA/loaded lines, re-labeled per unit:

- Speed MetricCard: **remove** (no SQL/TODO source — user decision).
- LPG MetricCard: `type === 'VRAC'` → `${Math.round(loaded)}/${max_volume} TM` else `${loaded}/${max_bottle_count} bouteilles`; `detail` shows remaining percent.
- ETA MetricCard: `${telemetry.expected_arrival ? new Date(telemetry.expected_arrival).toLocaleTimeString() : '—'}`.

The `components/truck-details-sheet.tsx` version also renders a `<MiniSignal>` grid with `MapPin`/`Thermometer` in the maintenance tab — remove that block (temperature/distance have no schema source).

## Step 6: Build + lint

Run: `pnpm build`
Expected: exit 0.
Run: `pnpm lint`
Expected: exit 0 (may keep existing warnings).

## Step 7: Commit

```bash
git add apps/web/src/features/trucks
git commit -m "refactor(trucks): update components to schema-backed Truck/TruckTelemetry"
```
