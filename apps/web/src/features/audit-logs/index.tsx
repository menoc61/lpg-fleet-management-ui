import { useMemo } from 'react'
import { ScrollText, ShieldAlert } from 'lucide-react'
import { Badge } from '@lpg/ui'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { KpiTile, PageShell, SectionCard } from '@/components/layout/page'
import { getAuditLogs, getAuditSummary, type AuditLogView } from './data/audit-logs'

export function AuditLogsPage() {
  const summary = useMemo(() => getAuditSummary(), [])
  const logs = useMemo(() => getAuditLogs(), [])

  return (
    <PageShell>
      <PageHeader
        title='Journal d’audit'
        description='Traçabilité des actions sensibles sur l’ensemble de la plateforme.'
      />

      <div className='grid gap-4 sm:grid-cols-3'>
        <KpiTile label='Événements' value={String(summary.total)} />
        <KpiTile label='Permissions refusées' value={String(summary.denied)} />
        <KpiTile label='Risque élevé' value={String(summary.highRisk)} />
      </div>

      <SectionCard title='Événements' description='Actions enregistrées, de la plus récente à la plus ancienne.'>
        <div className='space-y-2'>
          {logs.map((log) => (
            <AuditLogRow key={log.id} log={log} />
          ))}
        </div>
      </SectionCard>
    </PageShell>
  )
}

function AuditLogRow({ log }: { log: AuditLogView }) {
  const denied = log.action === 'PERMISSIONDENIED'
  return (
    <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3'>
      <div className='flex min-w-0 items-center gap-2'>
        {denied ? <ShieldAlert className='size-4 shrink-0 text-amber-500' /> : <ScrollText className='size-4 shrink-0 text-primary' />}
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>{log.actionLabel}</p>
          <p className='truncate text-xs text-muted-foreground'>
            {log.actor}
            {log.resourceTable ? ` / ${log.resourceTable}` : ''}
            {log.resourceId ? ` / ${log.resourceId}` : ''}
          </p>
        </div>
      </div>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='text-xs text-muted-foreground'>{log.createdAt.slice(0, 10)}</span>
        {log.ipAddress && <span className='font-mono text-xs text-muted-foreground'>{log.ipAddress}</span>}
        <Badge
          variant={denied ? 'destructive' : 'secondary'}
          className={cn(!denied && 'text-muted-foreground')}
        >
          {log.action}
        </Badge>
      </div>
    </div>
  )
}