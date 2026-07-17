import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Truck as TruckIcon } from 'lucide-react'
import { TransportersTable } from './transporters-table'
import { transportersHooks } from '@/lib/api/use-resources'
import { type Transporter } from './transporters'

const route = getRouteApi('/_authenticated/transporters/')

export function TransportersPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isPending, isError, error, refetch, isFetching } =
    transportersHooks.useList({ page: 1, limite: 50 })

  const handleViewDetails = (transporter: { id: string }) => {
    navigate({ to: `/transporters/${transporter.id}` })
  }

  return (
    <main
      id='main-content'
      className='flex-1 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
    >
      <div className='flex items-center gap-2 mb-4'>
        <TruckIcon className='h-6 w-6 text-primary' />
        <h1 className='text-2xl font-bold tracking-tight'>Transporters</h1>
        {isFetching ? (
          <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
        ) : null}
      </div>

      {isPending ? (
        <div className='flex items-center justify-center gap-2 py-16 text-muted-foreground'>
          <Loader2 className='h-5 w-5 animate-spin' />
          Chargement des transporteurs...
        </div>
      ) : isError ? (
        <div className='rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive'>
          <p>Impossible de charger les transporteurs.</p>
          <p className='mt-1 text-xs opacity-80'>{String(error?.message ?? '')}</p>
          <button
            type='button'
            onClick={() => refetch()}
            className='mt-2 rounded-md border border-destructive/40 px-2 py-1 text-xs hover:bg-destructive/10'
          >
            Reessayer
          </button>
        </div>
      ) : (
        <section className='rounded-2xl border-transparent bg-background/88 p-3 shadow-sm backdrop-blur-sm sm:p-4'>
          <TransportersTable
            data={(data?.data ?? []) as Transporter[]}
            search={search}
            navigate={navigate}
            onViewDetails={handleViewDetails}
          />
        </section>
      )}
    </main>
  )
}

