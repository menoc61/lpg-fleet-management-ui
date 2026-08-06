import * as React from 'react'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { getAllTours } from '../../trip-data'
import { TripDetails } from './trip-details'
import { TourList } from './trip-list'

export function SuiviTripsLayout() {
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [selectedTripId, setSelectedTripId] = React.useState<string | null>(null)
  
  const allTours = getAllTours()
  
  // Initialize with first tour if available
  React.useEffect(() => {
    if (!selectedTripId && allTours.length > 0) {
      setSelectedTripId(allTours[0]!.id)
    }
  }, [allTours, selectedTripId])

  const selectedTrip = allTours.find((tour) => tour.id === selectedTripId) ?? null

  function handleSelectTrip(tripId: string) {
    setSelectedTripId(tripId)

    // On mobile screens (< 1024px in this context, matching lg breakpoint), open the sheet
    if (window.innerWidth < 1024) {
      setDetailsOpen(true)
    }
  }

  return (
    <>
      <div
        className='grid flex-1 min-h-0 overflow-hidden lg:grid-cols-[400px_minmax(0,1fr)] lg:divide-x border-t'
      >
        <div className='h-full overflow-hidden bg-muted/10'>
          <TourList
            tours={allTours}
            selectedTripId={selectedTripId}
            onSelectTrip={handleSelectTrip}
          />
        </div>
        <div className='hidden h-full overflow-hidden lg:block bg-background'>
          <TripDetails trip={selectedTrip} />
        </div>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent
          side='right'
          className='w-full gap-0 p-0 sm:max-w-none md:w-3/4'
        >
          <SheetHeader className='sr-only'>
            <SheetTitle>{selectedTrip ? `Tournée ${selectedTrip.id}` : 'Détails de la tournée'}</SheetTitle>
            <SheetDescription>Détails de la tournée sélectionnée et suivi du trajet.</SheetDescription>
          </SheetHeader>
          <TripDetails trip={selectedTrip} />
        </SheetContent>
      </Sheet>
    </>
  )
}