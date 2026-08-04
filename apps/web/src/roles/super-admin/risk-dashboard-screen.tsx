import { useMemo } from 'react'
import { ShieldAlert, TrendingUp, Users, Building2, Truck, MapPin } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { PageShell, KpiTile } from '@/components/layout/page'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@lpg/ui'
import { risk_scores } from '@lpg/mock-data'
import type { RiskScore, RiskEntityType, RiskLevel } from '@lpg/types'
import type { NameType, ValueType } from 'recharts/type/types'

const RISK_LEVEL_BG: Record<RiskLevel, string> = {
  FAIBLE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  MODERE: 'bg-amber-100 text-amber-700 dark:text-amber-300',
  ELEVE: 'bg-orange-100 text-orange-700 dark:text-orange-300',
  CRITIQUE: 'bg-rose-100 text-rose-700 dark:text-rose-300',
  CRITIQUEEXTREME: 'bg-red-100 text-red-700 dark:text-red-300',
}

const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  FAIBLE: 'Faible',
  MODERE: 'Modéré',
  ELEVE: 'Élevé',
  CRITIQUE: 'Critique',
  CRITIQUEEXTREME: 'Extrême',
}

const ENTITY_ICONS: Partial<Record<RiskEntityType, typeof Building2>> = {
  MARKETEUR: Building2,
  TRANSPORTEUR: Truck,
  LIVREUR: Users,
  SITE: MapPin,
  TOURNEE: TrendingUp,
}

const ENTITY_LABELS: Partial<Record<RiskEntityType, string>> = {
  MARKETEUR: 'Marketeur',
  TRANSPORTEUR: 'Transporteur',
  LIVREUR: 'Livreur',
  SITE: 'Site',
  TOURNEE: 'Tournée',
}

interface HistoryPoint {
  date: string
  Marketeurs: number
  Transporteurs: number
  Sites: number
  Livreurs: number
}

const HISTORY: readonly HistoryPoint[] = [
  { date: 'Jan', Marketeurs: 42, Transporteurs: 35, Sites: 28, Livreurs: 18 },
  { date: 'Fév', Marketeurs: 38, Transporteurs: 32, Sites: 30, Livreurs: 20 },
  { date: 'Mar', Marketeurs: 45, Transporteurs: 38, Sites: 25, Livreurs: 22 },
  { date: 'Avr', Marketeurs: 52, Transporteurs: 30, Sites: 32, Livreurs: 19 },
  { date: 'Mai', Marketeurs: 48, Transporteurs: 42, Sites: 35, Livreurs: 24 },
  { date: 'Juin', Marketeurs: 55, Transporteurs: 45, Sites: 38, Livreurs: 21 },
  { date: 'Juil', Marketeurs: 50, Transporteurs: 40, Sites: 33, Livreurs: 25 },
]

interface EntityBreakdown {
  entityType: RiskEntityType
  count: number
  avgScore: number
}

interface LegendStop {
  id: string
  color: string
}

const SERIES_LEGEND: readonly LegendStop[] = [
  { id: 'c1', color: '#3b82f6' },
  { id: 'c2', color: '#f59e0b' },
  { id: 'c3', color: '#10b981' },
  { id: 'c4', color: '#8b5cf6' },
]

function scoreColor(level: RiskLevel | undefined): string {
  if (!level) return '#10b981'
  if (level === 'CRITIQUE' || level === 'CRITIQUEEXTREME') return '#e11d48'
  if (level === 'ELEVE') return '#f59e0b'
  if (level === 'MODERE') return '#3b82f6'
  return '#10b981'
}

