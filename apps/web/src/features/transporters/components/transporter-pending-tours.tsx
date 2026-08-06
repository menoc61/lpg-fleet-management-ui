import { useState, useMemo } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from '@lpg/ui'
import type { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { getToursForTransporter } from '../data/transporter-tours'
import type { TransporterTourWithDetails } from '../data/transporter-tours'
import { Input } from '@/components/ui/input'

function getDriverName(tour: TransporterTourWithDetails): string {
  if (!tour.driver) return '—'
  const firstName = tour.driver.first_name?.trim() ?? ''
  const lastName = tour.driver.last_name?.trim() ?? ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || '—'
}

function PendingToursColumns(
  onViewDetails: (tour: TransporterTourWithDetails) => void
): ColumnDef<TransporterTourWithDetails>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID Tournée',
      cell: ({ row }) => (
        <span className='font-mono text-xs'>{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'marketeur',
      header: 'Marketeur',
      cell: ({ row }) => (
        <div className='font-medium text-sm'>{row.original.marketeur?.name ?? '—'}</div>
      ),
    },
    {
      accessorKey: 'driver',
      header: 'Chauffeur',
      cell: ({ row }) => (
        <div className='font-medium text-sm'>{getDriverName(row.original)}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className='text-sm'>{row.original.type === 'VRAC' ? 'Vrac' : 'Bouteilles 50 kg'}</span>
      ),
    },
    {
      accessorKey: 'execution_mode',
      header: 'Mode',
      cell: ({ row }) => (
        <span className='text-sm capitalize'>{row.original.execution_mode === 'INTERNAL' ? 'Interne' : 'Externe'}</span>
      ),
    },
    {
      accessorKey: 'requested_quantity',
      header: 'Volume',
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.requested_quantity} {row.original.type === 'VRAC' ? 't' : 'btl'}</span>
      ),
    },
    {
      accessorKey: 'vehicle',
      header: 'Camion',
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.vehicle?.license_plate ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <span className='inline-flex items-center gap-1'>
            <span className={cn(
              'size-1.5 rounded-full',
              status === 'CLOSED' ? 'bg-emerald-500' :
              status === 'INPROGRESS' || status === 'CHECKPOINTACTIVE' ? 'bg-blue-500' :
              status === 'PENDINGTRANSPORTERACK' ? 'bg-amber-500' :
              status === 'CANCELLED' ? 'bg-rose-500' : 'bg-slate-400'
            )} />
            <span className='text-xs font-medium'>{row.original.statusLabel}</span>
          </span>
        )
      },
    },
    {
      accessorKey: 'started_at',
      header: 'Démarré le',
      cell: ({ row }) => (
        <span className='text-sm'>
          {row.original.started_at ? format(new Date(row.original.started_at), 'dd/MM/yyyy HH:mm') : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => onViewDetails(row.original)}
          className='text-primary hover:underline text-sm'
        >
          Voir détails
        </button>
      ),
    },
  ]
}

export function TransporterPendingTours({ transporter }: { transporter: { id: string; name: string } }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('PENDINGTRANSPORTERACK')

  const allTours = useMemo(() => getToursForTransporter(transporter.id), [transporter.id])

  // Filter only pending acknowledgment tours
  const pendingTours = useMemo(() => {
    return allTours.filter((tour) => tour.status === 'PENDINGTRANSPORTERACK')
  }, [allTours])

  const filteredTours = useMemo(() => {
    let result = pendingTours

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((tour) =>
        tour.id.toLowerCase().includes(q) ||
        tour.marketeur?.name?.toLowerCase().includes(q) ||
        tour.vehicle?.license_plate?.toLowerCase().includes(q) ||
        tour.driver?.first_name?.toLowerCase().includes(q) ||
        tour.driver?.last_name?.toLowerCase().includes(q)
      )
    }

    return result
  }, [pendingTours, search])

  const handleViewDetails = (tour: TransporterTourWithDetails) => {
    // Navigate to tour details
    console.log('View tour details', tour)
  }

  const pendingCount = pendingTours.length

  return (
    <div className='space-y-4'>
      {/* Header with title and search */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg'>
            <span className='text-amber-600 dark:text-amber-400 text-lg'>⏳</span>
          </div>
          <div>
            <h2 className='text-xl font-bold'>En attente d'accusé</h2>
            <p className='text-sm text-muted-foreground'>{pendingCount} tournée{pendingCount > 1 ? 's' : ''} en attente d'accusé de réception</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
          <div className='relative flex-1 min-w-0'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Rechercher ID, marketeur, chauffeur, camion...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20'
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label='Effacer la recherche'
              >
                <X className='size-4' />
              </button>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <Filter className='size-4 text-muted-foreground' />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='px-3 py-2 text-sm bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20'
            >
              <option value='PENDINGTRANSPORTERACK'>En attente d'accusé</option>
              <option value='all'>Tous les statuts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className='p-0'>
          <DataTable
            data={filteredTours}
            columns={PendingToursColumns(handleViewDetails)}
            search={{ placeholder: '', searchKey: 'q' }}
          />
        </CardContent>
      </Card>

        {filteredTours.length === 0 && (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='text-4xl mb-3'>📋</div>
            <h3 className='text-lg font-medium'>Aucune tournée trouvée</h3>
            <p className='text-muted-foreground'>
              {search ? 'Aucun résultat pour votre recherche' : 'Aucune tournée en attente d\'accusé pour ce transporteur'}
            </p>
            {search && (
              <Button variant='outline' onClick={() => setSearch('')} className='mt-3'>
                <X className='mr-2 size-4' />
                Effacer la recherche
              </Button>
            )}
          </div>
        )}
      </div>
  )
}