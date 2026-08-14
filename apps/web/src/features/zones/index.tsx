import { getRouteApi } from '@tanstack/react-router'
import { MapPinned } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCallback, useState } from 'react'
import { ZonesTable } from './components/zones-table'
import { ZoneDetailsSheet } from './components/zone-details-sheet'
import { getZones } from './data/zones'
import type { ZoneView } from './data/zones'

const route = getRouteApi('/_authenticated/zones/')

export function ZonesPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [detailsZone, setDetailsZone] = useState<ZoneView | null>(null)
  const zones = getZones()

  const handleViewDetails = useCallback((zone: ZoneView) => {
    setDetailsZone(zone)
  }, [])

  return (
    <main
      id='main-content'
      className='flex-1 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
    >
      <section className='rounded-2xl border-transparent bg-background/88 p-3 shadow-sm backdrop-blur-sm sm:p-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <MapPinned className='h-6 w-6 text-primary' />
          <h1 className='text-2xl font-bold tracking-tight'>Zones</h1>
          <Badge variant='outline' className='ml-auto'>
            {zones.length}
          </Badge>
        </div>
      </section>

      <section className='space-y-4 rounded-xl border-transparent bg-background/92 p-4 shadow-sm'>
        <ZonesTable
          data={zones}
          search={search}
          navigate={navigate}
          onViewDetails={handleViewDetails}
        />
      </section>

      <ZoneDetailsSheet
        zone={detailsZone}
        open={detailsZone !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsZone(null)
        }}
      />
    </main>
  )
}