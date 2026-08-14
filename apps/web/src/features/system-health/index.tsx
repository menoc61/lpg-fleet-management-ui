import { useMemo } from 'react'
import { HeartPulse } from 'lucide-react'
import { Badge } from '@lpg/ui'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { KpiTile, PageShell, SectionCard } from '@/components/layout/page'
import {
  getServiceHealthSummary,
  getSystemHealth,
  type SystemServiceHealth,
} from './data/system-health'

export function SystemHealthPage() {
  const health = useMemo(() => getSystemHealth(), [])
  const summary = useMemo(() => getServiceHealthSummary(), [])

  return (
    <PageShell>
      <PageHeader
        title='Santé système'
        description='État de fonctionnement des services de la plateforme.'
      />

      <div className='grid gap-4 sm:grid-cols-4'>
        <KpiTile label='État global' value={summary.overallLabel} />
        <KpiTile label='Services' value={String(summary.total)} />
        <KpiTile label='Opérationnels' value={String(summary.operational)} />
        <KpiTile label='À surveiller' value={String(summary.degraded + summary.critical)} />
      </div>

      <SectionCard title='Services' description='Vue consolidée de l’opérabilité de chaque composant.'>
        <div className='space-y-2'>
          {health.services.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
        </div>
      </SectionCard>
    </PageShell>
  )
}

function ServiceRow({ service }: { service: SystemServiceHealth }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3'>
      <div className='flex min-w-0 items-center gap-2'>
        <HeartPulse className='size-4 shrink-0 text-primary' />
        <div className='min-w-0'>
          <p className='text-sm font-medium'>{service.name}</p>
          <p className='truncate text-xs text-muted-foreground'>{service.detail}</p>
        </div>
      </div>
      <ServiceStatusBadge status={service.status} label={service.statusLabel} />
    </div>
  )
}

function ServiceStatusBadge({
  status,
  label,
}: {
  status: SystemServiceHealth['status']
  label: string
}) {
  return (
    <Badge
      variant={status === 'DEGRADED' ? 'secondary' : 'default'}
      className={cn(
        status === 'DEGRADED' && 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      )}
    >
      {label}
    </Badge>
  )
}