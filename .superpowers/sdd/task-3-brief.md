# Task 3 Brief — Create `features/map/utils/popup.tsx`

**Files:**
- Create: `apps/web/src/features/map/utils/popup.tsx` — pure HTML builders for ArcGIS `content` callbacks.

**RUNTIME FACTS (verified, changes the original brief):**
- `features/sites/utils/site-graphics.ts` ALREADY exports `popupLine`, `escapePopupValue`, and `MapTheme` (and `createSitePopupContent`, `getSiteIconUrl`).
- `features/sites/data/sites.ts` ALREADY exports a map-shaped `Site` type with `longitude`/`latitude`/`type`/`region`/`operator`/`status`.
- Therefore this task must NOT re-declare `popupLine`/`escapePopupValue`/`MapTheme` — it REUSES them (zero-redundancy budget per AGMENTS.md §7).

**Interfaces:**
- Produces: wrapper builders `buildSitePopupContent(site, theme)`, `buildClientSitePopupContent(cs, theme)`, `buildZonePopupContent(zone, theme)`, `buildRegionPopupContent(region, theme)`, `buildVracPopupContent(vrac, theme)`, `buildAnomalyPopupContent(anomaly, theme)`.
- Reuses: `popupLine`, `escapePopupValue`, `MapTheme` from `features/sites/utils/site-graphics.ts`; `formatTm`, `formatNumber` from `./format`.
- Consumes types: `Site` from `features/sites/data/sites`, `ClientSiteView` from `../data/client-sites`, `GeoAnomalyView` from `../data/geo-anomalies`, `ZoneView` from `zones/data/zones`, `RegionSummary` from `../lib/regions`, `VracSummary` from `../lib/vrac-volume`.

No DOM lifecycle. No test (presentational string builder). Verify via typecheck.

## Step 1: Create `utils/popup.tsx`

Reuses `popupLine`, `escapePopupValue`, `createSitePopupContent` from `features/sites/utils/site-graphics.ts` (the canonical popup helpers used by the `/trucks` reference). Imports `MapTheme` from `./map-theme` (matching the trucks-map import convention). Uses `formatTm` from `./format`.

Final implemented file (`features/map/utils/popup.tsx`, typecheck-clean):

```tsx
import type { ClientSiteView } from '../data/client-sites'
import type { GeoAnomalyView } from '../data/geo-anomalies'
import type { ZoneView } from '../../zones/data/zones'
import type { RegionSummary } from '../lib/regions'
import type { VracSummary } from '../lib/vrac-volume'
import type { MapTheme } from './map-theme'
import { popupLine, escapePopupValue, createSitePopupContent } from '../../sites/utils/site-graphics'
import { formatTm } from './format'
// ... buildClientSitePopupContent / buildZonePopupContent / buildRegionPopupContent /
//     buildVracPopupContent / buildAnomalyPopupContent / re-export buildSitePopupContent
```

Status: DONE (typecheck PASS — already implemented and verified).
```

Wait — the `buildSitePopupContent` is declared twice (placeholder + re-export) which is invalid. Resolve by re-exporting the canonical one ONLY and deleting the placeholder. The canonical `createSitePopupContent(site: Site, mapTheme: MapTheme)` already exists and is map-shaped — perfect for the site marker. So:

**Final file:** re-export `createSitePopupContent as buildSitePopupContent` from `site-graphics`, and define the other builders (client-site, zone, region, vrac, anomaly) using the reused `popupLine`/`escapePopupValue`/`formatTm`.

## Step 2: Run typecheck

```bash
cd apps/web
npm run typecheck
```

Expected: PASS, 0 errors.

## Step 3: No commit. Continue to Task 9 (layers), which consumes these builders.
