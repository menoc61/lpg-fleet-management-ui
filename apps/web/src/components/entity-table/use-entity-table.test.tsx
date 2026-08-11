import { describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import type { ColumnDef } from '@tanstack/react-table'
import { renderHook } from 'vitest-browser-react'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { useEntityTable } from './use-entity-table'

interface Row {
  id: string
  name: string
}

function columnsFn(onViewDetails?: (row: Row) => void): ColumnDef<Row>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span>{row.original.id}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Nom',
      cell: ({ row }) =>
        onViewDetails ? (
          <button onClick={() => onViewDetails(row.original)}>{row.original.name}</button>
        ) : (
          <span>{row.original.name}</span>
        ),
    },
  ]
}

const FIXTURES: Row[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Bravo' },
  { id: 'c', name: 'Charlie' },
]

function lastNavigate(navigate: Mock<NavigateFn>) {
  const calls = navigate.mock.calls
  return calls[calls.length - 1]?.[0] as
    | { search: unknown; replace?: boolean }
    | undefined
}

describe('useEntityTable', () => {
  it('returns a table instance with the provided columns and data', async () => {
    const navigate = vi.fn() as Mock<NavigateFn>
    const { result } = await renderHook(() =>
      useEntityTable<Row>({
        data: FIXTURES,
        columns: columnsFn(),
        search: {},
        navigate,
      }),
    )

    expect(result.current.table.getRowCount()).toBe(3)
    expect(result.current.table.getAllColumns().map((c) => c.id)).toEqual([
      'id',
      'name',
    ])
    expect(result.current.sorting).toEqual([])
    expect(result.current.rowSelection).toEqual({})
  })

  it('defaults to pageSize 10 when not specified', async () => {
    const navigate = vi.fn() as Mock<NavigateFn>
    const { result } = await renderHook(() =>
      useEntityTable<Row>({
        data: FIXTURES,
        columns: columnsFn(),
        search: {},
        navigate,
      }),
    )

    expect(result.current.table.getState().pagination.pageSize).toBe(10)
    expect(result.current.table.getState().pagination.pageIndex).toBe(0)
  })

  it('honours a custom pageSize option', async () => {
    const navigate = vi.fn() as Mock<NavigateFn>
    const { result } = await renderHook(() =>
      useEntityTable<Row>({
        data: FIXTURES,
        columns: columnsFn(),
        search: {},
        navigate,
        options: { pageSize: 25 },
      }),
    )

    expect(result.current.table.getState().pagination.pageSize).toBe(25)
  })

  it('derives pagination from the current search params', async () => {
    const navigate = vi.fn() as Mock<NavigateFn>
    const { result } = await renderHook(() =>
      useEntityTable<Row>({
        data: FIXTURES,
        columns: columnsFn(),
        search: { page: 2, pageSize: 5 },
        navigate,
        options: { pageSize: 5 },
      }),
    )

    expect(result.current.table.getState().pagination.pageIndex).toBe(1)
    expect(result.current.table.getState().pagination.pageSize).toBe(5)
  })

  it('column sorting updates the in-memory sort state', async () => {
    const navigate = vi.fn() as Mock<NavigateFn>
    const { result } = await renderHook(() =>
      useEntityTable<Row>({
        data: FIXTURES,
        columns: columnsFn(),
        search: {},
        navigate,
      }),
    )

    result.current.table.getHeaderGroups().forEach((group) => {
      const nameHeader = group.headers.find((h) => h.column.id === 'name')
      if (nameHeader && nameHeader.column.getCanSort()) {
        nameHeader.column.toggleSorting(false)
      }
    })

    expect(result.current.sorting.length).toBeGreaterThan(0)
    expect(result.current.sorting[0]).toMatchObject({ id: 'name', desc: true })
  })

  it('column visibility state is independent per render', async () => {
    const navigate = vi.fn() as Mock<NavigateFn>
    const { result } = await renderHook(() =>
      useEntityTable<Row>({
        data: FIXTURES,
        columns: columnsFn(),
        search: {},
        navigate,
      }),
    )

    result.current.setColumnVisibility({ id: false })
    expect(result.current.columnVisibility).toEqual({ id: false })
  })

  it('wires column filters through useTableUrlState', async () => {
    const navigate = vi.fn() as Mock<NavigateFn>
    const { result } = await renderHook(() =>
      useEntityTable<Row>({
        data: FIXTURES,
        columns: columnsFn(),
        search: { role: 'ADMIN' },
        navigate,
        options: {
          urlState: {
            columnFilters: [{ columnId: 'role', searchKey: 'role', type: 'string' }],
          },
        },
      }),
    )

    expect(result.current.table.getState().columnFilters).toEqual([
      { id: 'role', value: 'ADMIN' },
    ])
  })

  it('navigates with updated search when a column filter changes', async () => {
    const navigate = vi.fn() as Mock<NavigateFn>
    const { result } = await renderHook(() =>
      useEntityTable<Row>({
        data: FIXTURES,
        columns: columnsFn(),
        search: {},
        navigate,
        options: {
          urlState: {
            columnFilters: [{ columnId: 'role', searchKey: 'role', type: 'string' }],
          },
        },
      }),
    )

    const filterFn = result.current.table.getColumn('role')?.setFilterValue
    expect(typeof filterFn).toBe('function')
    filterFn?.('SUPERADMIN')

    const last = lastNavigate(navigate)
    expect(last).toBeDefined()
    const s = last?.search
    if (typeof s === 'function') {
      const next = (s as (prev: Record<string, unknown>) => Record<string, unknown>)({})
      expect(next.role).toBe('SUPERADMIN')
    } else {
      expect((s as Record<string, unknown>).role).toBe('SUPERADMIN')
    }
  })
})
