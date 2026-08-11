# Task 9 Brief — Create `features/map/lib/layers.ts` (+ test) — TDD

**RUNTIME FACTS (verified, changes the original brief):**
- `features/sites/utils/site-graphics.ts` exports `siteMarkerTokens: Record<SiteType, {...}>` with keys `depot | scdp | filling-center | marketer | delivery-point` and fields `color`, `iconKind`, `style`, `size`, `swatch` (NOT `site`/`clientSite` keys, no `dataUrl`).
- It also exports `getSiteIconUrl(siteType, mapTheme)`, `getLpgMarkerIcon`, `getSiteOutlineColor` etc.
- So `layers.ts` should reuse `siteMarkerTokens` indexed by `SiteType`, and `getSiteIconUrl` rather than the brief's `siteMarkerTokens.site.dataUrl`/`clientSite`.

**Files:**
- Create: `apps/web/src/features/map/lib/layers.test.ts` (test first)
- Create: `apps/web/src/features/map/lib/layers.ts` (implementation)

**Interfaces:**
- Produces: `MapLayerKey`, `getInitialLayers()`, `buildLayerSpecs(view, theme, toggles): MapLayerSpec[]`.
- Consumes: `NationalMapView` (Task 8), `MapTheme` (reuse from `sites/utils/site-graphics`), `siteMarkerTokens`/`SiteType` (reuse), popup builders from `utils/popup.tsx` (Task 3), `SiteType` from `features/sites/data/sites`.

## Step 1: Write the test

```ts
import { describe, it, expect } from 'vitest'
import { getInitialLayers, buildLayerSpecs, type MapLayerKey } from './layers'
import { getNationalMapView } from '../data/national-map'
import { mapThemeDefault } from '../utils/map-theme'

describe('getInitialLayers', () => {
  it('exposes a boolean toggle per layer', () => {
    const layers = getInitialLayers()
    for (const key of Object.keys(layers) as MapLayerKey[]) {
      expect(typeof layers[key]).toBe('boolean')
    }
  })

  it('shows sites, clientSites, regions, vrac by default; hides zones + anomalies', () => {
    const layers = getInitialLayers()
    expect(layers.sites).toBe(true)
    expect(layers.clientSites).toBe(true)
    expect(layers.regions).toBe(true)
    expect(layers.vrac).toBe(true)
    expect(layers.zones).toBe(false)
    expect(layers.anomalies).toBe(false)
  })
})

describe('buildLayerSpecs', () => {
  it('emits one spec per enabled layer', () => {
    const view = getNationalMapView()
    const layers = getInitialLayers()
    const specs = buildLayerSpecs(view, mapThemeDefault, layers)
    const enabledKeys = layers
      ? (Object.keys(layers).filter((k) => layers[k as unknown as keyof typeof layers])) as string[]
      : []
    expect(specs.length).toBe(enabledKeys.length)
    expect(specs.every((s) => typeof s.key === 'string' && s.enabled)).toBe(true)
  })

  it('content callbacks are functions; markers carry an icon', () => {
    const view = getNationalMapView()
    const specs = buildLayerSpecs(view, mapThemeDefault, getInitialLayers())
    for (const spec of specs) {
      expect(typeof spec.content).toBe('function')
      expect(typeof spec.marker.icon).toBe('string')
    }
  })
})
```

## Step 2: Run test (FAIL)

```bash
cd apps/web
npm run test:unit -- --browser=false features/map/lib/layers.test.ts 2>&1 | Select-String -Pattern "FAIL|PASS|Tests"
```

## Step 3: Implement `lib/layers.ts`

**Verified facts correcting this brief:**
- `features/map/utils/map-theme.ts` (Task 2) does NOT export `mapThemeDefault`. Tests import a literal: `const theme: MapTheme = 'light'` (or import `MapTheme` from `./map-theme`). The test above using `mapThemeDefault` must change — use `'light'`.
- `siteMarkerTokens` (from `features/sites/utils/site-graphics.ts`) is keyed by `SiteType` = `depot | scdp | filling-center | marketer | delivery-point`; each value has `color: [number,number,number,number]` (RGBA 0-255 tuple), `size`, `iconKind`, `style`, `swatch`. It does NOT have `.dataUrl`.
- `features/map/utils/map-theme.ts` already exports `getSiteIconUrl(siteType, theme)` and `rgbaFromTuple([r,g,b,a])` — use these (rgbaFromTuple correctly emits CSS-valid `rgba(r,g,b,a)` with 0-255 values, so no normalization concern remains). This matches the `/trucks` reference (trucks-map.tsx lines 22-28, 20).
- Popup builders come from Task 3 (`features/map/utils/popup.tsx`): `buildClientSitePopupContent`, `buildZonePopupContent`, `buildRegionPopupContent`, `buildVracPopupContent`, `buildAnomalyPopupContent`, `buildSitePopupContent` (re-export of canonical `createSitePopupContent`).

