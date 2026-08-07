import { useCallback, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Main } from '@/components/layout/main'
import {
  getDriverById,
  getDriversView,
  drivers,
  type Driver,
  type DriverView,
} from './data/drivers'
import { DriversTable } from './components/drivers-table'
import { DriverDetailsSheet } from './components/driver-details-sheet'

export { getDriverById, getDriversView, drivers }
export type { Driver, DriverView }

export function buildDriverOrgOptions(drivers: readonly DriverView[]) {
  return Array.from(new Set(drivers.map((driver) => driver.org_name))).map(
    (org_name) => ({
      label: org_name,
      value: org_name,
    })
  )
}

export function DriversPage() {
  const drivers = useMemo(() => getDriversView(), [])
  const [search, setSearch] = useState('')
  const [detailsDriver, setDetailsDriver] = useState<DriverView | null>(null)

  const handleViewDetails = useCallback((driver: DriverView) => {
    setDetailsDriver(driver)
  }, [])

  const orgOptions = useMemo(() => buildDriverOrgOptions(drivers), [drivers])

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return drivers
    return drivers.filter((driver) =>
      [
        driver.full_name,
        driver.first_name,
        driver.last_name,
        driver.license_number,
        driver.org_name,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [search, drivers])

  return (
    <Main className='space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'>
      <section className='rounded-2xl border-transparent bg-background/88 p-4 shadow-sm backdrop-blur-sm'>
        <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
          <div className='flex flex-wrap items-center gap-2'>
            <TopStat
              label='Actifs'
              value={`${drivers.filter((d) => d.is_active).length}/${drivers.length}`}
            />
            <TopStat label='Entreprises' value={String(orgOptions.length)} />
          </div>

          <div className='relative w-full sm:w-[310px]'>
            <Search className='pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Rechercher un chauffeur, permis, entreprise…'
              className='h-9 ps-9'
            />
          </div>
        </div>

        <div className='mt-4 space-y-1'>
          <h1 className='text-[30px] leading-none font-semibold tracking-tight sm:text-3xl'>
            Chauffeurs / Vaitiers
          </h1>
          <p className='text-sm text-muted-foreground'>
            Registre de la flotte des chauffeurs et vaitiers GPL.
          </p>
        </div>
      </section>

      <section className='space-y-4 rounded-xl border-transparent bg-background/92 p-4 shadow-sm'>
        <div className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-xl font-semibold tracking-tight'>
              Liste des chauffeurs
            </h2>
            <p className='text-sm text-muted-foreground'>
              Selectionnez un chauffeur pour voir sa fiche detaillee.
            </p>
          </div>
          <Badge
            variant='outline'
            className='border-transparent bg-muted/35 text-foreground'
          >
            {filteredDrivers.length} / {drivers.length} chauffeurs
          </Badge>
        </div>
        <DriversTable
          data={filteredDrivers}
          orgOptions={orgOptions}
          onViewDetails={handleViewDetails}
        />
      </section>

      <DriverDetailsSheet
        driver={detailsDriver}
        open={detailsDriver !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsDriver(null)
        }}
      />
    </Main>
  )
}

function TopStat({ label, value }: { label: string; value: string }) {
  return (
    <div className='inline-flex items-center gap-1.5 rounded-full border-transparent bg-background/90 px-2.5 py-1 text-xs shadow-xs'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-semibold'>{value}</span>
    </div>
  )
}