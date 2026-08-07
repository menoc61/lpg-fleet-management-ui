import { type ColumnDef } from '@tanstack/react-table'
import { Badge, DataTableColumnHeader } from '@lpg/ui'
import {
  type TourView,
  type TourneeStatus,
  type ExecutionMode,
  tourStatusLabels,
  executionModeLabels,
} from '../data/tours'

const STATUS_CLASS: Record<TourneeStatus, string> = {
  DRAFT: 'bg-slate-200 text-slate-800',
  PLANNED: 'bg-sky-100 text-sky-800',
  PENDINGTRANSPORTERACK: 'bg-amber-100 text-amber-900',
  ACKNOWLEDGED: 'bg-violet-100 text-violet-900',
  INPROGRESS: 'bg-blue-500 text-white',
  CHECKPOINTACTIVE: 'bg-orange-500 text-white',
  CLOSED: 'bg-emerald-600 text-white',
  CANCELLED: 'bg-rose-100 text-rose-900',
}

const MODE_CLASS: Record<ExecutionMode, string> = {
  INTERNAL: 'bg-slate-100 text-slate-700',
  EXTERNAL: 'bg-indigo-100 text-indigo-800',
}

export function getToursColumns({
  onOpenDetails,
}: {
  onOpenDetails: (row: TourView) => void
}): ColumnDef<TourView>[] {
  return [
    {
      accessorKey: 'reference',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Référence' />,
      cell: ({ row }) => (
        <button
          type='button'
          onClick={() => onOpenDetails(row.original)}
          className='font-medium text-primary underline-offset-4 hover:underline'
        >
          {row.original.reference}
        </button>
      ),
      enableHiding: false,
      meta: { label: 'Référence' },
    },
    {
      accessorKey: 'marketeur_name',
      header: 'Marketeur',
      cell: ({ row }) => row.original.marketeur_name,
      meta: { label: 'Marketeur' },
    },
    {
      accessorKey: 'execution_mode',
      header: 'Mode',
      cell: ({ row }) => (
        <Badge className={MODE_CLASS[row.original.execution_mode]}>
          {executionModeLabels[row.original.execution_mode]}
        </Badge>
      ),
      meta: { label: 'Mode' },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => row.original.cargo_label,
      meta: { label: 'Type' },
    },
    {
      accessorKey: 'transporter_name',
      header: 'Transporteur',
      cell: ({ row }) => row.original.transporter_name ?? '—',
      meta: { label: 'Transporteur' },
    },
    {
      accessorKey: 'vehicle_plate',
      header: 'Véhicule',
      cell: ({ row }) => row.original.vehicle_plate ?? '—',
      meta: { label: 'Véhicule' },
    },
    {
      accessorKey: 'quantity_label',
      header: 'Quantité',
      cell: ({ row }) => row.original.quantity_label,
      meta: { label: 'Quantité' },
    },
    {
      accessorKey: 'delivered_quantity',
      header: 'Livré',
      cell: ({ row }) =>
        row.original.delivered_quantity != null
          ? `${row.original.delivered_quantity} ${row.original.type === 'VRAC' ? 't' : 'btl'}`
          : '—',
      meta: { label: 'Livré' },
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge className={STATUS_CLASS[row.original.status]}>
          {tourStatusLabels[row.original.status]}
        </Badge>
      ),
      enableHiding: false,
      meta: { label: 'Statut' },
    },
  ]
}