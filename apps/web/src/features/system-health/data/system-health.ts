import { buildAnalytics } from '@lpg/mock-data'

export interface SystemServiceHealth {
  id: string
  name: string
  status: 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL'
  statusLabel: string
  detail: string
}

export interface SystemHealth {
  overall: 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL'
  services: SystemServiceHealth[]
  operational: number
  degraded: number
  critical: number
}

export const systemHealthLabels: Record<'OPERATIONAL' | 'DEGRADED' | 'CRITICAL', string> = {
  OPERATIONAL: 'Opérationnel',
  DEGRADED: 'Dégradé',
  CRITICAL: 'Critique',
}

function toService(
  id: string,
  name: string,
  ok: boolean,
  detail: string,
): SystemServiceHealth {
  return {
    id,
    name,
    status: ok ? 'OPERATIONAL' : 'DEGRADED',
    statusLabel: ok ? systemHealthLabels.OPERATIONAL : systemHealthLabels.DEGRADED,
    detail,
  }
}

export function getSystemHealth(): SystemHealth {
  const a = buildAnalytics()
  const services: SystemServiceHealth[] = [
    toService('tours', 'Moteur de tournées', a.tours.inFlight >= 0, `${a.tours.total} tournées`),
    toService('devices', 'Flotte & dispositifs', a.devices.attention.length === 0, `${a.devices.total} appareils`),
    toService('scans', 'Réception des scans', a.scans.conflicts === 0, `${a.scans.total} scans`),
    toService('anomalies', 'Détection d’anomalies', a.anomalies.open === 0, `${a.anomalies.open} ouvertes`),
    toService('reconciliation', 'Réconciliation', a.reconciliations.totalGap === 0, `${a.reconciliations.totalGap} TM écart`),
  ]

  const critical = services.filter((s) => s.status === 'CRITICAL').length
  const degraded = services.filter((s) => s.status === 'DEGRADED').length
  const operational = services.filter((s) => s.status === 'OPERATIONAL').length
  const overall = critical > 0 ? 'CRITICAL' : degraded > 0 ? 'DEGRADED' : 'OPERATIONAL'

  return { overall, services, operational, degraded, critical }
}

export function getServiceHealthSummary() {
  const health = getSystemHealth()
  return {
    total: health.services.length,
    operational: health.operational,
    degraded: health.degraded,
    critical: health.critical,
    overall: health.overall,
    overallLabel: systemHealthLabels[health.overall],
  }
}