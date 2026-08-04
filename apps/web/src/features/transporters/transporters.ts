import { curated } from '@lpg/mock-data'
import type { Organization as CuratedOrganization, Region } from '@lpg/types'

export type TransporterStatus = 'active' | 'inactive'
export type TransporterAckStatus = 'pending' | 'acknowledged' | 'rejected'

export interface Transporter {
  id: string
  name: string
  status: TransporterStatus
  region: Region
  contact_email: string
  contact_phone: string
  fleet_size: number
  acknowledgement_status: TransporterAckStatus
  acknowledged_at: string | null
  vehicles: number
  drivers: number
}

export interface TransporterOption {
  label: string
  value: TransporterStatus | TransporterAckStatus
}

export const transporterStatusOptions: readonly TransporterOption[] = [
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
]

export const ackStatusOptions: readonly TransporterOption[] = [
  { label: 'En attente', value: 'pending' },
  { label: 'Accusé', value: 'acknowledged' },
  { label: 'Rejeté', value: 'rejected' },
]

const FALLBACK_TRANSPORTERS: readonly Transporter[] = [
  {
    id: 'TRP-001',
    name: 'Transporteur A',
    status: 'active',
    region: 'CENTRE',
    contact_email: 'a@lpg.cm',
    contact_phone: '+237 6 00 00 00 01',
    fleet_size: 8,
    acknowledgement_status: 'acknowledged',
    acknowledged_at: null,
    vehicles: 8,
    drivers: 12,
  },
  {
    id: 'TRP-002',
    name: 'Transporteur B',
    status: 'active',
    region: 'LITTORAL',
    contact_email: 'b@lpg.cm',
    contact_phone: '+237 6 00 00 00 02',
    fleet_size: 5,
    acknowledgement_status: 'pending',
    acknowledged_at: null,
    vehicles: 5,
    drivers: 6,
  },
]

function regionFor(idx: number): Region {
  const codes = curated.regions.map((r) => r.code as Region)
  return codes[idx % codes.length] ?? codes[0] ?? 'CENTRE'
}

export function getTransporters(): readonly Transporter[] {
  const orgs = curated.organizations as CuratedOrganization[]
  const matches = orgs.filter(
    (o) => o.type === 'TRANSPORTEUR' || o.type === 'MARKETEUR' || o.type === 'DEPOT'
  )
  if (matches.length === 0) return FALLBACK_TRANSPORTERS

  return matches.map((org, idx) => ({
    id: org.id,
    name: org.name,
    status: org.is_active ? 'active' : 'inactive',
    region: regionFor(idx),
    contact_email: `${org.name.toLowerCase().split(/\s+/)[0] ?? 'contact'}@lpg.cm`,
    contact_phone: '+237 6 XX XX XX XX',
    fleet_size: org.vehicle_count ?? 0,
    acknowledgement_status: (idx % 3 === 0
      ? 'pending'
      : idx % 3 === 1
        ? 'acknowledged'
        : 'rejected') as TransporterAckStatus,
    acknowledged_at: org.updated_at ?? null,
    vehicles: org.vehicle_count ?? 0,
    drivers: org.driver_count ?? 0,
  }))
}

export const transporters: readonly Transporter[] = getTransporters()

export function getTransporterById(id: string): Transporter | undefined {
  return transporters.find((t) => t.id === id)
}