import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type VisibilityState,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { UserView } from '../data/users'
import {
  mfaStatusLabel,
  userStatusLabel,
} from '../data/users'

type UsersTableProps = {
  data: UserView[]
  search: Record<string, unknown>
  navigate: NavigateFn
  onViewDetails: (user: UserView) => void
}

export function UsersTable({
  data,
  search,
  navigate,
  onViewDetails,
}: UsersTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<UserView>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }: { row: { original: UserView } }) => (
          <span className='font-mono text-xs'>{row.original.id}</span>
        ),
        meta: { label: 'ID' },
        enableHiding: false,
      },
      {
        accessorKey: 'fullName',
        header: ({ column }: { column: { toggleSorting: (asc?: boolean) => void; getIsSorted: () => boolean | 'asc' | 'desc' } }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2'
          >
            Nom
          </Button>
        ),
        cell: ({ row }: { row: { original: UserView } }) => (
          <Button
            variant='link'
            className='h-auto p-0 font-normal'
            onClick={() => onViewDetails(row.original)}
          >
            {row.original.fullName}
          </Button>
        ),
        meta: { label: 'Nom' },
      },
      {
        accessorKey: 'email',
        header: 'E-mail',
        cell: ({ row }: { row: { original: UserView } }) => (
          <span className='text-sm'>{row.original.email}</span>
        ),
        meta: { label: 'E-mail' },
      },
      {
        accessorKey: 'orgName',
        header: 'Organisation',
        cell: ({ row }: { row: { original: UserView } }) => row.original.orgName,
        meta: { label: 'Organisation' },
      },
      {
        accessorKey: 'role',
        header: 'Rôle',
        cell: ({ row }: { row: { original: UserView } }) => (
          <Badge variant='outline'>{row.original.roleLabel}</Badge>
        ),
        meta: { label: 'Rôle' },
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }: { row: { original: UserView } }) => (
          <Badge variant='outline'>{userStatusLabel(row.original.status)}</Badge>
        ),
        meta: { label: 'Statut' },
      },
      {
        accessorKey: 'mfaStatus',
        header: 'MFA',
        cell: ({ row }: { row: { original: UserView } }) => (
          <span className='text-sm'>{mfaStatusLabel(row.original.mfaStatus)}</span>
        ),
        meta: { label: 'MFA' },
      },
      {
        accessorKey: 'lastLogin',
        header: 'Dernière connexion',
        cell: ({ row }: { row: { original: UserView } }) => (
          <span className='text-sm'>{row.original.lastLogin}</span>
        ),
        meta: { label: 'Dernière connexion' },
      },
    ],
    [onViewDetails],
  )

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'role', searchKey: 'role', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'string' },
    ],
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Rechercher un utilisateur...'
        searchKey='fullName'
        filters={[
          {
            columnId: 'role',
            title: 'Rôle',
            options: [
              { label: 'Super Admin', value: 'SUPERADMIN' },
              { label: 'Administrateur', value: 'ADMIN' },
              { label: 'Superviseur', value: 'SUPERVISOR' },
              { label: 'Intégrateur', value: 'INTEGRATEUR' },
              { label: 'Agent validateur', value: 'AGENT' },
              { label: 'Marketeur', value: 'MARKETEUR' },
              { label: 'Transporteur', value: 'TRANSPORTEUR' },
              { label: 'Livreur', value: 'LIVREUR' },
            ],
          },
          {
            columnId: 'status',
            title: 'Statut',
            options: [
              { label: 'Actif', value: 'ACTIVE' },
              { label: 'Inactif', value: 'INACTIVE' },
            ],
          },
        ]}
      />

      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                      header.column.columnDef.meta?.className,
                    )}
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                  onDoubleClick={() => onViewDetails(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.tdClassName,
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Aucun utilisateur.
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