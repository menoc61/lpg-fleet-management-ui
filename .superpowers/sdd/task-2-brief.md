# Task 2 Brief — Extract shared map helpers from /trucks into features/map/utils/

**Files:**
- Create: `apps/web/src/features/map/utils/map-theme.ts`
- Create: `apps/web/src/features/map/utils/legend.tsx`
- Create: `apps/web/src/features/map/utils/format.ts`
- Create: `apps/web/src/features/map/utils/format.test.ts`
- Create: `apps/web/src/features/map/utils/map-theme.test.ts`
- Modify: `apps/web/src/features/trucks/components/trucks-map.tsx`

**Interfaces (all from `apps/web/src/features/map/utils/`):**
- `getArcgisBasemap(theme)`, `getArcgisViewTheme(theme)`, `getMarkerOutlineColor(theme, isSelected)`, `getSiteOutlineColor(theme)`, `getLpgMarkerIcon(theme)`, `getSiteIconUrl(type, theme)`, `svgToDataUri(svg)`, `rgbaFromTuple(t)` — exported from `map-theme.ts`.
- `formatTm(tm)`, `formatBtl(btl)`, `formatPercent(pct)` — exported from `format.ts`.
- `<LegendSiteIcon type, mapTheme />` — exported from `legend.tsx`.

## Step 1: Create `apps/web/src/features/map/utils/map-theme.ts`

The complete file content:

```ts
import lpgCenterSvgRaw from '@/assets/lpg.svg?raw'
import lpgSphereIconUrl from '@/assets/lpg-sphere.png'

export type MapTheme = 'light' | 'dark'

export function getArcgisBasemap(mapTheme: MapTheme): string {
  return mapTheme === 'dark' ? 'dark-gray-vector' : 'streets-navigation-vector'
}

export function getArcgisViewTheme(
  mapTheme: MapTheme,
): { accentColor: string; textColor: string } {
  return mapTheme === 'dark'
    ? { accentColor: '#86efac', textColor: '#f8fafc' }
    : { accentColor: '#16a34a', textColor: '#0f172a' }
}

export function getMarkerOutlineColor(
  mapTheme: MapTheme,
  isSelected: boolean,
): [number, number, number, number] {
  if (mapTheme === 'dark') {
    return isSelected ? [248, 250, 252, 1] : [226, 232, 240, 0.86]
  }
  return isSelected ? [255, 255, 255, 1] : [15, 23, 42, 0.28]
}

export function getSiteOutlineColor(mapTheme: MapTheme): [number, number, number, number] {
  return mapTheme === 'dark' ? [226, 232, 240, 0.84] : [15, 23, 42, 0.28]
}

export function svgToDataUri(svg: string): string {
  const normalizedSvg = svg.replace(/\s+/g, ' ').trim()
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(normalizedSvg)}`
}

export function rgbaFromTuple(value: [number, number, number, number]): string {
  return `rgba(${value[0]}, ${value[1]}, ${value[2]}, ${value[3]})`
}

export function getLpgMarkerIcon(mapTheme: MapTheme): string {
  const fillColor = mapTheme === 'dark' ? '#f8fafc' : '#0f172a'
  return svgToDataUri(lpgCenterSvgRaw.replace(/#000000/g, fillColor))
}

export function getSiteIconUrl(
  siteType: 'depot' | 'scdp' | 'filling-center' | 'marketer' | 'delivery-point',
  mapTheme: MapTheme,
): string {
  if (siteType === 'filling-center') return getLpgMarkerIcon(mapTheme)
  return lpgSphereIconUrl
}
```

## Step 2: Create `apps/web/src/features/map/utils/legend.tsx`

```tsx
import type { SiteType } from '@/features/sites/data/sites'
import { siteMarkerTokens } from '@/features/sites/utils/site-graphics'
import {
  getSiteIconUrl,
  rgbaFromTuple,
} from './map-theme'
import type { MapTheme } from './map-theme'

export function LegendSiteIcon({
  type,
  mapTheme,
}: {
  type: SiteType
  mapTheme: MapTheme
}) {
  const marker = siteMarkerTokens[type]
  if (marker.iconKind === 'marker') {
    return (
      <span
        className='block size-2.5 rounded-full'
        style={{ backgroundColor: marker.swatch }}
      />
    )
  }
  return (
    <span
      className='flex size-6 items-center justify-center rounded-full'
      style={{ backgroundColor: rgbaFromTuple(marker.haloColor) }}
    >
      <img
        src={getSiteIconUrl(type, mapTheme)}
        alt=''
        className='max-h-4 max-w-4 object-contain'
      />
    </span>
  )
}
```

`siteMarkerTokens` is the canonical version from `features/sites/utils/site-graphics` (single source of truth — the duplicate in `trucks-map.tsx` is dead code per AGENTS.md §3).

## Step 3: Create `apps/web/src/features/map/utils/format.ts`

```ts
const tmFmt = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const btlFmt = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
})

/** Format a VRAC volume in TM (tonnes métriques). VRAC is never displayed in kg. */
export function formatTm(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `${tmFmt.format(value)} TM`
}

