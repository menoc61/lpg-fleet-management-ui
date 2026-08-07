import { type ColumnDef } from '@tanstack/react-table'
import { Badge, DataTableColumnHeader } from '@lpg/ui'
import {
  type ReconciliationView,
  type ReconciliationStatus,
  reconciliationStatusLabels,
} from '../data/reconciliations'

const STATUS_CLASS: Record<ReconciliationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-900',
  VERIFIED: 'bg-emerald-600 text-white',
  REDRESSEMENTAPPLIED: 'bg-violet-100 text-violet-900',
}

export function getReconciliationColumns(): ColumnDef<ReconciliationView>[] {
  return [
    {
      accessorKey: 'reference',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Référence' />,
      cell: ({ row }) => <span className='font-medium text-primary'>{row.original.reference}</span>,
      enableHiding: false,
      meta: { label: 'Référence' },
    },
    {
      accessorKey: 'declaration_reference',
      header: 'Déclaration',
      cell: ({ row }) => row.original.declaration_reference,
      meta: { label: 'Déclaration' },
    },
    {
      accessorKey: 'marketeur_name',
      header: 'Marketeur',
      cell: ({ row }) => row.original.marketeur_name,
      meta: { label: 'Marketeur' },
    },
    {
      accessorKey: 'declared_volume',
      header: 'Déclaré (TM)',
      cell: ({ row }) => (row.original.declared_volume / 1000).toLocaleString('fr-FR'),
      meta: { label: 'Déclaré (TM)' },
    },
    {
      accessorKey: 'tracked_volume',
      header: 'Suivi (TM)',
      cell: ({ row }) => (row.original.tracked_volume / 1000).toLocaleString('fr-FR'),
      meta: { label: 'Suivi (TM)' },
    },
    {
      accessorKey: 'gap_percentage',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Écart %' />,
      cell: ({ row }) => {
        const gap = row.original.gap_percentage
        const flagged = gap > 2.5
        return (
          <Badge className={flagged ? 'bg-rose-100 text-rose-900' : 'bg-slate-100 text-slate-700'}>
            {gap.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}%
          </Badge>
        )
      },
      meta: { label: 'Écart %' },
    },
    {
      accessorKey: 'subsidy_impact',
      header: 'Impact subvention (XAF)',
      cell: ({ row }) => row.original.subsidy_impact.toLocaleString('fr-FR'),
      meta: { label: 'Impact subvention (XAF)' },
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge className={STATUS_CLASS[row.original.status]}>
          {reconciliationStatusLabels[row.original.status]}
        </Badge>
      ),
      enableHiding: false,
      meta: { label: 'Statut' },
    },
  ]
}