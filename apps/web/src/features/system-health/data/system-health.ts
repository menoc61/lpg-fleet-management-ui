import { buildAnalytics } from '@lpg/mock-data'

export type ServiceStatus = 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL'

export interface SystemServiceHealth {
  id: string
  name: string
  kind: 'database' | 'storage' | 'api' | 'cache' | 'queue' | 'domain'
  status: ServiceStatus
  statusLabel: string
  detail: string
  /** Supplementary metrics shown on the expanded row (label → value). */
  metrics: Array<{ label: string; value: string }>
}

export interface SystemHealth {
  overall: ServiceStatus
  services: SystemServiceHealth[]
  operational: number
  degraded: number
  critical: number
  uptimePercent: number
  lastCheckAt: string
}

export const systemHealthLabels: Record<ServiceStatus, string> = {
  OPERATIONAL: 'Opérationnel',
  DEGRADED: 'Dégradé',
  CRITICAL: 'Critique',
}

function statusOf(ok: boolean, degraded = false): ServiceStatus {
  if (degraded) return 'DEGRADED'
  return ok ? 'OPERATIONAL' : 'DEGRADED'
}

export function getSystemHealth(): SystemHealth {
  const a = buildAnalytics()

  const services: SystemServiceHealth[] = [
    {
      id: 'api',
      name: 'API Gateway',
      kind: 'api',
      status: 'OPERATIONAL',
      statusLabel: systemHealthLabels.OPERATIONAL,
      detail: 'Points d’entrée REST et WebSocket',
      metrics: [
        { label: 'Requêtes/min', value: '1 284' },
        { label: 'Latence p95', value: '142 ms' },
        { label: 'Erreurs 5xx', value: '0.02%' },
      ],
    },
    {
      id: 'database',
      name: 'PostgreSQL',
      kind: 'database',
      status: 'OPERATIONAL',
      statusLabel: systemHealthLabels.OPERATIONAL,
      detail: 'Base de données relationnelle principale',
      metrics: [
        { label: 'Connexions', value: '38 / 100' },
        { label: 'Temps de réponse', value: '18 ms' },
        { label: 'Taille', value: '4.2 Go' },
      ],
    },
    {
      id: 'minio',
      name: 'MinIO (stockage objet)',
      kind: 'storage',
      status: 'OPERATIONAL',
      statusLabel: systemHealthLabels.OPERATIONAL,
      detail: 'Certificats, preuves et images S3-compatible',
      metrics: [
        { label: 'Buckets', value: '6' },
        { label: 'Objets', value: '12 480' },
        { label: 'Stockage utilisé', value: '38.1 Go' },
      ],
    },
    {
      id: 'redis',
      name: 'Redis (cache)',
      kind: 'cache',
      status: 'OPERATIONAL',
      statusLabel: systemHealthLabels.OPERATIONAL,
      detail: 'Cache applicatif et sessions',
      metrics: [
        { label: 'Hit rate', value: '94.2%' },
        { label: 'Mémoire', value: '212 Mo / 1 Go' },
        { label: 'Clés', value: '8 912' },
      ],
    },
    {
      id: 'queue',
      name: 'File de messages',
      kind: 'queue',
      status: 'OPERATIONAL',
      statusLabel: systemHealthLabels.OPERATIONAL,
      detail: 'Traitement asynchrone des rapports et risques',
      metrics: [
        { label: 'Messages en attente', value: '17' },
        { label: 'Traités/min', value: '64' },
        { label: 'Temps moyen', value: '1.9 s' },
      ],
    },
    {
      id: 'devices',
      name: 'Flotte & dispositifs',
      kind: 'domain',
      status: statusOf(a.devices.attention.length === 0, a.devices.attention.length > 0),
      statusLabel:
        a.devices.attention.length > 0 ? systemHealthLabels.DEGRADED : systemHealthLabels.OPERATIONAL,
      detail: `${a.devices.total} appareils · ${a.devices.attention.length} à surveiller`,
      metrics: [
        { label: 'Total', value: String(a.devices.total) },
        { label: 'À surveiller', value: String(a.devices.attention.length) },
        { label: 'En ligne', value: String(a.devices.byStatus['ONLINE'] ?? 0) },
      ],
    },
    {
      id: 'tours',
      name: 'Moteur de tournées',
      kind: 'domain',
      status: 'OPERATIONAL',
      statusLabel: systemHealthLabels.OPERATIONAL,
      detail: `${a.tours.total} tournées · ${a.tours.inFlight} en cours`,
      metrics: [
        { label: 'En cours', value: String(a.tours.inFlight) },
        { label: 'Planifiées', value: String(a.tours.planned) },
        { label: 'Total', value: String(a.tours.total) },
      ],
    },
    {
      id: 'reconciliation',
      name: 'Réconciliation',
      kind: 'domain',
      status: statusOf(a.reconciliations.totalGap === 0, a.reconciliations.totalGap > 0),
      statusLabel:
        a.reconciliations.totalGap > 0 ? systemHealthLabels.DEGRADED : systemHealthLabels.OPERATIONAL,
      detail: `${a.reconciliations.total} réconciliations · écart ${a.reconciliations.totalGap.toLocaleString('fr-FR')} TM`,
      metrics: [
        { label: 'Total', value: String(a.reconciliations.total) },
        { label: 'Écart', value: `${a.reconciliations.totalGap.toLocaleString('fr-FR')} TM` },
      ],
    },
  ]

  const critical = services.filter((s) => s.status === 'CRITICAL').length
  const degraded = services.filter((s) => s.status === 'DEGRADED').length
  const operational = services.filter((s) => s.status === 'OPERATIONAL').length
  const overall: ServiceStatus = critical > 0 ? 'CRITICAL' : degraded > 0 ? 'DEGRADED' : 'OPERATIONAL'

  return {
    overall,
    services,
    operational,
    degraded,
    critical,
    uptimePercent: 99.98,
    lastCheckAt: new Date().toISOString(),
  }
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
    uptimePercent: health.uptimePercent,
  }
}
