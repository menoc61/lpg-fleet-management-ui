import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import { DataTable, type FacetedFilterConfig, Badge } from '@lpg/ui'
import {
  transporters,
  transporterStatusOptions,
  ackStatusOptions,
  type Transporter,
  type TransporterAckStatus,
} from '@/features/transporters/transporters'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const STATUS_OPTIONS = transporterStatusOptions

const ACK_OPTIONS: { label: string; value: TransporterAckStatus }[] = ackStatusOptions

const REGIONS = ['CENTRE', 'LITTORAL', 'NORD', 'EXTREMENORD', 'OUEST', 'SUDOUEST', 'EST', 'ADAMAOUA']

export function SuperAdminTransportersScreen() {
  const [data, setData] = useState<Transporter[]>(transporters)

  const facetedFilters: FacetedFilterConfig[] = useMemo(
    () => [
      { columnId: 'status', title: 'Statut', options: STATUS_OPTIONS },
      { columnId: 'acknowledgement_status', title: 'Accusé / Réponse', options: ACK_OPTIONS },
      { columnId: 'region', title: 'Région', options: REGIONS.map((r) => ({ label: r, value: r })) },
    ],
    []
  )

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Transporteur',
        sortable: true,
        render: (row: Transporter) => (
          <div>
            <div className='font-medium text-sm'>{row.name}</div>
            <div className='text-xs text-muted-foreground'>{row.id}</div>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Statut',
        sortable: true,
        render: (row: Transporter) => {
          const label = STATUS_OPTIONS.find((o) => o.value === row.status)?.label
          return <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{label}</Badge>
        },
      },
      {
        key: 'acknowledgement_status',
        header: 'Accusé',
        sortable: true,
        render: (row: Transporter) => {
          const map: Record<TransporterAckStatus, { label: string; icon: typeof Clock }> = {
            pending: { label: 'En attente', icon: Clock },
            acknowledged: { label: 'Accusé', icon: CheckCircle },
            rejected: { label: 'Rejeté', icon: XCircle },
          }
          const cfg = map[row.acknowledgementStatus]
          const Icon = cfg.icon
          return (
            <Badge variant='outline' className='gap-1'>
              <Icon className='size-3.5' />
              {cfg.label}
            </Badge>
          )
        },
      },
      {
        key: 'region',
        header: 'Région',
        sortable: true,
      },
      {
        key: 'fleet_size',
        header: 'Flotte',
        sortable: true,
        render: (row: Transporter) => `${row.fleetSize} camions`,
      },
      {
        key: 'contact_email',
        header: 'Email',
        sortable: false,
      },
      {
        key: 'contact_phone',
        header: 'Téléphone',
        sortable: false,
      },
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        render: (row: Transporter) => (
          <div className='flex gap-2'>
            <button
              type='button'
              className='text-xs px-2 py-1 rounded border bg-background hover:bg-muted'
              onClick={() => {
                setData((prev) =>
                  prev.map((t) =>
                    t.id === row.id ? { ...t, acknowledgementStatus: 'acknowledged', acknowledgedAt: new Date().toISOString().slice(0, 10) } : t
                  )
                )
                toast.success(`${row.id} marqué comme accusé`)
              }}
            >
              Accusé
            </button>
            <button
              type='button'
              className='text-xs px-2 py-1 rounded border bg-background hover:bg-muted'
              onClick={() => {
                setData((prev) =>
                  prev.map((t) =>
                    t.id === row.id ? { ...t, acknowledgementStatus: 'rejected', acknowledgedAt: new Date().toISOString().slice(0, 10) } : t
                  )
                )
                toast.error(`${row.id} marqué comme rejeté`)
              }}
            >
              Rejeter
            </button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <PageShell>
      <PageHeader title='Transporteurs' description={`${data.length} transporteur(s) curés.`} />
      <SectionCard>
        <DataTable
          data={data}
          columns={columns}
          search={{ placeholder: 'Rechercher un transporteur, région, email...', searchKey: 'q' }}
          facetedFilters={facetedFilters}
          filename='transporteurs'
        />
      </SectionCard>
    </PageShell>
  )
}