export function SuperAdminRiskDashboardScreen() {
  const scores = risk_scores as RiskScore[]

  const stats = useMemo(() => {
    const total = scores.length
    const critical = scores.filter((r) => r.level === 'CRITIQUE' || r.level === 'CRITIQUEEXTREME').length
    const avgScore = total === 0
      ? 0
      : Math.round(scores.reduce((s, r) => s + r.score, 0) / total)
    const trendUp = scores.filter((r) => r.level === 'CRITIQUE' || r.level === 'ELEVE').length > 3
    return { total, critical, avgScore, trendUp }
  }, [scores])

  const entityBreakdown: EntityBreakdown[] = useMemo(() => {
    const groups = new Map<RiskEntityType, { count: number; total: number }>()
    for (const r of scores) {
      const entry = groups.get(r.entity_type) ?? { count: 0, total: 0 }
      entry.count++
      entry.total += r.score
      groups.set(r.entity_type, entry)
    }
    return Array.from(groups, ([entityType, agg]) => ({
      entityType,
      count: agg.count,
      avgScore: Math.round(agg.total / agg.count),
    }))
  }, [scores])

  return (
    <PageShell>
      <div className='flex items-center gap-3'>
        <div className='flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'>
          <ShieldAlert className='size-5' />
        </div>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>Scores de Risque</h1>
          <p className='text-sm text-muted-foreground'>Évaluation continue par entité — Modèle v3, fenêtre glissante 30 jours</p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <KpiTile label='Entités surveillées' value={String(stats.total)} icon={<Building2 className='size-3.5' />} />
        <KpiTile
          label='Critiques'
          value={String(stats.critical)}
          delta={stats.critical > 0 ? `${stats.critical} actifs` : undefined}
          trend='down'
          icon={<ShieldAlert className='size-3.5 text-rose-500' />}
        />
        <KpiTile label='Score moyen' value={`${stats.avgScore}/100`} icon={<TrendingUp className='size-3.5' />} />
        <KpiTile label='Tendance' value={stats.trendUp ? '↑ Hausse' : '→ Stable'} icon={<TrendingUp className='size-3.5' />} />
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Évolution des scores (30 jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' aspect={16 / 9}>
              <AreaChart data={[...HISTORY]}>
                <defs>
                  {SERIES_LEGEND.map((c) => (
                    <linearGradient key={c.id} id={c.id} x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor={c.color} stopOpacity={0.3} />
                      <stop offset='95%' stopColor={c.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray='3 3' className='stroke-muted/40' />
                <XAxis dataKey='date' tick={{ fontSize: 12 }} className='text-muted-foreground' />
                <YAxis tick={{ fontSize: 12 }} className='text-muted-foreground' />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                />
                <Area type='monotone' dataKey='Marketeurs' stroke='#3b82f6' fill='url(#c1)' strokeWidth={2} />
                <Area type='monotone' dataKey='Transporteurs' stroke='#f59e0b' fill='url(#c2)' strokeWidth={2} />
                <Area type='monotone' dataKey='Sites' stroke='#10b981' fill='url(#c3)' strokeWidth={2} />
                <Area type='monotone' dataKey='Livreurs' stroke='#8b5cf6' fill='url(#c4)' strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Score moyen par type d&apos;entité</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' aspect={16 / 9}>
              <BarChart data={entityBreakdown}>
                <CartesianGrid strokeDasharray='3 3' className='stroke-muted/40' />
                <XAxis
                  dataKey='entityType'
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: string) => ENTITY_LABELS[value as RiskEntityType] ?? value}
                  className='text-muted-foreground'
                />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} className='text-muted-foreground' />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                  formatter={(value: ValueType, name: NameType): [string, string] => [
                    `${value ?? 0}/100`,
                    String(name ?? 'Score'),
                  ]}
                  labelFormatter={(label: string) => ENTITY_LABELS[label as RiskEntityType] ?? label}
                />
                <Bar dataKey='avgScore' radius={[6, 6, 0, 0]} fill='#3b82f6' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Détail des entités à risque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b text-left text-muted-foreground'>
                  <th className='pb-3 font-medium'>Entité</th>
                  <th className='pb-3 font-medium'>Type</th>
                  <th className='pb-3 font-medium'>Score</th>
                  <th className='pb-3 font-medium'>Niveau</th>
                  <th className='pb-3 font-medium'>Modèle</th>
                  <th className='pb-3 font-medium'>Période</th>
                  <th className='pb-3 font-medium'>Détails</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((r) => {
                  const EntityIcon = ENTITY_ICONS[r.entity_type] ?? Building2
                  return (
                    <tr key={r.id} className='border-b last:border-0 hover:bg-muted/30'>
                      <td className='py-3'>
                        <div className='flex items-center gap-2'>
                          <EntityIcon className='size-4 text-muted-foreground' />
                          <span className='font-medium'>{r.entity_id}</span>
                        </div>
                      </td>
                      <td className='py-3 text-muted-foreground'>
                        {ENTITY_LABELS[r.entity_type] ?? r.entity_type}
                      </td>
                      <td className='py-3'>
                        <div className='flex items-center gap-2'>
                          <div className='h-2 w-16 overflow-hidden rounded-full bg-muted'>
                            <div
                              className='h-full rounded-full transition-all'
                              style={{ width: `${r.score}%`, backgroundColor: scoreColor(r.level) }}
                            />
                          </div>
                          <span className='tabular-nums font-medium'>{r.score}/100</span>
                        </div>
                      </td>
                      <td className='py-3'>
                        <Badge
                          className={RISK_LEVEL_BG[r.level] ?? 'bg-muted text-muted-foreground'}
                          variant='secondary'
                        >
                          {RISK_LEVEL_LABELS[r.level] ?? r.level}
                        </Badge>
                      </td>
                      <td className='py-3 text-xs text-muted-foreground font-mono'>
                        {r.model_version}
                      </td>
                      <td className='py-3 text-xs text-muted-foreground'>
                        {r.period_start?.slice(0, 10)} → {r.period_end?.slice(0, 10)}
                      </td>
                      <td className='py-3 text-xs text-muted-foreground'>
                        {r.details_json
                          ? Object.entries(r.details_json).slice(0, 3).map(([k, v]) => (
                              <span key={k} className='mr-2 rounded bg-muted px-1.5 py-0.5'>
                                {k}: {String(v)}
                              </span>
                            ))
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}