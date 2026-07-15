import { useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { type Role } from '@/config/rbac/roles'
import { MODULE_REGISTRY } from '@/config/modules/registry'
import { moduleKey } from '@/config/modules/types'
import { buildColumns } from '@/module/build-columns'
import { generateMockRows } from '@/module/mock-data'
import { DataTable, type FacetedFilterConfig } from '@lpg/ui'
import { PageHeader } from '@/components/layout/page-header'

export function ModuleScreen({ role, module }: { role: Role; module: string }) {
  const route = getRouteApi('/_authenticated/$role/$module')
  const search = route.useSearch() as Record<string, unknown>
  const navigate = route.useNavigate()
  const def = MODULE_REGISTRY[moduleKey(role, module)]

  const data = useMemo(() => (def ? generateMockRows(def) : []), [def])
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
      <main id='main-content' className='flex-1 space-y-4 p-4 sm:p-6'>
        <PageHeader title={module} description='Module non configuré.' />
        <p className='text-sm text-muted-foreground'>
          Aucune définition de table pour ce module.
        </p>
      </main>
    )
  }

  return (
    <main
      id='main-content'
      className='flex-1 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
    >
      <PageHeader title={def.title} description={def.description} />
      <section className='rounded-2xl border-transparent bg-background/88 p-3 shadow-sm backdrop-blur-sm sm:p-4'>
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
        />
      </section>
    </main>
  )
}
