# Task 8 Brief — Create `features/map/data/national-map.ts` (+ test)

**Files:**
- Create: `apps/web/src/features/map/data/national-map.test.ts` (test first)
- Create: `apps/web/src/features/map/data/national-map.ts` (implementation)

**Interfaces:**
- Produces: `NationalMapView` type and `getNationalMapView(): NationalMapView` — the single aggregated view the map component consumes.
- Consumes: `siteViews` from `features/map/data/sites.ts`, `clientSites` from `features/map/data/client-sites.ts`, `getZones` from `features/zones/data/zones.ts`, `regionsForMap` from `features/map/lib/regions.ts`, `getGeoAnomalies` from `features/map/data/geo-anomalies.ts`, `aggregateVracVolume` from `features/map/lib/vrac-volume.ts`.

This task ASSEMBLES the per-entity views (Tasks 4-7 outputs) into one typed object the page component subscribes to. TDD: test the composition contract (all sub-arrays present and finite), then implement as a pure pass-through.

## Step 1: Confirm dependent exports exist

- `features/map/data/sites.ts` exports `SiteView[]` (verify name). If it doesn't exist yet, create a minimal `sites.ts` here mirroring `client-sites.ts` (Task 4 style) so Task 8 can import it — do NOT duplicate the canonical `features/sites/data/sites.ts`; instead create the map-feature variant that adds `longitude`/`latitude`/`markerType` for map rendering. (The national map needs the map-shaped site view, distinct from the canonical sites view.)
- `features/map/data/client-sites.ts` exports `clientSites: readonly ClientSiteView[]` ✓ (Task 4).
- `features/zones/data/zones.ts` exports `getZones(): ZoneView[]` ✓ (Task 6 verified).
- `features/map/lib/regions.ts` exports `regionsForMap(): readonly RegionSummary[]` ✓ (Task 6).
- `features/map/data/geo-anomalies.ts` exports `getGeoAnomalies(): readonly GeoAnomalyView[]` ✓ (Task 5).
- `features/map/lib/vrac-volume.ts` exports `aggregateVracVolume(): VracSummary` ✓ (Task 7).

## Step 2: Write the test

```ts
import { describe, it, expect } from 'vitest'
import { getNationalMapView } from './national-map'

describe('getNationalMapView', () => {
  it('exposes every aggregated sub-view', () => {
    const view = getNationalMapView()
    expect(Array.isArray(view.sites)).toBe(true)
    expect(Array.isArray(view.clientSites)).toBe(true)
    expect(Array.isArray(view.zones)).toBe(true)
    expect(Array.isArray(view.regions)).toBe(true)
    expect(Array.isArray(view.anomalies)).toBe(true)
    expect(typeof view.vrac.totalTM).toBe('number')
  })

  it('flags at least one anomaly present in the mock', () => {
    const view = getNationalMapView()
    expect(view.anomalies.length).toBeGreaterThan(0)
  })
})
```

## Step 3: Run test (FAIL)

```bash
cd apps/web
npx vitest run features/map/data/national-map.test.ts --reporter=verbose
```

Fallback: `--config vitest.local.config.ts` (temp Node config — created and deleted inline).

## Step 4: Implement `data/national-map.ts`

If `features/map/data/sites.ts` does not yet exist, first create it (minimal, mirroring `client-sites.ts`) as a pre-req so the import resolves:

```ts
// features/map/data/sites.ts  (create if absent)
import { curated } from '@lpg/mock-data'
import type { Site as CuratedSite } from '@lpg/types'
import type { ClientSiteView } from './client-sites'

export type { ClientSiteView }

export interface SiteView {
  id: string
  name: string
  region: string
  longitude: number
  latitude: number
}

const REGION_LABELS: Record<string, string> = {
  ADAMAOUA: 'Adamaoua',
  CENTRE: 'Centre',
  EST: 'Est',
  EXTREMENORD: 'Extrême-Nord',
  LITTORAL: 'Littoral',
  NORD: 'Nord',
  NORDOUEST: 'Nord-Ouest',
  OUEST: 'Ouest',
  SUD: 'Sud',
  SUDOUEST: 'Sud-Ouest',
}

export const siteViews: readonly SiteView[] = (curated.sites as CuratedSite[]).map(
  (s) => ({
    id: s.id,
    name: s.name,
    region: REGION_LABELS[s.region] ?? s.region,
    longitude: (s.geo_point as [number, number] | undefined)?.[0] ?? 0,
    latitude: (s.geo_point as [number, number] | undefined)?.[1] ?? 0,
  }),
)
```

Then `national-map.ts`:

```ts
import { getZones } from '../../zones/data/zones'
import { getGeoAnomalies } from './geo-anomalies'
import { clientSites } from './client-sites'
import { siteViews } from './sites'
import { regionsForMap } from '../lib/regions'
import { aggregateVracVolume } from '../lib/vrac-volume'
import type { VracSummary } from '../lib/vrac-volume'
import type { RegionSummary } from '../lib/regions'

export interface NationalMapView {
  sites: readonly SiteView[]
  clientSites: readonly ClientSiteView[]
  zones: readonly ZoneView[]
  regions: readonly RegionSummary[]
  anomalies: readonly GeoAnomalyView[]
  vrac: VracSummary
}

export function getNationalMapView(): NationalMapView {
  return {
    sites: siteViews,
    clientSites,
    zones: getZones(),
    regions: regionsForMap(),
    anomalies: getGeoAnomalies(),
    vrac: aggregateVracVolume(),
  }
}
```

(Import `ZoneView` from `features/zones/data/zones` for the type; resolve `GeoAnomalyView`, `ClientSiteView` from their modules.)

## Step 5: Run test (PASS)

```bash
cd apps/web
npx vitest run features/map/data/national-map.test.ts --reporter=verbose
```

Expected: PASS (2/2).

## Step 6: Run typecheck

```bash
cd apps/web
npm run typecheck
```

Expected: PASS, 0 errors.

## Step 7: No commit. Continue to Task 3 (popup.tsx), then Task 9 (layers).
