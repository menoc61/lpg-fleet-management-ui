import { useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { curated } from '@lpg/mock-data'
import { type Role } from '@/config/rbac/roles'
import { MODULE_REGISTRY } from '@/config/modules/registry'
import { moduleKey, type ModuleField } from '@/config/modules/types'
import { buildColumns } from '@/module/build-columns'
import { DataTable, type FacetedFilterConfig } from '@lpg/ui'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState, PageShell, SectionCard } from '@/components/layout/page'
import { ModuleBulkActions } from '@/module/module-bulk-actions'

function curatedRowsFor(module: string): Record<string, unknown>[] {
  const map: Record<string, Record<string, unknown>[]> = {
    organizations: curated.organizations as any,
    sites: curated.sites as any,
    'client-sites': curated.client_sites as any,
    vehicles: curated.vehicles as any,
    drivers: curated.drivers as any,
    devices: curated.devices as any,
    'delivery-tours': curated.delivery_tours as any,
    checkpoints: curated.checkpoints as any,
    'scan-events': curated.scan_events as any,
    declarations: curated.declarations as any,
    reconciliations: curated.reconciliations as any,
    redressements: curated.redressements as any,
    anomalies: curated.anomalies as any,
    'risk-scores': curated.risk_scores as any,
    notifications: curated.notifications as any,
    'notification-groups': curated.notification_groups as any,
    'notification-rules': curated.notification_rules as any,
    'pickup-requests': curated.pickup_requests as any,
    'transporter-contracts': curated.transporter_contracts as any,
    users: curated.users as any,
  }
  return (map[module] ?? []) as Record<string, unknown>[]
}

function pickField(rows: Record<string, unknown>[], key: string): unknown {
  for (const row of rows) {
    if (row[key] !== undefined) return row[key]
  }
  return undefined
}

function synthesizeValue(field: ModuleField, sample: unknown, idx: number): unknown {
  if (sample !== undefined) return sample
  switch (field.type) {
    case 'number':
    case 'currency':
      return 0
    case 'date':
      return new Date().toISOString()
    case 'badge':
    case 'status':
      return field.options?.[0]?.value ?? null
    case 'text':
    default:
      return `— #${idx + 1}`
  }
}

function buildRows(def: { fields: ModuleField[]; mockCount?: number }, module: string): Record<string, unknown>[] {
  const curatedData = curatedRowsFor(module)
  const count = def.mockCount ?? curatedData.length ?? 25
  const rows: Record<string, unknown>[] = []
  const source = curatedData.length > 0 ? curatedData : []
  for (let i = 0; i < count; i++) {
    const base = source[i % source.length] ?? { id: `row-${i + 1}` }
    const row: Record<string, unknown> = { id: base.id ?? `row-${i + 1}` }
    for (const field of def.fields) {
      if (field.key === 'id') continue
      const sample = pickField(source, field.key)
      row[field.key] = synthesizeValue(field, sample, i)
    }
    rows.push(row)
  }
  return rows
}

export function ModuleScreen({ role, module }: { role: Role; module: string }) {
  const route = getRouteApi('/_authenticated/$role/$module')
  const search = route.useSearch() as Record<string, unknown>
  const navigate = route.useNavigate()
  const def = MODULE_REGISTRY[moduleKey(role, module)]

  const data = useMemo(() => (def ? buildRows(def, module) : []), [def, module])
  const columns = useMemo(() => (def ? buildColumns(def.fields) : []), [def])

  const facetedFilters = useMemo<FacetedFilterConfig[]>(() => {
    if (!def) return []
    return def.fields
      .filter((f) => f.filterable && (f.type === 'badge' || f.type === 'status') && f.options)
      .map((f) => ({
        columnId: f.key,
        title: f.header,
        options: f.options!.map((o) => ({ label: o.label, value: o.value })),
      }))
  }, [def])

  const groupableColumns = useMemo(
    () => (def ? def.fields.filter((f) => f.groupable).map((f) => ({ columnId: f.key, title: f.header })) : []),
    [def]
  )
  const dateField = def?.fields.find((f) => f.type === 'date')

  if (!def) {
    return (
      <PageShell>
        <PageHeader title={module} description='Module non configuré.' />
        <EmptyState title='Aucune définition de table' description='Aucune définition de table pour ce module.' />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader title={def.title} description={def.description} icon={def.icon} />
      <SectionCard>
        <DataTable
          data={data}
          columns={columns}
          search={{ placeholder: `Rechercher ${def.title.toLowerCase()}...`, searchKey: 'q' }}
          facetedFilters={facetedFilters}
          groupableColumns={groupableColumns}
          dateFilter={
            dateField
              ? {
                  columnId: dateField.key,
                  searchKeyFrom: `${dateField.key}From`,
                  searchKeyTo: `${dateField.key}To`,
                  getRowDate: (row) => row[dateField.key] as string | Date,
                  placeholder: `Filtrer par ${dateField.header.toLowerCase()}`,
                }
              : undefined
          }
          filename={module}
          searchState={search}
          navigate={navigate}
          renderBulkActions={({ table }) => <ModuleBulkActions table={table} entityName='élément' />}
        />
      </SectionCard>
    </PageShell>
  )
}