import { format } from 'date-fns'
import { Badge } from '@lpg/ui'
import type { ColumnDef } from '@tanstack/react-table'
import type { PickupRequest } from '@lpg/types'
import { pickupStatusOptions } from '../../data/pickups'

export const pickupsColumns = (
  onViewDetails: (pickup: PickupRequest & { source_site?: any; destination_site?: any }) => void
): ColumnDef<PickupRequest & { source_site?: any; destination_site?: any }>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className='font-mono text-xs'>{row.original.id}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.original.status
      const option = pickupStatusOptions.find((o) => o.value === status)
      return (
        <Badge variant={status === 'COMPLETED' ? 'default' : status === 'INPROGRESS' ? 'secondary' : 'outline'}>
          {option?.label ?? status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'source_site',
    header: 'Site source',
    cell: ({ row }) => (
      <div>
        <div className='font-medium text-sm'>{row.original.source_site?.name ?? '—'}</div>
        <div className='text-xs text-muted-foreground'>{row.original.source_site?.id ?? ''}</div>
      </div>
    ),
  },
  {
    accessorKey: 'destination_site',
    header: 'Site destination',
    cell: ({ row }) => (
      <div>
        <div className='font-medium text-sm'>{row.original.destination_site?.name ?? '—'}</div>
        <div className='text-xs text-muted-foreground'>{row.original.destination_site?.id ?? ''}</div>
      </div>
    ),
  },
  {
    accessorKey: 'requested_quantity',
    header: 'Quantité demandée',
    cell: ({ row }) => (
      <span className='font-mono text-sm'>{row.original.requested_quantity}</span>
    ),
  },
  {
    accessorKey: 'approved_quantity',
    header: 'Quantité approuvée',
    cell: ({ row }) => (
      <span className='font-mono text-sm'>
        {row.original.approved_quantity ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Créé le',
    cell: ({ row }) => (
      <span className='text-sm'>
        {row.original.created_at ? format(new Date(row.original.created_at), 'dd/MM/yyyy HH:mm') : '—'}
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