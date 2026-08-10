import { useNavigate } from '@tanstack/react-router'
import { PageShell } from '@/components/layout/page'
import { PageHeader } from '@/components/layout/page-header'
import { SectionCard } from '@/components/layout/page'
import { TourActiveHeader } from '../components/tour-active-header'
import { ToursTable } from '../components/tours-table'
import { useFollowUp } from './use-follow-up'

export function FollowUpPage() {
  const { tours } = useFollowUp()
  const navigate = useNavigate()
  const selectedTrip = tours[0]
  const selectedTripId = selectedTrip?.id

  function openDetail(id: string) {
    navigate({ to: '/tour-tracking/$tourId', params: { tourId: id } })
  }

  return (
    <PageShell>
      <PageHeader
        title='Suivi des tournées'
        description='Tournées sous responsabilité de votre rôle.'
      />
      {selectedTrip && (
        <TourActiveHeader
          trip={selectedTrip}
          trips={tours}
          onSelectTrip={(id) => navigate({
            to: '/tour-tracking/$tourId',
            params: { tourId: id },
          })}
        />
      )}
      <SectionCard>
        <ToursTable
          rows={tours}
          selectedTripId={selectedTripId}
          onOpenDetails={(row) => openDetail(row.id)}
        />
      </SectionCard>
    </PageShell>
  )
}
