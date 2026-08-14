# Task 4 Brief — Create `features/map/data/client-sites.ts`

**Files:**
- Create: `apps/web/src/features/map/data/client-sites.ts`

**Interfaces:**
- Produces: `ClientSiteView` type and `clientSites: readonly ClientSiteView[]` exported as the single source of client-site data for the map.
- Consumes: `ClientSite` from `@lpg/types`, `curated.client_sites` + `organizations` from `@lpg/mock-data`.

This is a **non-test** data-view task (view builders are not pure logic with business rules — they're simple transforms; the TDD cycle applies to `lib/` per AGENTS.md §3). It is verified via typecheck only.

## Step 1: Create the file

Read the first `client_sites` entry in `packages/mock-data/src/seed/curated/03_sites_and_client_sites.json` to confirm the exact field set available: `id`, `client_org_id`, `region`, `name`, `address`, `geo_point` ([lng, lat]), `is_active`, `current_marketeur_org_id`. Read `packages/mock-data/src/seed/curated/01_organizations.json` to confirm `organizations` export name and `name`/`id`/`type` fields. (The `features/sites/data/sites.ts` file already does the equivalent transform for `sites` — mirror its `REGION_LABELS` + `cityFromAddress` style.)

```ts
import { curated, organizations } from '@lpg/mock-data'
import type { ClientSite } from '@lpg/types'

export type ClientSiteMarkerType = 'client-marketer' | 'client-delivery' | 'client-other'

export interface ClientSiteView {
  id: string
  name: string
  city: string
  region: string
  clientName: string
  client_org_id: string
  current_marketeur_org_id: string | null
  is_active: boolean
  markerType: ClientSiteMarkerType
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

const orgById = new Map(organizations.map((o) => [o.id, o.name]))

function cityFromAddress(address: string | undefined): string {
  if (!address) return '—'
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean)
  const beforeCam = parts.filter((p) => !/cameroun/i.test(p))
  if (beforeCam.length === 0) return '—'
  const last = beforeCam[beforeCam.length - 1]!
  const tokens = last.split(/\s+/)
  return tokens[tokens.length - 1] ?? '—'
}

function markerTypeFor(clientSite: ClientSite): ClientSiteMarkerType {
  if (clientSite.client_org_id.includes('marketeur')) return 'client-marketer'
  if (clientSite.client_org_id.includes('client')) return 'client-delivery'
  return 'client-other'
}

export const clientSites: readonly ClientSiteView[] = curated.client_sites.map(
  (cs): ClientSiteView => {
    const geo = cs.geo_point as [number, number] | null | undefined
    return {
      id: cs.id,
      name: cs.name,
      city: cityFromAddress(cs.address),
      region: REGION_LABELS[cs.region] ?? cs.region,
      clientName: orgById.get(cs.client_org_id) ?? cs.client_org_id,
      client_org_id: cs.client_org_id,
      current_marketeur_org_id: cs.current_marketeur_org_id ?? null,
      is_active: cs.is_active,
      markerType: markerTypeFor(cs),
      longitude: geo?.[0] ?? 0,
      latitude: geo?.[1] ?? 0,
    }
  },
)
```

## Step 2: Run typecheck

```bash
cd apps/web
npm run typecheck -- --noEmit features/map/data/client-sites.ts 2>&1 | head -5 || true
npm run typecheck
```

(Use the project-level `npm run typecheck` if the per-file invocation isn't supported by the project's tsconfig setup.) Expected: PASS, 0 errors.

## Step 3: No commit. Continue to Task 5 (geo-anomalies).
