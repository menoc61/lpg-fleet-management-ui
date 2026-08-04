import { curated } from '@lpg/mock-data'

export const truckStatusLabels: Record<string, string> = {
  AVAILABLE: 'Disponible',
  IN_TRANSIT: 'En livraison',
  MAINTENANCE: 'Maintenance',
  INACTIVE: 'Inactif',
}

export function getTransporterTrucks(_orgId?: string) {
  return (curated.vehicles as any[]).slice(0, 8).map((v, idx) => ({
    id: v.id,
    plate_number: v.license_plate,
    type: v.type,
    status: 'AVAILABLE',
    last_ping: v.certificate_expiry_at ?? null,
  }))
}