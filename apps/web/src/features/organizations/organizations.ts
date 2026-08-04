export type OrgType = 'REGULATEUR' | 'DEPOT' | 'MARKETEUR' | 'TRANSPORTEUR' | 'CLIENT'
export type OrgStatus = 'active' | 'pending' | 'closed'

export type Organization = {
  id: string
  name: string
  type: OrgType
  status: OrgStatus
  region: string
  city: string
  sites: number
  createdAt: string
  updatedAt: string
}

const baseOrgs = [
  { name: 'CSPH Yaoundé', type: 'REGULATEUR' as OrgType, region: 'Centre', city: 'Yaoundé', sites: 3 },
  { name: 'SNH Littoral', type: 'REGULATEUR' as OrgType, region: 'Littoral', city: 'Douala', sites: 2 },
  { name: 'Dépôt Nord', type: 'DEPOT' as OrgType, region: 'Nord', city: 'Garoua', sites: 1 },
  { name: 'Dépôt Extrême-Nord', type: 'DEPOT' as OrgType, region: 'Extrême-Nord', city: 'Maroua', sites: 1 },
  { name: 'Dépôt Ouest', type: 'DEPOT' as OrgType, region: 'Ouest', city: 'Bafoussam', sites: 1 },
  { name: 'Marketeur Alpha', type: 'MARKETEUR' as OrgType, region: 'Centre', city: 'Yaoundé', sites: 8 },
  { name: 'Marketeur Beta', type: 'MARKETEUR' as OrgType, region: 'Littoral', city: 'Douala', sites: 12 },
  { name: 'Marketeur Gamma', type: 'MARKETEUR' as OrgType, region: 'Ouest', city: 'Bafoussam', sites: 6 },
  { name: 'Transporteur A', type: 'TRANSPORTEUR' as OrgType, region: 'Centre', city: 'Yaoundé', sites: 5 },
  { name: 'Transporteur B', type: 'TRANSPORTEUR' as OrgType, region: 'Littoral', city: 'Douala', sites: 7 },
  { name: 'Transporteur C', type: 'TRANSPORTEUR' as OrgType, region: 'Nord', city: 'Garoua', sites: 4 },
  { name: 'Client Industriel 1', type: 'CLIENT' as OrgType, region: 'Littoral', city: 'Douala', sites: 2 },
  { name: 'Client Industriel 2', type: 'CLIENT' as OrgType, region: 'Centre', city: 'Yaoundé', sites: 1 },
  { name: 'Client Commercial', type: 'CLIENT' as OrgType, region: 'Ouest', city: 'Bafoussam', sites: 3 },
]

const orgStatuses: OrgStatus[] = ['active', 'pending', 'closed']

export function getOrganizations(): Organization[] {
  return baseOrgs.map((o, idx) => ({
    id: `ORG-${String(idx + 1).padStart(3, '0')}`,
    name: o.name,
    type: o.type,
    status: orgStatuses[idx % orgStatuses.length],
    region: o.region,
    city: o.city,
    sites: o.sites,
    createdAt: new Date(2024, 0, 1 + idx).toISOString().slice(0, 10),
    updatedAt: new Date(2025, 5, 1 + idx).toISOString().slice(0, 10),
  }))
}

export function orgTypeLabel(type: OrgType): string {
  const labels: Record<OrgType, string> = {
    REGULATEUR: 'Regulator',
    DEPOT: 'Depot',
    MARKETEUR: 'Marketeur',
    TRANSPORTEUR: 'Transporteur',
    CLIENT: 'Client',
  }
  return labels[type]
}

export function orgStatusLabel(status: OrgStatus): string {
  const labels: Record<OrgStatus, string> = {
    active: 'Actif',
    pending: 'En attente',
    closed: 'Clôturé',
  }
  return labels[status]
}
