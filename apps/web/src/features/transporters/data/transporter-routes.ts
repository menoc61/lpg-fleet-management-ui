import { curated } from '@lpg/mock-data'

export function getTransporterRoutes(_orgId?: string) {
  return (curated.delivery_tours as any[]).slice(0, 8).map((t, idx) => ({
    id: t.id,
    reference: t.id.slice(0, 8),
    origin: '—',
    destination: '—',
    status: t.status,
    started_at: t.started_at,
    closed_at: t.closed_at,
    type: t.type,
  }))
}