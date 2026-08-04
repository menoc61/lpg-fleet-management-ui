import { useMemo } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import { DataTable, type FacetedFilterConfig, Badge } from '@lpg/ui'
import { getOrganizations, orgTypeLabel, orgStatusLabel, type Organization } from '@/features/organizations/organizations'

const STATUS_OPTIONS = [
  { label: 'Actif', value: 'ACTIVE' },
  { label: 'En attente', value: 'ASSIGNED' },
  { label: 'Suspendu', value: 'SUSPENDED' },
  { label: 'Vérifié', value: 'VERIFIED' },
]

const TYPE_OPTIONS = [
  { label: 'Régulateur', value: 'REGULATEUR' },
  { label: 'Dépôt', value: 'DEPOT' },
  { label: 'Marketeur', value: 'MARKETEUR' },
  { label: 'Transporteur', value: 'TRANSPORTEUR' },
  { label: 'Client', value: 'CLIENT' },
]

const REGIONS = [
  'CENTRE',
  'LITTORAL',
  'NORD',
  'EXTREMENORD',
  'OUEST',
  'SUDOUEST',
  'EST',
  'ADAMAOUA',
] as const

export function SuperAdminOrganizationsScreen() {
  const rows = useMemo(() => getOrganizations(), [])

  const facetedFilters: FacetedFilterConfig[] = useMemo(
    () => [
      { columnId: 'type', title: 'Type', options: [...TYPE_OPTIONS] },
      { columnId: 'status', title: 'Statut', options: [...STATUS_OPTIONS] },
      { columnId: 'region', title: 'Région', options: REGIONS.map((r) => ({ label: r, value: r })) },
    ],
    []
  )

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Organisation',
        sortable: true,
        render: (row: Organization) => (
          <div>
            <div className='font-medium text-sm'>{row.name}</div>
            <div className='text-xs text-muted-foreground'>{row.id}</div>
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        render: (row: Organization) => <Badge variant='outline'>{orgTypeLabel(row.type)}</Badge>,
      },
      {
        key: 'status',
        header: 'Statut',
        sortable: true,
        render: (row: Organization) => <Badge variant='outline'>{orgStatusLabel(row.status)}</Badge>,
      },
      {
        key: 'region',
        header: 'Région',
        sortable: true,
      },
      {
        key: 'city',
        header: 'Ville',
        sortable: true,
      },
      {
        key: 'sites',
        header: 'Sites',
        sortable: true,
      },
      {
        key: 'created_at',
        header: 'Créé le',
        sortable: true,
      },
      {
        key: 'updated_at',
        header: 'Modifié le',
        sortable: true,
      },
    ],
    []
  )

  return (
    <PageShell>
      <PageHeader title='Organisations' description={`${rows.length} entité(s) chargée(s) depuis les fixtures curées.`} />
      <SectionCard>
        <DataTable
          data={rows}
          columns={columns}
          search={{ placeholder: 'Rechercher une organisation…', searchKey: 'q' }}
          facetedFilters={facetedFilters}
          filename='organisations'
        />
      </SectionCard>
    </PageShell>
  )
}