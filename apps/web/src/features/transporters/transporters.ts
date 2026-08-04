import { curated } from '@lpg/mock-data'
import type { Organization as CuratedOrganization } from '@lpg/types'

export type TransporterStatus = 'active' | 'inactive'
export type TransporterAckStatus = 'pending' | 'acknowledged' | 'rejected'

export interface Transporter {
  id: string
  name: string
  status: TransporterStatus
  region: string
  contactEmail: string
  contactPhone: string
  fleetSize: number
  acknowledgementStatus: TransporterAckStatus
  acknowledgedAt: string | null
  vehicles: number
  drivers: number
}

export const transporterStatusOptions = [
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
]

export const ackStatusOptions = [
  { label: 'En attente', value: 'pending' },
  { label: 'Accusé', value: 'acknowledged' },
  { label: 'Rejeté', value: 'rejected' },
]

function regionFor(idx: number): string {
  const codes = curated.regions.map((r) => r.code as string)
  return codes[idx % codes.length] ?? codes[0]
}

export function getTransporters(): Transporter[] {
  const orgs = curated.organizations.filter((o) => o.type === 'TRANSPORTEUR' || o.type === 'MARKETEUR' || o.type === 'DEPOT')
  const list: Transporter[] = (orgs as CuratedOrganization[]).map((org, idx) => ({
    id: org.id,
    name: org.name,
    status: org.is_active ? 'active' : 'inactive',
    region: regionFor(idx),
    contactEmail: `${org.name.toLowerCase().split(/\s+/)[0] ?? 'contact'}@lpg.cm`,
    contactPhone: '+237 6 XX XX XX XX',
    fleetSize: org.vehicle_count ?? 0,
    acknowledgementStatus: idx % 3 === 0 ? 'pending' : idx % 3 === 1 ? 'acknowledged' : 'rejected',
    acknowledgedAt: org.updated_at ?? null,
    vehicles: org.vehicle_count ?? 0,
    drivers: org.driver_count ?? 0,
  }))
  if (list.length > 0) return list
  // Fallback so the screen still has rows if the curated set has no transporters
  return [
    { id: 'TRP-001', name: 'Transporteur A', status: 'active', region: 'CENTRE', contactEmail: 'a@lpg.cm', contactPhone: '+237 6 00 00 00 01', fleetSize: 8, acknowledgementStatus: 'acknowledged', acknowledgedAt: null, vehicles: 8, drivers: 12 },
    { id: 'TRP-002', name: 'Transporteur B', status: 'active', region: 'LITTORAL', contactEmail: 'b@lpg.cm', contactPhone: '+237 6 00 00 00 02', fleetSize: 5, acknowledgementStatus: 'pending', acknowledgedAt: null, vehicles: 5, drivers: 6 },
  ]
}

export const transporters: Transporter[] = getTransporters()

export function getTransporterById(id: string): Transporter | undefined {
  return transporters.find((t) => t.id === id)
}