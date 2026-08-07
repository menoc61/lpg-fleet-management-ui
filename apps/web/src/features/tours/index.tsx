import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import { TourDetail } from './components/tour-detail'
import { ToursTable } from './components/tours-table'
import { getTours, type TourSlice, type TourView } from './data/tours'

const SLICE_TITLES: Record<TourSlice, string> = {
  ALL: 'Tournées de livraison',
  INTERNAL: 'Tournées internes',
  EXTERNAL: 'Tournées externalisées',
  PENDING: 'Tournées en attente d\'accusé',
  ACTIVE: 'Tournées actives',
  HISTORY: 'Historique tournées',
}

const SLICE_DESCRIPTIONS: Record<TourSlice, string> = {
  ALL: 'Flux 2 — livraisons créées par les marketeurs et exécutées en interne ou par un transporteur.',
  INTERNAL: 'Tournées exécutées par les propres moyens du marketeur (véhicule + conducteur + livreur).',
  EXTERNAL: 'Tournées externalisées — en attente d\'accusé ou accusées par un transporteur.',
  PENDING: 'Tournées envoyées au transporteur et en attente d\'accusé de réception.',
  ACTIVE: 'Tournées en transit ou en cours de livraison sur le terrain.',
  HISTORY: 'Tournées livrées ou annulées.',
}

export function ToursPage({ slice = 'ALL' }: { slice?: TourSlice }) {
  const [detail, setDetail] = useState<TourView | null>(null)

  const rows = useMemo(() => getTours(slice), [slice])

  return (
    <PageShell>
      <PageHeader
        title={SLICE_TITLES[slice]}
        description={SLICE_DESCRIPTIONS[slice]}
      />
      <SectionCard>
        <ToursTable rows={rows} onOpenDetails={setDetail} />
      </SectionCard>
      <TourDetail tour={detail} onClose={() => setDetail(null)} />
    </PageShell>
  )
}
