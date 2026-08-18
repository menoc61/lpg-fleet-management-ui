import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  GroupingState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import {
  Badge,
  DataTablePagination,
  DataTableToolbar,
} from '@lpg/ui'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@lpg/ui'
import { SiteStatusBadge } from './site-status-badge'
import { SiteActionsMenu } from './site-actions-menu'
import { cn } from '@/lib/utils'
import { defaultThresholds, REGIONS } from '../data/site-lifecycle'
import type { PromotionThresholds } from '../lib/auto-promotion'
import type {
  SiteRole,
  SiteRow,
  TransitionRequest,
} from '../lib/site-status-machine'

const REGION_OPTIONS = REGIONS.map((r) => ({ label: r, value: r }))
const STATUS_VALUES = ['UNASSIGNED', 'ASSIGNED', 'ACTIVE', 'VERIFIED', 'SUSPENDED', 'REJECTED'] as const

export function SitesTable({
  rows,
  role,
  onAction,
}: {
  rows: SiteRow[]
  role: SiteRole
  onAction: (row: SiteRow, req: TransitionRequest) => void
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [grouping, setGrouping] = useState<GroupingState>([])

  const thresholds: PromotionThresholds = defaultThresholds

  const columns = useMemo<ColumnDef<SiteRow>[]>(
    () => [
     /* {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span className='font-mono text-xs'>{row.original.id}</span>,
        meta: { label: 'ID' },
        enableHiding: false,
      }, */
      {
        accessorKey: 'region',
        header: 'Région',
        cell: ({ row }) => <Badge variant='outline'>{row.original.region}</Badge>,
        meta: { label: 'Région' },
      },
      {
        accessorKey: 'delivery_count',
        header: 'Livraisons',
        cell: ({ row }) => row.original.delivery_count,
        meta: { label: 'Livraisons' },
      },
      {
        accessorKey: 'geo_confidence_score',
        header: 'Confiance geo',
        cell: ({ row }) => `${row.original.geo_confidence_score}/100`,
        meta: { label: 'Confiance geo' },
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => (
          <SiteStatusBadge row={row.original} thresholds={thresholds} />
        ),
        meta: { label: 'Statut' },
        enableHiding: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <SiteActionsMenu
            row={row.original}
            role={role}
            onAction={(req) => onAction(row.original, req)}
          />
        ),
        meta: { label: 'Actions' },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [role, onAction, thresholds],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, pagination, columnFilters },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Rechercher un site...'
        searchKey='id'
        filters={[
          { columnId: 'region', title: 'Région', options: REGION_OPTIONS },
          {
            columnId: 'status',
            title: 'Statut',
            options: STATUS_VALUES.map((v) => ({ label: v, value: v })),
          },
        ]}
      />
       <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Grouper par</span>
          <select
            value={grouping[0] ?? ''}
            onChange={(e) =>
              setGrouping(e.target.value ? [e.target.value] : [])
            }
            className="h-8 rounded-md border bg-background px-2 text-sm"
          >
            <option value="">-</option>
            <option value="status">Statut</option>
          </select>
        </div>
    
      
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(header.column.columnDef.meta?.className)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  Aucun site.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
