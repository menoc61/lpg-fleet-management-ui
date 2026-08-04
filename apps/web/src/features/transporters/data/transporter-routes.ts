import { curated } from '@lpg/mock-data'
import type { DeliveryTour as CuratedDeliveryTour, TourneeStatus } from '@lpg/types'

export interface TransporterRouteRow {
  id: string
  reference: string
  origin: string
  destination: string
  status: TourneeStatus
  started_at: string | null
  closed_at: string | null
  type: CuratedDeliveryTour['type']
}

export function getTransporterRoutes(_orgId?: string): TransporterRouteRow[] {
  return (curated.delivery_tours as CuratedDeliveryTour[]).slice(0, 8).map<TransporterRouteRow>((t) => ({
    id: t.id,
    reference: t.id.slice(0, 8),
    origin: '—',
    destination: '—',
    status: t.status,
    started_at: t.started_at ?? null,
    closed_at: t.closed_at ?? null,
    type: t.type,
  }))
}