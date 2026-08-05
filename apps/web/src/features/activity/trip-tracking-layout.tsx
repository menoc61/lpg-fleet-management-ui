import * as React from 'react'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@lpg/ui'
import { trips } from './trip-data'
import { TripDetails } from './trip-details'
import { TripList } from './trip-list'
import type { Trip } from './trip-data'

export function SuiviTripsLayout() {
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [selectedTripId, setSelectedTripId] = React.useState<string | null>(trips[0]?.id ?? null)
  
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? null

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
          <TripList
            trips={trips as Trip[]}
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
            <SheetTitle>{selectedTrip ? `TournǸe ${selectedTrip.id}` : 'DǸtails de la tournǸe'}</SheetTitle>
            <SheetDescription>DǸtails de la tournǸe sǸlectionnǸe et suivi du trajet.</SheetDescription>
          </SheetHeader>
          <TripDetails trip={selectedTrip} />
        </SheetContent>
      </Sheet>
    </>
  )
}