/** Format a bottle count in `btl` (individual 50 kg bottles). */
export function formatBtl(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `${btlFmt.format(value)} btl`
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `${Math.round(value)} %`
}
```

## Step 4: Create `apps/web/src/features/map/utils/format.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { formatTm, formatBtl, formatPercent } from './format'

describe('formatTm', () => {
  it('formats a VRAC volume in TM with French separators', () => {
    expect(formatTm(1234.5)).toBe('1 234,5 TM')
  })
  it('returns the em-dash for non-finite values', () => {
    expect(formatTm(Number.NaN)).toBe('—')
    expect(formatTm(Infinity)).toBe('—')
  })
  it('never uses kg for VRAC quantities', () => {
    for (const sample of [0, 0.1, 1, 12.34, 1000, 99_999.999]) {
      expect(formatTm(sample)).not.toMatch(/kg/i)
    }
  })
})

describe('formatBtl', () => {
  it('formats a bottle count as integer with btl suffix', () => {
    expect(formatBtl(42)).toBe('42 btl')
  })
})

describe('formatPercent', () => {
  it('rounds to integer', () => {
    expect(formatPercent(73.4)).toBe('73 %')
  })
})
```

## Step 5: Create `apps/web/src/features/map/utils/map-theme.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import {
  getArcgisBasemap,
  getArcgisViewTheme,
  getMarkerOutlineColor,
  getSiteOutlineColor,
  rgbaFromTuple,
} from './map-theme'

describe('map-theme', () => {
  it('returns dark basemap for dark theme', () => {
    expect(getArcgisBasemap('dark')).toBe('dark-gray-vector')
  })
  it('returns streets-navigation-vector for light theme', () => {
    expect(getArcgisBasemap('light')).toBe('streets-navigation-vector')
  })
  it('outline colors are 4-tuples', () => {
    expect(getMarkerOutlineColor('light', true)).toHaveLength(4)
    expect(getSiteOutlineColor('dark')).toHaveLength(4)
  })
  it('rgbaFromTuple renders RGBA', () => {
    expect(rgbaFromTuple([10, 20, 30, 0.5])).toBe('rgba(10, 20, 30, 0.5)')
  })
  it('view theme exposes accent + text', () => {
    expect(getArcgisViewTheme('dark').accentColor).toBeTruthy()
    expect(getArcgisViewTheme('light').textColor).toBeTruthy()
  })
})
```

## Step 6: Refactor `apps/web/src/features/trucks/components/trucks-map.tsx` to import the shared helpers

Read `apps/web/src/features/trucks/components/trucks-map.tsx` first (read lines 1-130 and lines 600-687 to see the inline `siteMarkerTokens` block, the `MapTheme` type alias, the seven helper functions, and the `LegendSiteIcon` component).

Then:

a. Replace the inline `siteMarkerTokens` block (currently at lines 60-123, type `MapTheme` declared at line 45) with a re-export of the canonical version and a type alias re-export:

In the existing `type MapTheme = 'light' | 'dark'` line (currently line 45 in `trucks-map.tsx`), change to:

```ts
import { siteMarkerTokens, type MapTheme } from '@/features/map/utils/map-theme'
```

Then delete the entire inline `const siteMarkerTokens: Record<...>` block (lines 60-123) and remove the local `type MapTheme = ...` since it now comes from the import.

b. At the top of the file (after the existing imports, near the React/ArcGIS imports), add:

```ts
import {
  getArcgisBasemap,
  getArcgisViewTheme,
  getMarkerOutlineColor,
  getSiteOutlineColor,
  getLpgMarkerIcon,
  getSiteIconUrl,
  svgToDataUri,
  rgbaFromTuple,
} from '@/features/map/utils/map-theme'
import { LegendSiteIcon } from '@/features/map/utils/legend'
```

Note: `svgToDataUri` and `rgbaFromTuple` are imported for tree-shake parity but may not be called directly in `trucks-map.tsx` after the refactor. If they become unused after deletion, omit them from the import list (ESLint will flag unused imports).

c. **Delete** the inline helper functions at the bottom of the file (approximately lines 602-687):

- `function getArcgisBasemap(...)`
- `function getArcgisViewTheme(...)`
- `function getMarkerOutlineColor(...)`
- `function getSiteOutlineColor(...)`
- `function getLpgMarkerIcon(...)`
- `function svgToDataUri(...)`
- `function rgbaFromTuple(...)`
- `function LegendSiteIcon(...)`

The call sites in `createTruckGraphic`, `createSiteGraphics`, the JSX rendering the legend, etc., already use the exact same function names — keep them as-is.

d. Keep the existing `import lpgSphereIconUrl from '@/assets/lpg-sphere.png'` line in `trucks-map.tsx` (it's used by the original code path before this refactor; check whether any call site in `trucks-map.tsx` still uses `lpgSphereIconUrl` directly after deletion — if not, remove the import too).

## Step 7: Run tests

```bash
cd apps/web
npm test -- features/trucks features/map
```

Expected: PASS. The `/trucks` behavior must be unchanged; the new `features/map` tests must pass.

## Step 8: Run typecheck + lint

```bash
cd apps/web
npm run typecheck
npm run lint
```

Expected: PASS.

## Step 9: No commit yet. Continue to Task 3.
