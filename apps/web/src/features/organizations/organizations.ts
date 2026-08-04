import { curated } from '@lpg/mock-data'
import type { Organization as CuratedOrganization, OrgType } from '@lpg/types'

export type { OrgType }

export type SiteStatus = 'UNASSIGNED' | 'ASSIGNED' | 'ACTIVE' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED'

export interface Organization {
  id: string
  name: string
  type: OrgType
  status: SiteStatus
  region: string
  city: string
  sites: number
  created_at: string
  updated_at: string
}

const CITY_BY_REGION: Record<string, string> = {
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

export function getOrganizations(): Organization[] {
  return (curated.organizations as CuratedOrganization[]).map((org, idx) => {
    const regionCode = (org as any).region ?? curated.regions[idx % curated.regions.length]?.code ?? 'CENTRE'
    return {
      id: org.id,
      name: org.name,
      type: org.type,
      status: org.is_active ? 'ACTIVE' : 'SUSPENDED',
      region: regionCode,
      city: CITY_BY_REGION[regionCode] ?? '—',
      sites: org.operational_site_count ?? 0,
      created_at: org.created_at ?? '2026-01-01',
      updated_at: org.updated_at ?? '2026-01-01',
    }
  })
}

export function orgTypeLabel(type: OrgType): string {
  const labels: Record<OrgType, string> = {
    REGULATEUR: 'Régulateur',
    DEPOT: 'Dépôt',
    MARKETEUR: 'Marketeur',
    TRANSPORTEUR: 'Transporteur',
    CLIENT: 'Client',
  }
  return labels[type]
}

export function orgStatusLabel(status: SiteStatus): string {
  const labels: Record<SiteStatus, string> = {
    UNASSIGNED: 'Non assigné',
    ASSIGNED: 'Assigné',
    ACTIVE: 'Actif',
    VERIFIED: 'Vérifié',
    SUSPENDED: 'Suspendu',
    REJECTED: 'Rejeté',
  }
  return labels[status]
}