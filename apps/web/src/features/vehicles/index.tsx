import { useCallback, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { CalendarDays, Gauge, Search, ShieldAlert, Truck as TruckIcon, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VehiclesTable } from './components/vehicles-table'
import { VehicleDetailsSheet } from './components/vehicle-details-sheet'
import {
  fleetVehicles,
  getVehiclesView,
  type VehicleView,
} from './data/vehicles'
import { activeTourForVehicle, vehicleActiveTourLink } from '@/features/tours/data/active-tour'

export { getVehiclesView }
export type { VehicleView as Vehicle }
export const vehicles: readonly VehicleView[] = fleetVehicles

type VehicleStatusFilter = 'all' | VehicleView['status']

type VehicleFilterDef = {
  label: string
  value: VehicleStatusFilter
  count: number
}

const statusFilterDefs: readonly {
  label: string
  value: VehicleView['status']
}[] = [
    { label: 'En cours', value: 'INPROGRESS' },
    { label: 'Disponible', value: 'AVAILABLE' },
    { label: 'Planifiee', value: 'PLANNED' },
    { label: 'Etape atteinte', value: 'CHECKPOINTACTIVE' },
    { label: 'Confirmee', value: 'ACKNOWLEDGED' },
    { label: 'Cloturee', value: 'CLOSED' },
    { label: 'Annulee', value: 'CANCELLED' },
  ]

const vehiclesRoute = getRouteApi('/_authenticated/vehicles/')

export function VehiclesPage() {
  const navigate = vehiclesRoute.useNavigate()
  const { q } = vehiclesRoute.useSearch()
  const [search, setSearch] = useState(q ?? '')
  const [statusFilter, setStatusFilter] = useState<VehicleStatusFilter>('all')
  const [detailsVehicle, setDetailsVehicle] = useState<VehicleView | null>(null)

  const handleViewDetails = useCallback((vehicle: VehicleView) => {
    setDetailsVehicle(vehicle)
  }, [])

  const handleOpenActiveTour = useCallback(
    (vehicleId: string) => {
      const link = vehicleActiveTourLink(vehicleId)
      if (!link) return
      const tour = activeTourForVehicle(vehicleId)
      if (!tour) return
      navigate({ to: '/tour-tracking/$tourId', params: { tourId: tour.id } })
    },
    [navigate],
  )

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return [...fleetVehicles]
    return fleetVehicles.filter((vehicle) => {
      const haystack = [
        vehicle.license_plate,
        vehicle.tenant_name,
        vehicle.assigned_driver,
        vehicle.region,
        vehicle.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [search])

  const visible =
    statusFilter === 'all'
      ? filteredVehicles
      : filteredVehicles.filter(
          (vehicle) => vehicle.status === statusFilter,
        )

  const filterDefs: VehicleFilterDef[] = useMemo(() => {
    const counts: Partial<Record<VehicleView['status'], number>> = {}
    for (const vehicle of fleetVehicles) {
      counts[vehicle.status] = (counts[vehicle.status] ?? 0) + 1
    }
    const statusDefs = statusFilterDefs.map((def) => ({
      ...def,
      count: counts[def.value] ?? 0,
    }))
    const sortedDefs = [...statusDefs].sort((a, b) => b.count - a.count)
    return [
      { label: 'Tous', value: 'all', count: fleetVehicles.length },
      ...sortedDefs,
    ]
  }, [])

  const dateText = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    []
  )

  const avgLpg = useMemo(() => {
    const list = visible.length > 0 ? visible : fleetVehicles
    if (list.length === 0) return 0
    const { sum, count } = list.reduce(
      (acc, vehicle) => {
        const max =
          vehicle.type === 'VRAC'
            ? vehicle.max_volume
            : vehicle.max_bottle_count
        if (!max || max <= 0) return acc
        const loaded = vehicle.loaded_quantity ?? 0
        const pct = Math.round((loaded / max) * 100)
        return { sum: acc.sum + pct, count: acc.count + 1 }
      },
      { sum: 0, count: 0 },
    )
    return count === 0 ? 0 : Math.round(sum / count)
  }, [visible])

  const activeCount = useMemo(
    () =>
      fleetVehicles.filter(
        (vehicle) =>
          vehicle.status === 'INPROGRESS' ||
          vehicle.status === 'CHECKPOINTACTIVE',
      ).length,
    []
  )

  const atRiskCount = useMemo(
    () =>
      fleetVehicles.filter(
        (vehicle) =>
          vehicle.risk_level === 'CRITIQUE' ||
          vehicle.risk_level === 'CRITIQUEEXTREME' ||
          vehicle.risk_level === 'ELEVE',
      ).length,
    []
  )

  return (
    <main
      id='main-content'
      className='flex-1 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
    >
      <section className='rounded-2xl border-transparent bg-background/88 p-3 shadow-sm backdrop-blur-sm sm:p-4'>
        <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
          <div className='flex flex-wrap items-center gap-2'>
            <TopStat
              icon={TruckIcon}
              label='Actifs'
              value={`${activeCount}/${fleetVehicles.length}`}
            />
            <TopStat
              icon={Users}
              label='Chauffeurs'
              value={`${fleetVehicles.filter((v) => v.assigned_driver !== '—').length}`}
              hint='Affectes au parc'
            />
            <TopStat icon={Gauge} label='LPG moyen' value={`${avgLpg}%`} />
            <TopStat icon={ShieldAlert} label='A surveiller' value={atRiskCount} />
          </div>

          <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
            <div className='relative w-full sm:w-[310px]'>
              <Search className='pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Rechercher plaque, entreprise, chauffeur…'
                className='h-9 ps-9'
              />
            </div>
          </div>
        </div>

        <div className='mt-4 flex flex-col gap-1'>
          <h1 className='text-[30px] leading-none font-semibold tracking-tight sm:text-3xl'>
            Flotte de vehicules
          </h1>
          <p className='inline-flex items-center gap-2 text-xs text-muted-foreground sm:text-sm'>
            <CalendarDays className='size-4' />
            {dateText}
          </p>
        </div>
      </section>

      <section className='rounded-2xl border-transparent bg-background/88 p-4 shadow-sm backdrop-blur-sm'>
        <div className='flex flex-wrap gap-2.5'>
          {filterDefs.map((filter) => (
            <FilterChip
              key={filter.value}
              label={filter.label}
              count={filter.count}
              active={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
            />
          ))}
        </div>
      </section>

      <section className='space-y-4 rounded-xl border-transparent bg-background/92 p-4 shadow-sm'>
        <div className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-xl font-semibold tracking-tight'>
              Liste des vehicules
            </h2>
            <p className='text-sm text-muted-foreground'>
              Selectionnez un vehicule pour voir sa fiche detaillee, son
              certificat et sa mission courante.
            </p>
          </div>
          <Badge
            variant='outline'
            className='border-transparent bg-muted/35 text-foreground'
          >
            {visible.length} / {fleetVehicles.length} vehicules
          </Badge>
        </div>
        <VehiclesTable
          data={[...visible]}
          search={{}}
          navigate={navigate}
          onViewDetails={handleViewDetails}
          onOpenActiveTour={handleOpenActiveTour}
        />
      </section>

      <VehicleDetailsSheet
        vehicle={detailsVehicle}
        open={detailsVehicle !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsVehicle(null)
        }}
      />
    </main>
  )
}

function TopStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div
      className='inline-flex items-center gap-1.5 rounded-full border-transparent bg-background/90 px-2.5 py-1 text-xs shadow-xs'
      title={hint}
    >
      <Icon className='size-3.5 text-primary' />
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-semibold'>{value}</span>
    </div>
  )
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <Button
      type='button'
      variant={active ? 'default' : 'outline'}
      size='sm'
      className={cn(
        'h-10 rounded-full px-4 text-sm shadow-xs',
        active
          ? 'border-transparent shadow-sm'
          : 'border-transparent bg-background/85 hover:bg-muted/35'
      )}
      onClick={onClick}
    >
      <span>{label}</span>
      <Badge
        className={cn(
          'ms-2 rounded-full px-1.5 py-0 text-[10px]',
          active
            ? 'bg-primary-foreground/20 text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {count}
      </Badge>
    </Button>
  )
}