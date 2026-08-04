import { useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import { DataTable, type FacetedFilterConfig } from '@lpg/ui'
import { getOrganizations, orgTypeLabel, orgStatusLabel, type Organization } from '@/features/organizations/organizations'
import { Badge } from '@lpg/ui'

const route = getRouteApi('/_authenticated/$role/$module')

const STATUS_OPTIONS = [
  { label: 'Actif', value: 'active' },
  { label: 'En attente', value: 'pending' },
  { label: 'Clôturé', value: 'closed' },
]

const TYPE_OPTIONS = [
  { label: 'Regulator', value: 'REGULATEUR' },
  { label: 'Depot', value: 'DEPOT' },
  { label: 'Marketeur', value: 'MARKETEUR' },
  { label: 'Transporteur', value: 'TRANSPORTEUR' },
  { label: 'Client', value: 'CLIENT' },
]

const REGIONS = [
  'Centre',
  'Littoral',
  'Nord',
  'Extrême-Nord',
  'Ouest',
  'Sud-Ouest',
  'Est',
  'Adamaoua',
]

type Filters = {
  q: string
  type: string[]
  status: string[]
  region: string[]
}

export function SuperAdminOrganizationsScreen() {
  const navigate = route.useNavigate()
  const [filters, _setFilters] = useState<Filters>({ q: '', type: [], status: [], region: [] })

  const rows = useMemo(() => getOrganizations(), [])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    return rows.filter((row) => {
      if (q) {
        const haystack = `${row.name} ${row.city} ${row.region} ${row.id}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.type.length && !filters.type.includes(row.type)) return false
      if (filters.status.length && !filters.status.includes(row.status)) return false
      if (filters.region.length && !filters.region.includes(row.region)) return false
      return true
    })
  }, [rows, filters])

  const facetedFilters: FacetedFilterConfig[] = useMemo(
    () => [
      {
        columnId: 'type',
        title: 'Type',
        options: TYPE_OPTIONS,
      },
      {
        columnId: 'status',
        title: 'Statut',
        options: STATUS_OPTIONS,
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
        key: 'name',
        header: 'Organisation',
        sortable: true,
        render: (row: Organization) => (
          <div>
            <div className="font-medium text-sm">{row.name}</div>
            <div className="text-xs text-muted-foreground">{row.id}</div>
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        render: (row: Organization) => <Badge variant="outline">{orgTypeLabel(row.type)}</Badge>,
      },
      {
        key: 'status',
        header: 'Statut',
        sortable: true,
        render: (row: Organization) => {
          const label = orgStatusLabel(row.status)
          const color =
            row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'secondary'
          return <Badge color={color}>{label}</Badge>
        },
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
        key: 'createdAt',
        header: 'Créé le',
        sortable: true,
      },
      {
        key: 'updatedAt',
        header: 'Modifié le',
        sortable: true,
      },
    ],
    []
  )

  return (
    <PageShell>
      <PageHeader
        title="Organisations"
        description={`${filtered.length} entité(s) trouvée(s).`}
      />
      <SectionCard>
        <DataTable
          data={filtered}
          columns={columns}
          search={{ placeholder: 'Rechercher une organisation, une ville, un ID...', searchKey: 'q' }}
          facetedFilters={facetedFilters}
          filename="organisations"
          searchState={{} as any}
          navigate={navigate as any}
        />
      </SectionCard>
    </PageShell>
  )
}
