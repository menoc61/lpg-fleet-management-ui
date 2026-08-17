import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@lpg/api-client'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import type { SiteRole, SiteRow, TransitionRequest } from './lib/site-status-machine'
import { SiteActionsMenu } from './components/site-actions-menu'
import { SiteStatusBadge } from './components/site-status-badge'
import { defaultThresholds, getSiteRows, getClientSiteRows, getVerificationInbox } from './data/site-lifecycle'
import { clientSiteFields, clientSiteFromForm, siteFields, siteFromForm } from './data/sites-crud'
import { cn } from '@/lib/utils'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@lpg/ui'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table'
import {
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { EntityFormSheet, useEntityPermission } from '@/components/entity-crud'
import { Plus } from 'lucide-react'
import { assertPermission } from '@/lib/security/guards'
import { useAuthStore } from '@/store/auth-store'

const REGION_OPTIONS = [{ label: 'CENTRE', value: 'CENTRE' }, { label: 'LITTORAL', value: 'LITTORAL' }, { label: 'NORD', value: 'NORD' }, { label: 'EXTREMENORD', value: 'EXTREMENORD' }, { label: 'OUEST', value: 'OUEST' }, { label: 'SUDOUEST', value: 'SUDOUEST' }, { label: 'EST', value: 'EST' }, { label: 'ADAMAOUA', value: 'ADAMAOUA' }]
const STATUS_VALUES = ['UNASSIGNED', 'ASSIGNED', 'ACTIVE', 'VERIFIED', 'SUSPENDED', 'REJECTED']

function SitesTableCore({ rows, role, onAction, onDelete }: { rows: SiteRow[]; role: SiteRole; onAction: (row: SiteRow, req: TransitionRequest) => void; onDelete?: (row: SiteRow) => void }) {
  const columns = useMemo<ColumnDef<SiteRow>[]>(() => [
    /*{ accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className='font-mono text-xs'>{row.original.id}</span>, meta: { label: 'ID' }, enableHiding: false },*/
    { accessorKey: 'region', header: 'Région', cell: ({ row }) => <Badge variant='outline'>{row.original.region}</Badge>, meta: { label: 'Région' } },
    { accessorKey: 'delivery_count', header: 'Livraisons', cell: ({ row }) => row.original.delivery_count, meta: { label: 'Livraisons' } },
    { accessorKey: 'geo_confidence_score', header: 'Confiance', cell: ({ row }) => `${row.original.geo_confidence_score}/100`, meta: { label: 'Confiance' } },
    { accessorKey: 'status', header: 'Statut', cell: ({ row }) => <SiteStatusBadge row={row.original} thresholds={defaultThresholds} />, meta: { label: 'Statut' }, enableHiding: false },
    { id: 'actions', header: '', cell: ({ row }) => <SiteActionsMenu row={row.original} role={role} onAction={(req) => onAction(row.original, req)} onDelete={onDelete ? () => onDelete(row.original) : undefined} />, meta: { label: 'Actions' }, enableSorting: false, enableHiding: false },
  ], [role, onAction, onDelete])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({ data: rows, columns, state: { sorting, pagination, rowSelection, columnFilters, columnVisibility }, onSortingChange: setSorting, onPaginationChange: setPagination, onRowSelectionChange: setRowSelection, onColumnFiltersChange: setColumnFilters, onColumnVisibilityChange: setColumnVisibility, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar table={table} searchPlaceholder='Rechercher un site...' searchKey='id' filters={[{ columnId: 'region', title: 'Région', options: REGION_OPTIONS }, { columnId: 'status', title: 'Statut', options: STATUS_VALUES.map((v) => ({ label: v, value: v })) }]} />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>{table.getHeaderGroups().map((hg) => (<TableRow key={hg.id}>{hg.headers.map((h) => (<TableHead key={h.id} className={cn(h.column.columnDef.meta?.className)}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (<TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>)) : (<TableRow><TableCell colSpan={columns.length} className='h-24 text-center'>Aucun site.</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}

export function SitesScreen({ kind, role }: { kind: 'site' | 'client_site'; role: SiteRole }) {
  const perm = useEntityPermission('sites')
  const [rows, setRows] = useState<SiteRow[]>(() =>
    kind === 'site' ? getSiteRows() : getClientSiteRows(),
  )
  const [creating, setCreating] = useState(false)
  const handleAction = (row: SiteRow, request: TransitionRequest) => {
    const role = useAuthStore.getState().user?.system_role ?? 'LIVREUR'
    const required = request.kind === 'verify' ? 'sites.verify' : 'sites.write'
    try {
      assertPermission(role, required)
    } catch {
      toast.error('Accès refusé pour cette action.')
      return
    }
    const nextStatus: Record<string, SiteRow['status']> = { verify: 'VERIFIED', suspend: 'SUSPENDED', reject: 'REJECTED', reassign: 'ASSIGNED' }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: nextStatus[request.kind]! } : r)))
    const labels: Record<string, string> = { verify: 'vérifié', suspend: 'suspendu', reject: 'rejeté', reassign: 'réassigné' }
    toast[request.kind === 'reject' ? 'error' : request.kind === 'suspend' ? 'warning' : 'success'](`${row.id} marqué comme ${labels[request.kind]}`)
  }
  const handleDelete = useCallback(
    async (row: SiteRow) => {
      try {
        if (kind === 'site') await api.sites.remove(row.id)
        else await api.clientSites.remove(row.id)
        toast.success(`Site ${row.id} supprimé.`)
        setRows(kind === 'site' ? getSiteRows() : getClientSiteRows())
      } catch {
        toast.error('Échec de la suppression.')
      }
    },
    [kind],
  )
  const handleCreate = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        if (kind === 'site') await api.sites.create(siteFromForm(values) as never)
        else await api.clientSites.create(clientSiteFromForm(values) as never)
        toast.success(kind === 'site' ? 'Site créé.' : 'Site client créé.')
        setCreating(false)
        setRows(kind === 'site' ? getSiteRows() : getClientSiteRows())
      } catch {
        toast.error('Échec de la création.')
      }
    },
    [kind],
  )
  const title = kind === 'site' ? 'Sites opérationnels' : 'Sites clients'
  return (
    <PageShell>
      <PageHeader
        title={title}
        description={`${rows.length} entrée(s). Statuts: UNASSIGNED → ASSIGNED → ACTIVE → VERIFIED. SUSPENDED/REJECTED accessibles par AGENT/ADMIN/SUPERADMIN.`}
        actions={
          perm.canCreate ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className='mr-1 h-4 w-4' />
              {kind === 'site' ? 'Nouveau site' : 'Nouveau site client'}
            </Button>
          ) : undefined
        }
      />
      <SectionCard>
        <SitesTableCore rows={rows} role={role} onAction={handleAction} onDelete={handleDelete} />
      </SectionCard>

      <EntityFormSheet
        open={creating}
        onOpenChange={setCreating}
        title={kind === 'site' ? 'Nouveau site' : 'Nouveau site client'}
        description='Renseignez le site. Son statut initial est UNASSIGNED.'
        fields={kind === 'site' ? siteFields : clientSiteFields}
        onSubmit={handleCreate}
        onCancel={() => setCreating(false)}
        submitLabel='Créer'
      />
    </PageShell>
  )
}

export function SiteVerificationsScreen({ role }: { role: SiteRole }) {
  const [openRow, setOpenRow] = useState<SiteRow | null>(null)
  const [inbox, setInbox] = useState<SiteRow[]>(() => getVerificationInbox())
  const handleAction = (row: SiteRow, request: TransitionRequest) => {
    if (request.kind === 'verify') { setInbox((prev) => prev.filter((r) => r.id !== row.id)); toast.success(`${row.id} vérifié`) }
    else if (request.kind === 'suspend' || request.kind === 'reject') { setInbox((prev) => prev.filter((r) => r.id !== row.id)); toast.info(`${row.id} retiré de la file`) }
    setOpenRow(null)
  }
  return (
    <PageShell>
      <PageHeader title='File de vérification' description={`${inbox.length} site(s) en attente de validation par AGENT/ADMIN/SUPERADMIN.`} />
      <SectionCard><SitesTableCore rows={inbox} role={role} onAction={handleAction} /></SectionCard>
      {openRow && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40' onClick={() => setOpenRow(null)}>
          <div className='bg-background rounded-xl border p-6 max-w-md w-full' onClick={(e) => e.stopPropagation()}>
            <h3 className='font-semibold mb-3'>{openRow.id}</h3>
            <div className='space-y-1 text-sm'>
              <p>Statut: <SiteStatusBadge row={openRow} thresholds={defaultThresholds} /></p>
              <p>Livraisons: {openRow.delivery_count}</p>
              <p>Confiance geo: {openRow.geo_confidence_score}/100</p>
              <p>Région: {openRow.region}</p>
            </div>
            <Button variant='ghost' className='mt-4' onClick={() => setOpenRow(null)}>Fermer</Button>
          </div>
        </div>
      )}
    </PageShell>
  )
}