```ts
import type { NationalMapView } from '../data/national-map'
import type { MapTheme } from '../../sites/utils/site-graphics'
import { mapThemeDefault } from '../utils/map-theme'
import { siteMarkerTokens, type SiteType } from '../../sites/data/sites'
import { getSiteIconUrl } from '../../sites/utils/site-graphics'
import {
  buildClientSitePopupContent,
  buildZonePopupContent,
  buildRegionPopupContent,
  buildVracPopupContent,
  buildAnomalyPopupContent,
  buildSitePopupContent,
} from '../utils/popup'

export type MapLayerKey =
  | 'sites'
  | 'clientSites'
  | 'zones'
  | 'regions'
  | 'anomalies'
  | 'vrac'

export interface MapLayerSpec {
  key: MapLayerKey
  label: string
  enabled: boolean
  marker: { icon: string; color: string; size: number }
  content: (feature: unknown) => string
}

export function getInitialLayers(): Record<MapLayerKey, boolean> {
  return {
    sites: true,
    clientSites: true,
    zones: false,
    regions: true,
    anomalies: false,
    vrac: true,
  }
}

const LAYER_LABELS: Record<MapLayerKey, string> = {
  sites: 'Sites marchands',
  clientSites: 'Sites clients',
  zones: 'Zones géographiques',
  regions: 'Régions',
  anomalies: 'Anomalies',
  vrac: 'Volume VRAC (TM)',
}

export function buildLayerSpecs(
  view: NationalMapView,
  theme: MapTheme,
  toggles: Record<MapLayerKey, boolean>,
): MapLayerSpec[] {
  const specs: MapLayerSpec[] = []

  if (toggles.sites) {
    const token = siteMarkerTokens['filling-center'] // key sites render as filling-centers
    specs.push({
      key: 'sites',
      label: LAYER_LABELS.sites,
      enabled: true,
      marker: { icon: getSiteIconUrl('filling-center', theme), color: `rgba(${token.color.join(',')})`, size: token.size },
      content: (f) =>
        buildSitePopupContent(f as Parameters<typeof buildSitePopupContent>[0], theme),
    })
  }
  if (toggles.clientSites) {
    const token = siteMarkerTokens['delivery-point']
    specs.push({
      key: 'clientSites',
      label: LAYER_LABELS.clientSites,
      enabled: true,
      marker: { icon: getSiteIconUrl('delivery-point', theme), color: `rgba(${token.color.join(',')})`, size: token.size },
      content: (f) =>
        buildClientSitePopupContent(f as Parameters<typeof buildClientSitePopupContent>[0], theme),
    })
  }
  if (toggles.zones) {
    specs.push({
      key: 'zones',
      label: LAYER_LABELS.zones,
      enabled: true,
      marker: { icon: '🔷', color: '#6366F1', size: 12 },
      content: (f) =>
        buildZonePopupContent(f as Parameters<typeof buildZonePopupContent>[0], theme),
    })
  }
  if (toggles.regions) {
    specs.push({
      key: 'regions',
      label: LAYER_LABELS.regions,
      enabled: true,
      marker: { icon: '🟦', color: '#3B82F6', size: 20 },
      content: (f) =>
        buildRegionPopupContent(f as Parameters<typeof buildRegionPopupContent>[0], theme),
    })
  }
  if (toggles.anomalies) {
    specs.push({
      key: 'anomalies',
      label: LAYER_LABELS.anomalies,
      enabled: true,
      marker: { icon: '⚠', color: '#EF4444', size: 16 },
      content: (f) =>
        buildAnomalyPopupContent(f as Parameters<typeof buildAnomalyPopupContent>[0], theme),
    })
  }
  if (toggles.vrac) {
    specs.push({
      key: 'vrac',
      label: LAYER_LABELS.vrac,
      enabled: true,
      marker: { icon: '🛢', color: '#F59E0B', size: 16 },
      content: () => buildVracPopupContent(view.vrac, theme),
    })
  }

  return specs
}
```

## Step 4: Run test (PASS)

```bash
cd apps/web
npm run test:unit -- --browser=false features/map/lib/layers.test.ts 2>&1 | Select-String -Pattern "FAIL|PASS|Tests|passed|failed"
```

## Step 5: Run typecheck

```bash
cd apps/web
npm run typecheck
```

Expected: PASS.

## Step 6: No commit. Continue to Task 10 (nav wiring).

## Concerns
- Tests must use a literal `'light'` theme (no `mapThemeDefault` exists). 
- `rgbaFromTuple` from `map-theme.ts` is correct (0-255 in CSS rgba is valid) — use it for marker colors, no manual normalization.
- `token.color` is RGBA 0-255; `rgbaFromTuple` already handles conversion to `rgba(r,g,b,a)`.
