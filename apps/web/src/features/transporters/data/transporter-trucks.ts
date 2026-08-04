import { curated } from '@lpg/mock-data'
import type { Vehicle as CuratedVehicle } from '@lpg/types'

export const truckStatusLabels: Record<string, string> = {
  AVAILABLE: 'Disponible',
  IN_TRANSIT: 'En livraison',
  MAINTENANCE: 'Maintenance',
  INACTIVE: 'Inactif',
}

export interface TransporterTruckRow {
  id: string
  plate_number: string
  type: CuratedVehicle['type']
  status: string
  last_ping: string | null
}

export function getTransporterTrucks(_orgId?: string): TransporterTruckRow[] {
  const vehicles = curated.vehicles as CuratedVehicle[]
  return vehicles.slice(0, 8).map<TransporterTruckRow>((v) => ({
    id: v.id,
    plate_number: v.license_plate,
    type: v.type,
    status: 'AVAILABLE',
    last_ping: v.certificate_expiry_at ?? null,
  }))
}