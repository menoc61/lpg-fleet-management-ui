import { useState } from 'react'
import { PageShell } from '@/components/layout/page'
import { PageHeader } from '@/components/layout/page-header'
import { SectionCard } from '@/components/layout/page'
import { ToursTable } from '../components/tours-table'
import { TourDetailView } from '../components/tour-detail-view'
import { useFollowUp } from './use-follow-up'

export function FollowUpPage() {
  const { tours } = useFollowUp()
  const [selectedId, setSelectedId] = useState<string | undefined>(tours[0]?.id)
  const selectedTrip = tours.find((t) => t.id === selectedId) ?? tours[0] ?? null

  return (
    <PageShell>
      <PageHeader
        title='Suivi des tournées'
        description='Tournées sous responsabilité de votre rôle.'
      />
      <SectionCard>
        <ToursTable rows={tours} onOpenDetails={(row) => setSelectedId(row.id)} />
      </SectionCard>
      {selectedTrip && (
        <TourDetailView
          trip={selectedTrip}
          trips={tours}
          onSelectTrip={(id) => setSelectedId(id)}
        />
      )}
    </PageShell>
  )
}
