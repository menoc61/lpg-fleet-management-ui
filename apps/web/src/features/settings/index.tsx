import { useMemo } from 'react'
import { Lock, RotateCcw } from 'lucide-react'
import { Badge } from '@lpg/ui'
import { PageHeader } from '@/components/layout/page-header'
import { KpiTile, PageShell, SectionCard } from '@/components/layout/page'
import { getSettingsByCategory, getSettingSummary } from './data/settings'
import type { SettingView } from './data/settings'

export function SettingsPage() {
  const summary = useMemo(() => getSettingSummary(), [])
  const grouped = useMemo(() => getSettingsByCategory(), [])

  return (
    <PageShell>
      <PageHeader
        title='Paramètres globaux'
        description='Règles métier pilotées par configuration (source unique : table settings).'
      />

      <div className='grid gap-4 sm:grid-cols-3'>
        <KpiTile label='Paramètres' value={String(summary.total)} />
        <KpiTile label='Catégories' value={String(summary.categories)} />
        <KpiTile label='Chiffrés' value={String(summary.encrypted)} />
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        {Object.entries(grouped).map(([category, rows]) => (
          <SectionCard key={category} title={category} description={`${rows.length} paramètres`}>
            <div className='space-y-2'>
              {rows.map((row) => (
                <SettingRow key={row.key} setting={row} />
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </PageShell>
  )
}

function SettingRow({ setting }: { setting: SettingView }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2'>
      <div className='min-w-0'>
        <p className='font-mono text-xs font-medium'>{setting.key}</p>
        {setting.description && (
          <p className='truncate text-xs text-muted-foreground'>{setting.description}</p>
        )}
      </div>
      <div className='flex items-center gap-1.5'>
        {setting.isEncrypted ? (
          <Badge variant='secondary'>
            <Lock className='size-3' />
          </Badge>
        ) : (
          <span className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>{setting.value}</span>
        )}
        <Badge variant='outline' className='text-[10px]'>
          {setting.valueType}
        </Badge>
        {setting.requiresRestart && (
          <Badge variant='destructive'>
            <RotateCcw className='mr-1 size-3' /> Redémarrage requis
          </Badge>
        )}
      </div>
    </div>
  )
}