import { useMemo } from 'react'
import {
  organizations,
  sites,
  client_sites,
  vehicles,
  drivers,
  devices,
  delivery_tours,
  checkpoints,
  scan_events,
  declarations,
  reconciliations,
  redressements,
  anomalies,
  risk_scores,
  notifications,
  notification_groups,
  notification_rules,
  pickup_requests,
  transporter_contracts,
  users,
} from '@lpg/mock-data'
import { type Role } from '@/config/rbac/roles'
import { MODULE_REGISTRY } from '@/config/modules/registry'
import { moduleKey, type ModuleField } from '@/config/modules/types'
import { buildColumns } from '@/module/build-columns'
import { DataTable, type FacetedFilterConfig } from '@lpg/ui'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState, PageShell, SectionCard } from '@/components/layout/page'
import { ModuleBulkActions } from '@/module/module-bulk-actions'

type TableRow = Record<string, string | number | boolean | null | undefined>

interface CuratedSource {
  readonly rows: readonly TableRow[]
}

const SOURCE_BY_MODULE: Record<string, CuratedSource> = {
  organizations: { rows: organizations.map((o) => ({ ...o })) },
  sites: { rows: sites.map((s) => ({ ...s })) },
  'client-sites': { rows: client_sites.map((s) => ({ ...s })) },
  vehicles: { rows: vehicles.map((v) => ({ ...v })) },
  drivers: { rows: drivers.map((d) => ({ ...d })) },
  devices: { rows: devices.map((d) => ({ ...d })) },
  'delivery-tours': { rows: delivery_tours.map((t) => ({ ...t })) },
  checkpoints: { rows: checkpoints.map((c) => ({ ...c })) },
  'scan-events': { rows: scan_events.map((e) => ({ ...e })) },
  declarations: { rows: declarations.map((d) => ({ ...d })) },
  reconciliations: { rows: reconciliations.map((r) => ({ ...r })) },
  redressements: { rows: redressements.map((r) => ({ ...r })) },
  anomalies: { rows: anomalies.map((a) => ({ ...a })) },
  'risk-scores': { rows: risk_scores.map((r) => ({ ...r })) },
  notifications: { rows: notifications.map((n) => ({ ...n })) },
  'notification-groups': { rows: notification_groups.map((g) => ({ ...g })) },
  'notification-rules': { rows: notification_rules.map((r) => ({ ...r })) },
  'pickup-requests': { rows: pickup_requests.map((p) => ({ ...p })) },
  'transporter-contracts': { rows: transporter_contracts.map((c) => ({ ...c })) },
  users: { rows: users.map((u) => ({ ...u })) },
}

function pickField(rows: readonly TableRow[], key: string): string | number | boolean | null | undefined {
  for (const row of rows) {
    const value = row[key]
    if (value !== undefined) return value
  }
  return undefined
}

function synthesizeValue(field: ModuleField, sample: TableRow[string], idx: number): string | number | boolean | null | undefined {
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

function buildRows(
  def: { fields: ModuleField[]; mockCount?: number },
  module: string
): TableRow[] {
  const source = SOURCE_BY_MODULE[module]?.rows ?? []
  const count = def.mockCount ?? source.length ?? 25
  const rows: TableRow[] = []
  for (let i = 0; i < count; i++) {
    const base = source[i % source.length] ?? { id: `row-${i + 1}` }
    const row: TableRow = { id: (base.id as string | number) ?? `row-${i + 1}` }
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
    () =>
      def
        ? def.fields
            .filter((f) => f.groupable)
            .map((f) => ({ columnId: f.key, title: f.header }))
        : [],
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
          search={{ placeholder: `Rechercher ${def.title.toLowerCase()}…`, searchKey: 'q' }}
          facetedFilters={facetedFilters}
          groupableColumns={groupableColumns}
          dateFilter={
            dateField
              ? {
                  columnId: dateField.key,
                  searchKeyFrom: `${dateField.key}From`,
                  searchKeyTo: `${dateField.key}To`,
                  getRowDate: (row: TableRow) => row[dateField.key] as string | Date,
                  placeholder: `Filtrer par ${dateField.header.toLowerCase()}`,
                }
              : undefined
          }
          filename={module}
          renderBulkActions={({ table }) => <ModuleBulkActions table={table} entityName='élément' />}
        />
      </SectionCard>
    </PageShell>
  )
}