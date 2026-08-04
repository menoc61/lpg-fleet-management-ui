import { useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import { DataTable, type FacetedFilterConfig } from '@lpg/ui'
import { transporters, transporterStatusOptions, type Transporter, type TransporterAckStatus } from '@/features/transporters/data/transporters'
import { Badge } from '@lpg/ui'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const route = getRouteApi('/_authenticated/$role/$module')

const STATUS_OPTIONS = [
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
]

const ACK_OPTIONS: { label: string; value: TransporterAckStatus }[] = [
  { label: 'En attente', value: 'pending' },
  { label: 'Accusé', value: 'acknowledged' },
  { label: 'Rejeté', value: 'rejected' },
]

const REGIONS = ['Centre', 'Littoral', 'Nord', 'Extrême-Nord', 'Ouest', 'Sud-Ouest', 'Est', 'Adamaoua']

type Filters = {
  q: string
  status: string[]
  ack: TransporterAckStatus[]
  region: string[]
}

export function SuperAdminTransportersScreen() {
  const navigate = route.useNavigate()
  const [filters, _setFilters] = useState<Filters>({ q: '', status: [], ack: [], region: [] })
  const [data, setData] = useState<Transporter[]>(transporters)

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    return data.filter((row) => {
      if (q) {
        const haystack = `${row.name} ${row.region} ${row.id} ${row.contactEmail}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.status.length && !filters.status.includes(row.status)) return false
      if (filters.ack.length && !filters.ack.includes(row.acknowledgementStatus)) return false
      if (filters.region.length && !filters.region.includes(row.region)) return false
      return true
    })
  }, [data, filters])

  const facetedFilters: FacetedFilterConfig[] = useMemo(
    () => [
      {
        columnId: 'status',
        title: 'Statut',
        options: STATUS_OPTIONS,
      },
      {
        columnId: 'ack',
        title: 'Accusé / Réponse',
        options: ACK_OPTIONS,
      },
      {
        columnId: 'region',
        title: 'Région',
        options: REGIONS.map((r) => ({ label: r, value: r })),
      },
    ],
    []
  )

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        sortable: true,
        render: (row: Transporter) => (
          <button
            type="button"
            onClick={() => navigate({ to: `/transporters/${row.id}` })}
            className="text-left font-medium text-primary underline-offset-4 hover:underline"
          >
            {row.id}
          </button>
        ),
      },
      {
        key: 'name',
        header: 'Transporteur',
        sortable: true,
      },
      {
        key: 'status',
        header: 'Statut',
        sortable: true,
        render: (row: Transporter) => {
          const label = transporterStatusOptions.find((o) => o.value === row.status)?.label
          return <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{label}</Badge>
        },
      },
      {
        key: 'ack',
        header: 'Accusé / Réponse',
        sortable: true,
        render: (row: Transporter) => {
          const map: Record<TransporterAckStatus, { label: string; color: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
            pending: { label: 'En attente', color: 'secondary', icon: Clock },
            acknowledged: { label: 'Accusé', color: 'default', icon: CheckCircle },
            rejected: { label: 'Rejeté', color: 'destructive', icon: XCircle },
          }
          const cfg = map[row.acknowledgementStatus]
          const Icon = cfg.icon
          return (
            <Badge color={cfg.color} className="gap-1">
              <Icon className="size-3.5" />
              {cfg.label}
            </Badge>
          )
        },
      },
      {
        key: 'acknowledgedAt',
        header: 'Date réponse',
        sortable: true,
        render: (row: Transporter) => (row.acknowledgedAt ? row.acknowledgedAt : '—'),
      },
      {
        key: 'region',
        header: 'Région',
        sortable: true,
      },
      {
        key: 'fleetSize',
        header: 'Flotte',
        sortable: true,
        render: (row: Transporter) => `${row.fleetSize} camions`,
      },
      {
        key: 'contactPhone',
        header: 'Téléphone',
        sortable: false,
      },
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        render: (row: Transporter) => (
          <div className="flex gap-2">
            <button
              type="button"
              className="text-xs px-2 py-1 rounded border bg-background hover:bg-muted"
              onClick={() => {
                setData((prev) => prev.map((t) => (t.id === row.id ? { ...t, acknowledgementStatus: 'acknowledged', acknowledgedAt: new Date().toISOString().slice(0, 10) } : t)))
                toast.success(`${row.id} marqué comme accusé`)
              }}
            >
              Accusé
            </button>
            <button
              type="button"
              className="text-xs px-2 py-1 rounded border bg-background hover:bg-muted"
              onClick={() => {
                setData((prev) => prev.map((t) => (t.id === row.id ? { ...t, acknowledgementStatus: 'rejected', acknowledgedAt: new Date().toISOString().slice(0, 10) } : t)))
                toast.error(`${row.id} marqué comme rejeté`)
              }}
            >
              Rejeter
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  )

  return (
    <PageShell>
      <PageHeader title="Transporteurs" description={`${filtered.length} transporteur(s).`} />
      <SectionCard>
        <DataTable
          data={filtered}
          columns={columns}
          search={{ placeholder: 'Rechercher un transporteur, région, ID, email...', searchKey: 'q' }}
          facetedFilters={facetedFilters}
          filename="transporteurs"
          searchState={{} as any}
          navigate={navigate as any}
        />
      </SectionCard>
    </PageShell>
  )
}
