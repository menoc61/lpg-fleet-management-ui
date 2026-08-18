import { useMemo } from 'react'
import { ArrowDownRight, ArrowUpRight, Banknote, Scale, ScrollText, TrendingUp } from 'lucide-react'
import { Badge } from '@lpg/ui'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import {
  ChartCard,
  CompositionBar,
  StatusDistribution,
  chartConfigFrom,
  chartConfigFromRecord,
} from '@/components/charts'
import {
  getFinanceSummary,
  getFlaggedReconciliations,
  getMarketeurImpactRows,
  getRedressementStatusRows,
} from './data/finance'

const fmtTm = (v: number) => `${v.toLocaleString('fr-FR')} TM`

export function FinancePage() {
  const summary = useMemo(() => getFinanceSummary(), [])
  const statusRows = useMemo(() => getRedressementStatusRows(), [])
  const marketeurRows = useMemo(() => getMarketeurImpactRows(), [])
  const flagged = useMemo(() => getFlaggedReconciliations(), [])

  const statusData = statusRows.map((r) => ({ key: r.status, label: r.statusLabel, value: r.count }))
  const statusConfig = chartConfigFrom(statusRows.map((r) => ({ key: r.status, label: r.statusLabel })))

  const impactData = marketeurRows.map((r) => ({ label: r.marketeur, value: r.subsidyImpact }))
  const impactConfig = chartConfigFrom(
    marketeurRows.map((r) => ({ key: r.marketeur, label: r.marketeur })),
  )

  const gapCounts = marketeurRows.reduce<Record<string, number>>((acc, r) => {
    acc[r.marketeur] = r.volumeGap
    return acc
  }, {})

  return (
    <PageShell>
      <PageHeader
        title='Indicateurs financiers'
        description='Impact des écarts de volume sur les subventions et gestion des redressements.'
      />

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          icon={Banknote}
          label='Impact subventions'
          value={summary.subsidyImpactLabel}
          delta={summary.flaggedCount > 0 ? `+${summary.flaggedCount} écarts` : undefined}
          trend='down'
        />
        <MetricCard
          icon={Scale}
          label='Volume déclaré'
          value={summary.declaredVolumeLabel}
          delta={`écart ${summary.totalGapLabel}`}
        />
        <MetricCard
          icon={ScrollText}
          label='Redressements'
          value={String(summary.redressementCount)}
          delta={`${summary.collectedLabel} recouvrés`}
          trend='up'
        />
        <MetricCard
          icon={TrendingUp}
          label='Écart moyen'
          value={`${summary.gapPercentage.toFixed(1)}%`}
          delta={summary.outstandingLabel + ' à recouvrer'}
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <ChartCard
          title='Redressements par statut'
          description='Répartition des redressements émis, payés et annulés.'
          className='lg:col-span-1'
        >
          <StatusDistribution data={statusData} config={statusConfig} height={240} />
        </ChartCard>

        <ChartCard
          title='Impact subventions par marketeur'
          description='Subvention à recouvrer, agrégée par organisation.'
          className='lg:col-span-2'
        >
          <CompositionBar data={impactData} config={impactConfig} horizontal unit=' XAF' height={240} />
        </ChartCard>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <ChartCard
          title='Écart de volume par marketeur'
          description='Écart absolu déclaré vs tracé (TM).'
        >
          <CompositionBar
            data={marketeurRows.map((r) => ({ label: r.marketeur, value: r.volumeGap }))}
            config={chartConfigFromRecord(gapCounts, Object.fromEntries(marketeurRows.map((r) => [r.marketeur, r.marketeur])))}
            horizontal
            unit=' TM'
            height={220}
          />
        </ChartCard>

        <SectionCard
          title='Écarts au-dessus du seuil'
          description={`${flagged.length} réconciliation(s) dont l'écart dépasse la tolérance.`}
        >
          <div className='space-y-2'>
            {flagged.length === 0 ? (
              <p className='text-sm text-muted-foreground'>Aucun écart au-dessus du seuil.</p>
            ) : (
              flagged.map((r) => (
                <div key={r.id} className='flex items-center justify-between gap-2 rounded-lg border px-3 py-2'>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium'>{r.marketeur_name}</p>
                    <p className='font-mono text-xs text-muted-foreground'>{r.reference}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm tabular-nums'>{fmtTm(Math.abs(r.volume_gap))}</span>
                    <Badge variant='outline' className='font-mono text-xs'>
                      {r.gap_percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
  trend,
}: {
  icon: React.ElementType
  label: string
  value: string
  delta?: string
  trend?: 'up' | 'down'
}) {
  return (
    <div className='surface-card group relative overflow-hidden p-5 transition-shadow hover:shadow-md'>
      <div className='absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg bg-muted/60'>
        <Icon className='size-4 text-primary' />
      </div>
      <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>{label}</p>
      <p className='mt-2 text-3xl font-bold tracking-tight'>{value}</p>
      {delta && (
        <div className='mt-2 flex items-center gap-1.5 text-xs'>
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold',
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : trend === 'down'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {trend === 'up' ? <ArrowUpRight className='size-3' /> : trend === 'down' ? <ArrowDownRight className='size-3' /> : null}
            {delta}
          </span>
        </div>
      )}
    </div>
  )
}
