import { curated } from '@lpg/mock-data'
import type { Vehicle as CuratedVehicle } from '@lpg/types'

export const truckStatusLabels: Record<string, string> = {
  AVAILABLE: 'Disponible',
  IN_TRANSIT: 'En livraison',
  MAINTENANCE: 'Maintenance',
  INACTIVE: 'Inactif',
}

export function getTransporterTrucks(_orgId?: string): CuratedVehicle[] {
  const vehicles = curated.vehicles as CuratedVehicle[]
  return vehicles.slice(0, 8)
}