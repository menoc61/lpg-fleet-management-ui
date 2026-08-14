import { curated } from '@lpg/mock-data'
import type {
  Organization as CuratedOrganization,
  Site as CuratedSite,
  Region,
} from '@lpg/types'

export type { OrgType } from '@lpg/types'

export type SiteStatus = 'UNASSIGNED' | 'ASSIGNED' | 'ACTIVE' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED'

export interface Organization {
  id: string
  name: string
  type: CuratedOrganization['type']
  status: SiteStatus
  region: Region
  city: string
  sites: number
  created_at: string
  updated_at: string
}

const CITY_BY_REGION: Record<Region, string> = {
  ADAMAOUA: 'Ngaoundéré',
  CENTRE: 'Yaoundé',
  EST: 'Bertoua',
  EXTREMENORD: 'Maroua',
  LITTORAL: 'Douala',
  NORD: 'Garoua',
  NORDOUEST: 'Bamenda',
  OUEST: 'Bafoussam',
  SUD: 'Ebolowa',
  SUDOUEST: 'Buéa',
}

function regionForOrg(orgId: string, idx: number): Region {
  const sites = curated.sites as CuratedSite[]
  const owningSite = sites.find((s) => s.org_id === orgId)
  if (owningSite) return owningSite.region
  const regions = curated.regions.map((r) => r.code as Region)
  return regions[idx % regions.length] ?? 'CENTRE'
}

export function getOrganizations(): Organization[] {
  const orgs = curated.organizations as CuratedOrganization[]
  return orgs.map((org, idx) => {
    const region = regionForOrg(org.id, idx)
    return {
      id: org.id,
      name: org.name,
      type: org.type,
      status: org.is_active ? 'ACTIVE' : 'SUSPENDED',
      region,
      city: CITY_BY_REGION[region] ?? '—',
      sites: org.operational_site_count ?? 0,
      created_at: org.created_at ?? '2026-01-01',
      updated_at: org.updated_at ?? '2026-01-01',
    }
  })
}

export const ORG_TYPE_LABELS: Record<CuratedOrganization['type'], string> = {
  REGULATEUR: 'Régulateur',
  DEPOT: 'Dépôt',
  MARKETEUR: 'Marketeur',
  TRANSPORTEUR: 'Transporteur',
  CLIENT: 'Client',
}

export function orgTypeLabel(type: CuratedOrganization['type']): string {
  return ORG_TYPE_LABELS[type]
}

export const ORG_STATUS_LABELS: Record<SiteStatus, string> = {
  UNASSIGNED: 'Non assigné',
  ASSIGNED: 'Assigné',
  ACTIVE: 'Actif',
  VERIFIED: 'Vérifié',
  SUSPENDED: 'Suspendu',
  REJECTED: 'Rejeté',
}

export function orgStatusLabel(status: SiteStatus): string {
  return ORG_STATUS_LABELS[status]
}