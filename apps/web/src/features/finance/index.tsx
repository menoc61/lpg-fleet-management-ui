import { useMemo } from 'react'
import { ScrollText } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { KpiTile, PageShell, SectionCard } from '@/components/layout/page'
import { getFinanceSummary, getRedressementStatusRows } from './data/finance'

export function FinancePage() {
  const summary = useMemo(() => getFinanceSummary(), [])
  const statusRows = useMemo(() => getRedressementStatusRows(), [])

  return (
    <PageShell>
      <PageHeader
        title='Indicateurs financiers'
        description='Impact des écarts sur les subventions et gestion des redressements.'
      />

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <KpiTile label='Impact subventions' value={summary.subsidyImpactLabel} />
        <KpiTile label='Volume déclaré' value={summary.declaredVolumeLabel} />
        <KpiTile label='Redressements' value={String(summary.redressementCount)} />
        <KpiTile label='Écart moyen' value={`${summary.gapPercentage.toFixed(1)}%`} />
      </div>

      <SectionCard
        title='Redressements'
        description='Répartition des redressements par statut.'
      >
        <div className='grid gap-3 sm:grid-cols-3'>
          {statusRows.map((row) => (
            <div key={row.status} className='rounded-lg border p-4'>
              <div className='flex items-center gap-2 text-sm font-medium'>
                <ScrollText className='size-4 text-primary' />
                {row.statusLabel}
              </div>
              <div className='mt-2 text-2xl font-semibold'>{row.count}</div>
              <div className='text-xs text-muted-foreground'>{row.totalLabel}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  )
}