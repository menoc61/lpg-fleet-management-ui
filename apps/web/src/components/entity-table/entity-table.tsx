import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  Table as TanstackTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { type EntityTableOptions, type ToolbarFilter, useEntityTable } from './use-entity-table'

export type { NavigateFn, ToolbarFilter, EntityTableOptions }

export type EntityTableProps<TData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  search: Record<string, unknown>
  navigate: NavigateFn
  searchPlaceholder?: string
  searchKey?: string
  emptyLabel?: string
  toolbarFilters?: ToolbarFilter[]
  options?: EntityTableOptions<TData>
  /** Allow bulk-actions slot to consume the table instance. */
  renderToolbarExtras?: (table: TanstackTable<TData>) => React.ReactNode
  /** Optional row double-click — opens details in most features. */
  onRowDoubleClick?: (row: TData) => void
}

export function EntityTable<TData>({
  data,
  columns,
  search,
  navigate,
  searchPlaceholder,
  searchKey,
  emptyLabel = 'Aucun résultat.',
  toolbarFilters = [],
  options,
  renderToolbarExtras,
  onRowDoubleClick,
}: EntityTableProps<TData>) {
  const { table } = useEntityTable<TData>({
    data,
    columns,
    search,
    navigate,
    options,
  })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          searchKey={searchKey}
          filters={toolbarFilters}
        />
        {renderToolbarExtras?.(table)}
      </div>

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
                  onDoubleClick={
                    onRowDoubleClick
                      ? () => onRowDoubleClick(row.original)
                      : undefined
                  }
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
                  {emptyLabel}
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
