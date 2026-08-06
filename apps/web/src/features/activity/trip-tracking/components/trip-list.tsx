import { Search, SlidersHorizontal, Truck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Badge } from '@lpg/ui'

import type { TourWithDetails } from '../../trip-data'
import { getTourEta, getTourCargo, getTourVolume } from '../../trip-data'

const progressRingClasses: Record<TourWithDetails['status'], string> = {
  DRAFT: 'text-slate-400',
  PLANNED: 'text-blue-400',
  PENDINGTRANSPORTERACK: 'text-amber-500',
  ACKNOWLEDGED: 'text-blue-500',
  INPROGRESS: 'text-blue-500',
  CHECKPOINTACTIVE: 'text-amber-500',
  CLOSED: 'text-emerald-500',
  CANCELLED: 'text-rose-500',
}

function getProgressRingClass(status: TourWithDetails['status']) {
  return cn(
    'grid size-3 place-items-center rounded-full p-[0.5px] bg-[conic-gradient(currentColor_0deg_var(--angle),transparent_var(--angle)_360deg)]',
    progressRingClasses[status] ?? 'text-slate-400'
  )
}

type TourCardProps = {
  active?: boolean
  onSelectTrip: (id: TourWithDetails['id']) => void
  tour: TourWithDetails
}

type TourListProps = {
  onSelectTrip: (id: TourWithDetails['id']) => void
  selectedTripId: TourWithDetails['id'] | null
  tours: TourWithDetails[]
}

function TourCard({ tour, active, onSelectTrip }: TourCardProps) {
  const angle = (tour.progress / 100) * 360
  const executionModeLabel = tour.execution_mode === 'INTERNAL' ? 'Interne' : 'Externe'

  return (
    <button
      type='button'
      aria-pressed={active}
      onClick={(event) => {
        event.currentTarget.blur()
        onSelectTrip(tour.id)
      }}
      className={cn(
        'flex w-full flex-col gap-5 rounded-xl border p-3 text-left transition-colors',
        'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        active && 'border-primary bg-muted/50'
      )}
    >
      <div className='flex items-center justify-between'>
        <div className='font-medium'>{tour.id}</div>

        <div className='flex items-center gap-1'>
          <div
            style={{ '--angle': `${angle}deg` } as React.CSSProperties}
            className={getProgressRingClass(tour.status)}
          >
            <div className='grid size-2 place-items-center rounded-full bg-card'>
              <div className='size-1 rounded-full bg-current' />
            </div>
          </div>
          <div className='text-muted-foreground text-xs font-medium'>{tour.statusLabel}</div>
        </div>
      </div>

      <div className='flex items-center justify-between text-xs'>
        <Badge variant='outline' className='text-[10px]'>
          {executionModeLabel}
        </Badge>
        <Badge variant='outline' className='text-[10px]'>
          {tour.type === 'VRAC' ? 'Vrac' : 'Bouteilles 50 kg'}
        </Badge>
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          <div className='flex flex-col gap-0.5'>
            <div className='font-medium text-xs leading-none'>{tour.marketeur?.name ?? '—'}</div>
            <div className='text-muted-foreground text-xs'>{tour.transporter?.name ?? '—'}</div>
          </div>
        </div>

        <div className='flex items-center gap-1.5 text-right'>
          <div className='flex flex-col gap-0.5 text-right'>
            <div className='font-medium text-xs leading-none'>{tour.vehicle?.license_plate ?? '—'}</div>
            <div className='text-muted-foreground text-xs'>{tour.driver ? `${tour.driver.first_name} ${tour.driver.last_name}` : '—'}</div>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-0.5'>
        <span
          className='h-px min-w-0 border-foreground border-t border-dashed'
          style={{ flexGrow: tour.progress, flexBasis: 0 }}
        />
        <Truck className='size-4 text-primary' />
        <span
          className='h-px min-w-0 border-border border-t border-dashed'
          style={{ flexGrow: 100 - tour.progress, flexBasis: 0 }}
        />
      </div>

      <div className='flex items-center justify-between'>
        <div>
          <div className='text-muted-foreground text-xs leading-none'>Chargement</div>
          <div className='truncate text-sm tracking-tight font-medium'>
            {getTourCargo(tour)} - {getTourVolume(tour)}
          </div>
        </div>
        <div className='text-right'>
          <div className='text-muted-foreground text-xs leading-none'>Arrivée estimée</div>
          <div className='text-sm tabular-nums tracking-tight font-medium'>
            {getTourEta(tour)}
          </div>
        </div>
      </div>
    </button>
  )
}

export function TourList({ tours, selectedTripId, onSelectTrip }: TourListProps) {
  const statusCounts = tours.reduce(
    (acc, tour) => {
      acc[tour.status] = (acc[tour.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <Card className='flex h-full flex-col rounded-none border-l-0 border-y-0 shadow-none ring-0'>
      <CardHeader className='shrink-0 pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Tournées</CardTitle>
          <Button size='icon' variant='ghost' className='h-8 w-8'>
            <SlidersHorizontal className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-0'>
        <Tabs defaultValue='all' className='px-4'>
          <TabsList className='w-full'>
            <TabsTrigger className='flex-1 text-xs' value='all'>
              Toutes ({tours.length})
            </TabsTrigger>
            <TabsTrigger className='flex-1 text-xs' value='in-progress'>
              En cours ({statusCounts.INPROGRESS || 0})
            </TabsTrigger>
            <TabsTrigger className='flex-1 text-xs' value='checkpoint-active'>
              En livraison ({statusCounts.CHECKPOINTACTIVE || 0})
            </TabsTrigger>
            <TabsTrigger className='flex-1 text-xs' value='delivered'>
              Livrées ({statusCounts.CLOSED || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='px-4 relative'>
          <Search className='absolute left-6 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Rechercher une tournée, camion, ou client...' className='pl-9' />
        </div>

        <ScrollArea className='flex-1'>
          <div className='flex flex-col gap-3 px-4 pb-4'>
            {tours.map((tour) => (
              <TourCard
                active={tour.id === selectedTripId}
                key={tour.id}
                tour={tour}
                onSelectTrip={onSelectTrip}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}