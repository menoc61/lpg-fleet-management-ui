import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type Table,
  type TableOptions,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { useTableUrlState } from '@/hooks/use-table-url-state'

export type { NavigateFn } from '@/hooks/use-table-url-state'

export type ToolbarFilter = {
  columnId: string
  title: string
  options: ReadonlyArray<{
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }>
}

/**
 * Optional pass-through to the underlying `useTableUrlState` config
 * (global filter, column filters, etc). Anything not provided falls
 * back to a sensible default.
 */
export type EntityTableUrlState = {
  globalFilter?: {
    enabled?: boolean
    key?: string
    trim?: boolean
  }
  columnFilters?: Array<
    | {
        columnId: string
        searchKey: string
        type?: 'string'
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
    | {
        columnId: string
        searchKey: string
        type: 'array'
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
  >
}

/**
 * Hook consumers can spread additional TanStack `TableOptions` through
 * here — e.g. `manualSorting`, `manualPagination`, `getRowId`, etc.
 */
export type EntityTableOptions<TData> = Omit<
  Partial<TableOptions<TData>>,
  | 'data'
  | 'columns'
  | 'getCoreRowModel'
  | 'state'
  | 'onPaginationChange'
  | 'onColumnFiltersChange'
  | 'onRowSelectionChange'
  | 'onSortingChange'
  | 'onColumnVisibilityChange'
  | 'onGlobalFilterChange'
  | 'getPaginationRowModel'
  | 'getFilteredRowModel'
  | 'getSortedRowModel'
  | 'getFacetedRowModel'
  | 'getFacetedUniqueValues'
> & {
  /** Page size; defaults to 10. */
  pageSize?: number
  /** Default page (1-indexed); defaults to 1. */
  defaultPage?: number
  /** URL-state wiring. */
  urlState?: EntityTableUrlState
}

export type UseEntityTableArgs<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  search: Record<string, unknown>
  navigate: NavigateFn
  options?: EntityTableOptions<TData>
}

export type UseEntityTableReturn<TData> = {
  table: Table<TData>
  rowSelection: Record<string, boolean>
  setRowSelection: OnChangeFn<Record<string, boolean>>
  columnVisibility: VisibilityState
  setColumnVisibility: OnChangeFn<VisibilityState>
  sorting: SortingState
  setSorting: OnChangeFn<SortingState>
  columnFilters: ColumnFiltersState
  globalFilter: string | undefined
}

export function useEntityTable<TData>({
  columns,
  data,
  search,
  navigate,
  options,
}: UseEntityTableArgs<TData>): UseEntityTableReturn<TData> {
  const pageSize = options?.pageSize ?? 10
  const defaultPage = options?.defaultPage ?? 1
  const { urlState, ...rest } = options ?? {}

  const url = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage, defaultPageSize: pageSize },
    ...(urlState ?? {}),
  })

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting,
      pagination: url.pagination as PaginationState,
      rowSelection,
      columnFilters: url.columnFilters,
      columnVisibility,
      ...(url.globalFilter !== undefined ? { globalFilter: url.globalFilter } : {}),
    },
    enableRowSelection: true,
    onPaginationChange: url.onPaginationChange as OnChangeFn<PaginationState>,
    onColumnFiltersChange: url.onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    ...(url.onGlobalFilterChange
      ? { onGlobalFilterChange: url.onGlobalFilterChange as OnChangeFn<string> }
      : {}),
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    ...rest,
  })

  useEffect(() => {
    url.ensurePageInRange(table.getPageCount())
  }, [table, url])

  const view = useMemo(
    () => ({
      table,
      rowSelection,
      setRowSelection,
      columnVisibility,
      setColumnVisibility,
      sorting,
      setSorting,
      columnFilters: url.columnFilters,
      globalFilter: url.globalFilter,
    }),
    [table, rowSelection, columnVisibility, sorting, url.columnFilters, url.globalFilter],
  )

  return view
}
