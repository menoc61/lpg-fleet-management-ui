import { curated } from '@lpg/mock-data'
import type { Vehicle as CuratedVehicle, Region } from '@lpg/types'

export type TruckStatus = 'AVAILABLE' | 'IN_TRANSIT' | 'MAINTENANCE' | 'INACTIVE'

export type ContractTier = 'Starter' | 'Growth' | 'Enterprise'
export type TruckRiskLevel = 'low' | 'medium' | 'high'

export interface Truck {
  id: string
  plate_number: string
  type: 'VRAC' | 'BOUTEILLES50KG'
  status: TruckStatus
  make_model: string
  year: number
  certificate_expiry_at: string
  certificate_number: string
  org_id: string
  region: Region
  assigned_driver: string
  driver_phone: string
  fleet_manager: string
  operating_region: string
  current_location: string
  contract_tier: ContractTier
  risk_level: TruckRiskLevel
  marketer?: string
  tenant_name?: string
}

export interface TruckTelemetry {
  speed_kmh: number
  lpg_level_percent: number
  eta_text: string
  distance_km: number
  route_progress: number
  temperature_celsius: number
}

export const statusLabels: Record<TruckStatus, string> = {
  AVAILABLE: 'Disponible',
  IN_TRANSIT: 'En livraison',
  MAINTENANCE: 'Maintenance',
  INACTIVE: 'Inactif',
}

export const statusClasses: Record<TruckStatus, string> = {
  AVAILABLE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  IN_TRANSIT: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  MAINTENANCE: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  INACTIVE: 'bg-muted text-muted-foreground',
}

export const riskLabels: Record<TruckRiskLevel, string> = {
  low: 'Normal',
  medium: 'À surveiller',
  high: 'Critique',
}

export const riskClasses: Record<TruckRiskLevel, string> = {
  low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  high: 'bg-red-500/10 text-red-700 dark:text-red-300',
}

export const truckStatusOptions = [
  { label: 'Disponible', value: 'AVAILABLE' },
  { label: 'En livraison', value: 'IN_TRANSIT' },
  { label: 'Maintenance', value: 'MAINTENANCE' },
  { label: 'Inactif', value: 'INACTIVE' },
]

export const contractTierOptions = [
  { label: 'Starter', value: 'Starter' },
  { label: 'Growth', value: 'Growth' },
  { label: 'Enterprise', value: 'Enterprise' },
]

const STATUS_BY_INDEX: TruckStatus[] = ['AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE', 'INACTIVE']
const REGIONS: Region[] = ['CENTRE', 'LITTORAL', 'NORD', 'EXTREMENORD', 'OUEST', 'SUDOUEST', 'EST', 'ADAMAOUA']

export function getTrucks(): Truck[] {
  const vehicles = curated.vehicles as CuratedVehicle[]
  const drivers = curated.drivers
  const orgs = (curated.organizations as any[]).filter((o) => o.is_active)
  return vehicles.map((v, idx) => {
    const driver = drivers[idx % drivers.length]
    const status = STATUS_BY_INDEX[idx % STATUS_BY_INDEX.length]
    const region = REGIONS[idx % REGIONS.length]
    const org = orgs[idx % orgs.length]
    return {
      id: v.id,
      plate_number: v.license_plate,
      type: v.type,
      status,
      make_model: `${v.type} ${v.license_plate}`,
      year: 2020 + (idx % 5),
      certificate_expiry_at: v.certificate_expiry_at ?? '2027-06-30',
      certificate_number: v.certificate_number ?? `CERT-${v.id}`,
      org_id: v.org_id,
      region,
      assigned_driver: driver ? `${driver.first_name} ${driver.last_name}` : '—',
      driver_phone: '+237 6 XX XX XX XX',
      fleet_manager: '—',
      operating_region: region,
      current_location: '—',
      contract_tier: idx % 3 === 0 ? 'Enterprise' : idx % 3 === 1 ? 'Growth' : 'Starter',
      risk_level: idx % 4 === 0 ? 'high' : idx % 3 === 0 ? 'medium' : 'low',
      marketer: org?.name,
      tenant_name: org?.name,
    }
  })
}

export const trucks: Truck[] = getTrucks()

export const truckTenantOptions = (list: Truck[] = trucks) =>
  Array.from(new Set(list.map((truck) => truck.tenant_name ?? '').filter(Boolean))).map((tenant_name) => ({
    label: tenant_name,
    value: tenant_name,
  }))

export const truckMarketerOptions = (list: Truck[] = trucks) =>
  Array.from(new Set(list.map((truck) => truck.marketer ?? '').filter(Boolean))).map((marketer) => ({
    label: marketer,
    value: marketer,
  }))

export function getTruckById(id: string): Truck | undefined {
  return trucks.find((t) => t.id === id)
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

export function getTruckTelemetry(truckId: string): TruckTelemetry {
  const h = hashId(truckId)
  const inTransit = h % 5 !== 0
  return {
    speed_kmh: inTransit ? 60 + (h % 60) : 0,
    lpg_level_percent: 20 + (h % 70),
    eta_text: inTransit ? `${h % 3}h ${10 + (h % 50)}m` : '--',
    distance_km: inTransit ? 20 + (h % 160) : 0,
    route_progress: inTransit ? 10 + (h % 85) : 0,
    temperature_celsius: 25 + (h % 8),
  }
}