import { getRouteApi } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCallback, useState } from 'react'
import { ClientsTable } from './components/clients-table'
import { ClientDetailsSheet } from './components/client-details-sheet'
import { getClients } from './data/clients'
import type { ClientView } from './data/clients'

const route = getRouteApi('/_authenticated/clients/')

export function ClientsPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [detailsClient, setDetailsClient] = useState<ClientView | null>(null)
  const clients = getClients()

  const handleViewDetails = useCallback((client: ClientView) => {
    setDetailsClient(client)
  }, [])

  return (
    <main
      id='main-content'
      className='flex-1 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
    >
      <section className='rounded-2xl border-transparent bg-background/88 p-3 shadow-sm backdrop-blur-sm sm:p-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Users className='h-6 w-6 text-primary' />
          <h1 className='text-2xl font-bold tracking-tight'>Clients</h1>
          <Badge variant='outline' className='ml-auto'>
            {clients.length}
          </Badge>
        </div>
      </section>

      <section className='space-y-4 rounded-xl border-transparent bg-background/92 p-4 shadow-sm'>
        <ClientsTable
          data={clients}
          search={search}
          navigate={navigate}
          onViewDetails={handleViewDetails}
        />
      </section>

      <ClientDetailsSheet
        client={detailsClient}
        open={detailsClient !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsClient(null)
        }}
      />
    </main>
  )
}