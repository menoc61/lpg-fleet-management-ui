import { useCallback, useMemo, useState } from 'react'
import { CalendarDays, Clock3, Gauge, Search, Truck as TruckIcon, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrucksMap } from './components/trucks-map'
import { TrucksTable } from './components/trucks-table'
import { TruckDetailsSheet } from './components/truck-details-sheet'
import {
  getTruckTelemetry as _getTruckTelemetry,
  trucks as trucksList,
  type Truck,
  type TruckStatus,
} from '../trucks'

export const getTruckTelemetry = _getTruckTelemetry
export const trucks: readonly Truck[] = trucksList
export type { Truck, TruckStatus }

type TruckFilter = 'all' | TruckStatus

type TruckFilterDef = { label: string; value: TruckFilter; count: number }

const STATUS_LABELS: Record<TruckStatus, string> = {
  AVAILABLE: 'Disponible',
  IN_TRANSIT: 'En livraison',
  MAINTENANCE: 'Maintenance',
  INACTIVE: 'Inactif',
}

export function TrucksPage() {
  const navigate = useNavigateSafe()
  const { resolvedTheme } = useTheme()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TruckFilter>('all')
  const [detailsTruck, setDetailsTruck] = useState<Truck | null>(null)
  const [activeTruckId] = useState<string>(trucks[0]?.id ?? '')

  const handleViewDetails = useCallback((truck: Truck) => {
    setDetailsTruck(truck)
  }, [])

  const filteredTrucks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return [...trucks]
    return trucks.filter((truck) => {
      const haystack = [
        truck.plate_number,
        truck.assigned_driver,
        truck.region,
        truck.org_id,
        truck.tenant_name ?? truck.marketer ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [search])

  const visible = statusFilter === 'all' ? filteredTrucks : filteredTrucks.filter((t) => t.status === statusFilter)

  const filterDefs: TruckFilterDef[] = useMemo(() => {
    const counts: Record<TruckFilter, number> = {
      all: trucks.length,
      AVAILABLE: trucks.filter((t) => t.status === 'AVAILABLE').length,
      IN_TRANSIT: trucks.filter((t) => t.status === 'IN_TRANSIT').length,
      MAINTENANCE: trucks.filter((t) => t.status === 'MAINTENANCE').length,
      INACTIVE: trucks.filter((t) => t.status === 'INACTIVE').length,
    }
    return [
      { label: 'Tous', value: 'all', count: counts.all },
      { label: STATUS_LABELS.AVAILABLE, value: 'AVAILABLE', count: counts.AVAILABLE },
      { label: STATUS_LABELS.IN_TRANSIT, value: 'IN_TRANSIT', count: counts.IN_TRANSIT },
      { label: STATUS_LABELS.MAINTENANCE, value: 'MAINTENANCE', count: counts.MAINTENANCE },
      { label: STATUS_LABELS.INACTIVE, value: 'INACTIVE', count: counts.INACTIVE },
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
    const list = visible.length > 0 ? visible : trucks
    if (list.length === 0) return 0
    const sum = list.reduce((acc, truck) => acc + getTruckTelemetry(truck.id).lpg_level_percent, 0)
    return Math.round(sum / list.length)
  }, [visible])

  const selectedTruck =
    visible.find((t) => t.id === activeTruckId) ?? visible[0] ?? trucks[0]
  const mapTheme = resolvedTheme === 'dark' ? 'dark' : 'light'

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
              value={`${trucks.filter((t) => t.status === 'IN_TRANSIT').length}/${trucks.length}`}
            />
            <TopStat
              icon={Users}
              label='Chauffeurs'
              value={`${trucks.length * 2}`}
              hint='Estimation basée sur le parc'
            />
            <TopStat icon={Gauge} label='LPG moyen' value={`${avgLpg}%`} />
            <TopStat icon={Clock3} label='Ponctualité' value="94%" hint="Objectif SLA" />
          </div>

          <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
            <div className='relative w-full sm:w-[310px]'>
              <Search className='pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Rechercher un camion, plaque, chauffeur…'
                className='h-9 ps-9'
              />
            </div>
          </div>
        </div>

        <div className='mt-4 flex flex-col gap-1'>
          <h1 className='text-[30px] leading-none font-semibold tracking-tight sm:text-3xl'>
            Dashboard Opérationnel
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

      {selectedTruck ? (
        <section className='relative overflow-hidden rounded-2xl border-transparent bg-muted/70 shadow-sm'>
          <TrucksMap
            sites={[]}
            trucks={visible}
            selectedTruck={selectedTruck}
            mapTheme={mapTheme}
            showRoutes
            onSelectTruck={() => {}}
          />
        </section>
      ) : null}

      <section className='space-y-4 rounded-xl border-transparent bg-background/92 p-4 shadow-sm'>
        <div className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-xl font-semibold tracking-tight'>Liste des camions</h2>
            <p className='text-sm text-muted-foreground'>
              Sélectionnez un camion pour voir sa fiche détaillée, son contrat et
              ses affectations chauffeur/livreur.
            </p>
          </div>
          <Badge
            variant='outline'
            className='border-transparent bg-muted/35 text-foreground'
          >
            {visible.length} / {trucks.length} camions
          </Badge>
        </div>
        <TrucksTable
          data={[...visible]}
          search={{}}
          navigate={navigate}
          onViewDetails={handleViewDetails}
        />
      </section>

      <TruckDetailsSheet
        truck={detailsTruck}
        open={detailsTruck !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsTruck(null)
        }}
      />
    </main>
  )
}

/* Lightweight stub for the legacy `useNavigate` call site — the table
 * accepts a NavigateFn-shaped callable; we pass a no-op that does the right
 * thing in URL-bar-driven development. Concrete behaviour (deep linking
 * etc.) is implemented in the DataTable itself. */
function useNavigateSafe(): (to: string) => void {
  return (to: string) => {
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', to)
      } catch {
        // navigation is best-effort — keep this hook SSR-safe
      }
    }
  }
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