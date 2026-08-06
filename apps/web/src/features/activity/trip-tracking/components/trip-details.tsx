import { Copy, Truck, Phone, MapPin, User, Package } from 'lucide-react'

import { Avatar, AvatarFallback, Badge, Button, cn, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@lpg/ui'

import type { TourWithDetails } from '../../trip-data'
import { TripRouteMap } from './trip-route-map'
import { format } from 'date-fns'
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

function EmptyTripOverview() {
  return (
    <div className='grid min-h-[12rem] place-items-center rounded-lg border border-dashed text-muted-foreground text-sm'>
      Séléctionnez une tournée pour voir les détails.
    </div>
  )
}

function TourOverview({ tour }: { tour: TourWithDetails }) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
        <div className='flex items-center gap-2'>
          <h1 className='font-medium text-lg tabular-nums tracking-tight sm:text-xl'>{tour.id}</h1>
          <Button variant='ghost' size='icon' className='h-8 w-8' aria-label='Copier ID'>
            <Copy className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex items-center gap-2 text-xs sm:text-sm'>
          <Badge variant='outline' className={cn('gap-1.5')}>
            <span className={cn('size-1.5 rounded-full bg-current', progressRingClasses[tour.status] ?? 'text-slate-400')} />
            {tour.statusLabel}
          </Badge>
          <span className='text-muted-foreground'>|</span>
          <span className='text-foreground tabular-nums'>{tour.progress}% complété</span>
          <span className='text-muted-foreground'>|</span>
          <span className='text-foreground tabular-nums'>
            ETA: {getTourEta(tour)}
          </span>
        </div>
      </div>

      <Separator />

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10'>
            <AvatarFallback className='rounded-md bg-primary/10 text-primary font-bold'>
              {tour.driver?.first_name?.charAt(0).toUpperCase() ?? '—'}
            </AvatarFallback>
          </Avatar>

          <div className='flex flex-col'>
            <div className='font-medium text-sm'>{tour.driver ? `${tour.driver.first_name} ${tour.driver.last_name}` : '—'}</div>
            <div className='text-muted-foreground text-xs'>Chauffeur</div>
          </div>
        </div>

        <div className='flex flex-col items-end gap-1'>
          <Badge variant='secondary' className='gap-1'>
            <Truck className='h-3 w-3' />
            {tour.vehicle?.license_plate ?? '—'}
          </Badge>
        </div>
      </div>

      <Separator />

      <div className='flex flex-col gap-6'>
        <div className='flex items-start justify-between gap-4'>
          <h2 className='font-medium'>Détails du transport</h2>
          <Button variant='outline' size='sm' className='gap-2'>
            <Phone className='h-4 w-4' />
            Appeler Chauffeur
          </Button>
        </div>

        <div className='grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4'>
          <div className='flex flex-col gap-1.5'>
            <div className='text-muted-foreground text-xs flex items-center gap-1'>
              <Package className='h-3 w-3' />
              Marchandise
            </div>
            <div className='text-sm font-medium flex items-center gap-2'>
              <Truck className='h-4 w-4 text-muted-foreground' />
              {getTourCargo(tour)}
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <div className='text-muted-foreground text-xs flex items-center gap-1'>
              <Package className='h-3 w-3' />
              Volume / Quantité
            </div>
            <div className='text-sm font-medium'>{getTourVolume(tour)}</div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <div className='text-muted-foreground text-xs flex items-center gap-1'>
              <Truck className='h-3 w-3' />
              Camion assigné
            </div>
            <div className='text-sm font-medium flex items-center gap-2'>
              <Truck className='h-4 w-4 text-muted-foreground' />
              {tour.vehicle?.license_plate ?? '—'}
            </div>
          </div>

          <div className='flex flex-col gap-1.5 md:text-right'>
            <div className='text-muted-foreground text-xs flex items-center gap-1'>
              <User className='h-3 w-3' />
              Chauffeur
            </div>
            <div className='text-sm font-medium'>{tour.driver ? `${tour.driver.first_name} ${tour.driver.last_name}` : '—'}</div>
          </div>
        </div>
      </div>

      {/* Execution mode & checkpoints */}
      <Separator />
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <Badge variant={tour.execution_mode === 'INTERNAL' ? 'default' : 'secondary'} className='gap-1'>
            <Truck className='h-3 w-3' />
            {tour.execution_mode === 'INTERNAL' ? 'Interne' : 'Externe'}
          </Badge>
          <span className='text-muted-foreground text-sm'>Mode d'exécution</span>
        </div>

        {tour.checkpoints && tour.checkpoints.length > 0 && (
          <div className='space-y-3'>
            <h3 className='font-medium text-sm flex items-center gap-2'>
              <MapPin className='h-4 w-4' />
              Points de passage ({tour.checkpoints.length})
            </h3>
            <div className='space-y-2'>
              {tour.checkpoints!.map((cp, idx) => (
                <div
                  key={cp.id}
                  className='flex items-center gap-3 p-3 rounded-lg bg-muted/30'
                >
                  <div className='flex flex-col items-center w-8'>
                    <div className='w-1.5 h-1.5 rounded-full bg-primary' />
                    {idx < tour.checkpoints!.length - 1 && (
                      <div className='mt-1 h-full w-0.5 bg-muted-foreground/30' />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-sm'>{cp.site?.name ?? cp.client_site?.name ?? 'Site inconnu'}</div>
                    <div className='text-xs text-muted-foreground'>
                      {cp.site ? `Site: ${cp.site.id}` : `Client: ${cp.client_site?.id ?? '—'}`}
                    </div>
                  </div>
                  <div className='text-right text-sm'>
                    <div className='font-medium'>{cp.sequence}</div>
                    <div className='text-xs text-muted-foreground'>
                      {cp.actual_arrival
                        ? `Arrivé: ${format(new Date(cp.actual_arrival), 'dd/MM HH:mm')}`
                        : cp.expected_arrival
                        ? `Prévu: ${format(new Date(cp.expected_arrival), 'dd/MM HH:mm')}`
                        : '—'}
                    </div>
                    <Badge
                      variant={
                        cp.status === 'COMPLETED' ? 'default' :
                        cp.status === 'REACHED' ? 'secondary' :
                        cp.status === 'PENDING' ? 'outline' : 'destructive'
                      }
                    >
                      {cp.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function TripDetails({ trip }: { trip: TourWithDetails | null }) {
  if (!trip) {
    return (
      <div className='flex h-full min-h-0 flex-col overflow-hidden'>
        <div className='h-[40vh] min-h-[200px] shrink-0 overflow-hidden border-b lg:h-[420px]'>
          <TripRouteMap tour={null} />
        </div>
        <div className='min-h-0 flex-1 overflow-auto p-4 sm:p-6'>
          <EmptyTripOverview />
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-full min-h-0 flex-col overflow-hidden'>
      <div className='h-[40vh] min-h-[200px] shrink-0 overflow-hidden border-b lg:h-[420px]'>
        <TripRouteMap tour={trip} />
      </div>
      <div className='min-h-0 flex-1 overflow-hidden'>
        <div className='h-full min-h-0'>
          <Tabs defaultValue='overview' className='flex h-full flex-col'>
            <TabsList
              className='w-full justify-start gap-4 rounded-none border-b bg-transparent px-4 py-0 sm:px-6'
            >
              <TabsTrigger
                value='overview'
                className='rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-2 py-3 data-[state=active]:border-primary data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:text-foreground text-muted-foreground hover:text-foreground'
              >
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger
                value='documents'
                className='rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-2 py-3 data-[state=active]:border-primary data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:text-foreground text-muted-foreground hover:text-foreground'
              >
                Documents & BL
              </TabsTrigger>
              <TabsTrigger
                value='activity'
                className='rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-2 py-3 data-[state=active]:border-primary data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:text-foreground text-muted-foreground hover:text-foreground'
              >
                Journal d'activité
              </TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='m-0 p-4 sm:p-6'>
              <TourOverview tour={trip} />
            </TabsContent>
            <TabsContent value='documents' className='m-0 p-4 sm:p-6'>
              <div className='grid min-h-[12rem] place-items-center rounded-lg border border-dashed text-muted-foreground text-sm'>
                Gestion des Bons de Livraison et documents à venir.
              </div>
            </TabsContent>
            <TabsContent value='activity' className='m-0 p-4 sm:p-6'>
              <div className='grid min-h-[12rem] place-items-center rounded-lg border border-dashed text-muted-foreground text-sm'>
                Historique des événements du trajet à venir.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Import helpers
// getTourEta, getTourCargo, getTourVolume imported at top