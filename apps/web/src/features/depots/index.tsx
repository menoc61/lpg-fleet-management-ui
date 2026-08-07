import { getRouteApi } from '@tanstack/react-router'
import { Warehouse } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCallback, useState } from 'react'
import { DepotsTable } from './components/depots-table'
import { DepotDetailsSheet } from './components/depot-details-sheet'
import { getDepots } from './data/depots'
import type { DepotView } from './data/depots'

const route = getRouteApi('/_authenticated/depots/')

export function DepotsPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [detailsDepot, setDetailsDepot] = useState<DepotView | null>(null)
  const depots = getDepots()

  const handleViewDetails = useCallback((depot: DepotView) => {
    setDetailsDepot(depot)
  }, [])

  return (
    <main
      id='main-content'
      className='flex-1 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
    >
      <section className='rounded-2xl border-transparent bg-background/88 p-3 shadow-sm backdrop-blur-sm sm:p-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Warehouse className='h-6 w-6 text-primary' />
          <h1 className='text-2xl font-bold tracking-tight'>Dépôts</h1>
          <Badge variant='outline' className='ml-auto'>
            {depots.length}
          </Badge>
        </div>
      </section>

      <section className='space-y-4 rounded-xl border-transparent bg-background/92 p-4 shadow-sm'>
        <DepotsTable
          data={depots}
          search={search}
          navigate={navigate}
          onViewDetails={handleViewDetails}
        />
      </section>

      <DepotDetailsSheet
        depot={detailsDepot}
        open={detailsDepot !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsDepot(null)
        }}
      />
    </main>
  )
}