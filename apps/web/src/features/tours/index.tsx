import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import { TourActiveHeader } from './components/tour-active-header'
import { ToursTable } from './components/tours-table'
import type { TourSlice } from './data/tour-activity'
import { getTourActivity } from './data/tour-activity'

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
  const navigate = useNavigate()
  const tours = getTourActivity(slice)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const selectedTrip = tours.find((t) => t.id === selectedId) ?? tours[0]

  function openDetail(id: string) {
    navigate({ to: '/tour-tracking/$tourId', params: { tourId: id } })
  }

  return (
    <PageShell>
      <PageHeader
        title={SLICE_TITLES[slice]}
        description={SLICE_DESCRIPTIONS[slice]}
      />
      {selectedTrip && (
        <TourActiveHeader
          trip={selectedTrip}
          trips={tours}
          onSelectTrip={(id) => setSelectedId(id)}
        />
      )}
      <SectionCard>
        <ToursTable
          rows={tours}
          selectedTripId={selectedTrip?.id}
          onOpenDetails={(row) => openDetail(row.id)}
        />
      </SectionCard>
    </PageShell>
  )
}
