import { useMemo } from 'react'
import { FileBarChart, FileDown } from 'lucide-react'
import { Badge } from '@lpg/ui'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { KpiTile, PageShell, SectionCard } from '@/components/layout/page'
import {
  formatFileSize,
  getReportSummary,
  getReports,
  type ReportView,
} from './data/reports'

export function ReportsPage() {
  const reports = useMemo(() => getReports(), [])
  const summary = useMemo(() => getReportSummary(), [])

  return (
    <PageShell>
      <PageHeader
        title='Rapports & exports'
        description='Rapports prêts à l’export avec leur statut de génération.'
      />

      <div className='grid gap-4 sm:grid-cols-4'>
        <KpiTile label='Rapports' value={String(summary.total)} />
        <KpiTile label='Prêts' value={String(summary.ready)} />
        <KpiTile label='En cours' value={String(summary.pending)} />
        <KpiTile label='Échecs' value={String(summary.failed)} />
      </div>

      <SectionCard title='Rapports générés' description='Derniers rapports demandés et leur disponibilité.'>
        <div className='space-y-2'>
          {reports.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </div>
      </SectionCard>
    </PageShell>
  )
}

function ReportRow({ report }: { report: ReportView }) {
  const ready = report.status === 'READY'
  return (
    <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3'>
      <div className='flex min-w-0 items-center gap-2'>
        <FileBarChart className='size-4 shrink-0 text-primary' />
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>{report.name}</p>
          <p className='truncate text-xs text-muted-foreground'>
            {report.typeLabel} / {report.format}
            {report.generatedBy && <> / {report.generatedBy}</>}
          </p>
        </div>
      </div>
      <div className='flex flex-wrap items-center gap-1.5'>
        {report.generatedAt && (
          <span className='text-xs text-muted-foreground'>{report.generatedAt.slice(0, 10)}</span>
        )}
        {report.fileSize != null && <span className='text-xs text-muted-foreground'>{formatFileSize(report.fileSize)}</span>}
        <ReportStatusBadge ready={ready} label={report.statusLabel} />
        {ready && <FileDown className='size-4 text-emerald-600' />}
      </div>
    </div>
  )
}

function ReportStatusBadge({ ready, label }: { ready: boolean; label: string }) {
  return (
    <Badge
      variant={ready ? 'default' : 'secondary'}
      className={cn(!ready && 'text-muted-foreground')}
    >
      {label}
    </Badge>
  )
}