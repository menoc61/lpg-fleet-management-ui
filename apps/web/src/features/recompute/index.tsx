import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@lpg/ui'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import { getRiskScores, getRiskSummary } from '@/features/risks/data/risk-scores'

export function RecomputePage() {
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)
  const rows = useMemo(() => getRiskScores(), [])
  const summary = useMemo(() => getRiskSummary(rows), [rows])

  function handleRecompute() {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      setLastRun(new Date().toLocaleString('fr-FR'))
      toast.success('Recalcul des scores de risque terminé')
    }, 800)
  }

  return (
    <PageShell>
      <PageHeader
        title='Recompute manuel'
        description='Forcer le recalcul des scores de risque (modèle CSPH-RISK).'
      />
      <div className='grid gap-4 lg:grid-cols-[1fr_360px]'>
        <SectionCard title='Lancer un recalcul'>
          <p className='mb-4 text-sm text-muted-foreground'>
            Le recalcul est normalement déclenché automatiquement chaque nuit. Utilisez cette action
            pour forcer un recalcul immédiat après une correction de données.
          </p>
          <Button onClick={handleRecompute} disabled={running} className='gap-2'>
            {running ? <Loader2 className='size-4 animate-spin' /> : <RefreshCw className='size-4' />}
            {running ? 'Recalcul en cours...' : 'Recalculer maintenant'}
          </Button>
          {lastRun && (
            <p className='mt-4 text-xs text-muted-foreground'>Dernier recalcul : {lastRun}</p>
          )}
        </SectionCard>

        <SectionCard title='À jour du modèle'>
          <div className='space-y-1 text-sm'>
            <p className='flex justify-between'>
              <span className='text-muted-foreground'>Entités</span>
              <span className='font-medium'>{summary.total}</span>
            </p>
            <p className='flex justify-between'>
              <span className='text-muted-foreground'>Score moyen</span>
              <span className='font-medium'>{summary.average}</span>
            </p>
            <p className='flex justify-between'>
              <span className='text-muted-foreground'>Critiques</span>
              <span className='font-medium'>{summary.critique}</span>
            </p>
            <p className='flex justify-between'>
              <span className='text-muted-foreground'>Élevés</span>
              <span className='font-medium'>{summary.eleve}</span>
            </p>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}