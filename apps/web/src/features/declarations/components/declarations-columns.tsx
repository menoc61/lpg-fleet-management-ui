import { type ColumnDef } from '@tanstack/react-table'
import { Badge, DataTableColumnHeader } from '@lpg/ui'
import {
  type DeclarationView,
  type DeclarationStatus,
  declarationStatusLabels,
} from '../data/declarations'

const STATUS_CLASS: Record<DeclarationStatus, string> = {
  DRAFT: 'bg-slate-200 text-slate-800',
  SUBMITTED: 'bg-sky-100 text-sky-800',
  RECONCILED: 'bg-emerald-600 text-white',
  DISPUTED: 'bg-rose-100 text-rose-900',
}

export function getDeclarationColumns(): ColumnDef<DeclarationView>[] {
  return [
    {
      accessorKey: 'reference',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Référence' />,
      cell: ({ row }) => <span className='font-medium text-primary'>{row.original.reference}</span>,
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
      accessorKey: 'period',
      header: 'Période',
      cell: ({ row }) => row.original.period,
      meta: { label: 'Période' },
    },
    {
      accessorKey: 'volume_label',
      header: 'Volume déclaré',
      cell: ({ row }) => row.original.volume_label,
      meta: { label: 'Volume déclaré' },
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge className={STATUS_CLASS[row.original.status]}>
          {declarationStatusLabels[row.original.status]}
        </Badge>
      ),
      enableHiding: false,
      meta: { label: 'Statut' },
    },
  ]
}