import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Check, Minus, Search, ShieldCheck } from 'lucide-react'
import {
  PERMISSION_CATEGORIES,
  PERMISSION_CATALOG,
  ROLE_GRANTS,
  getCatalogEntry,
  type PermissionCategory,
} from '@lpg/permissions'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Input,
  type ChartConfig,
} from '@lpg/ui'
import { PageShell, KpiTile, SectionCard } from '@/components/layout/page'
import { ROLES, ROLE_LABELS, type Role } from '@/config/rbac/roles'

const ROLE_COLORS: Record<Role, string> = {
  SUPERADMIN: '#f43f5e',
  ADMIN: '#3b82f6',
  SUPERVISOR: '#a855f7',
  INTEGRATEUR: '#10b981',
  AGENT: '#f59e0b',
  MARKETEUR: '#06b6d4',
  TRANSPORTEUR: '#f97316',
  LIVREUR: '#64748b',
}

const ROLE_SHORT: Record<Role, string> = {
  SUPERADMIN: 'S-Admin',
  ADMIN: 'Admin',
  SUPERVISOR: 'Superv.',
  INTEGRATEUR: 'Intégr.',
  AGENT: 'Agent',
  MARKETEUR: 'Markét.',
  TRANSPORTEUR: 'Transp.',
  LIVREUR: 'Livr.',
}

const CATEGORY_SHORT: Record<PermissionCategory, string> = {
  identity: 'Identité',
  governance: 'Gouvernance',
  sites: 'Sites',
  fleet: 'Flotte',
  supply: 'Approvision.',
  tours: 'Tournées',
  compliance: 'Conformité',
  risk: 'Risques',
  reporting: 'Reporting',
}

export function PermissionMatrixScreen() {
  const [filter, setFilter] = useState<PermissionCategory | 'all'>('all')
  const [query, setQuery] = useState('')

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PERMISSION_CATALOG.filter((e) => {
      if (filter !== 'all' && e.category !== filter) return false
      if (!q) return true
      return e.label.toLowerCase().includes(q) || e.code.includes(q)
    })
  }, [filter, query])

  const categories = useMemo(
    () => (filter === 'all' ? PERMISSION_CATEGORIES : PERMISSION_CATEGORIES.filter((c) => c.id === filter)),
    [filter]
  )

  const countByCategory = useMemo(
    () =>
      PERMISSION_CATEGORIES.map((c) => ({
        category: c.id,
        count: PERMISSION_CATALOG.filter((e) => e.category === c.id).length,
      })),
    []
  )

  const grantsByCategory = useMemo(
    () =>
      PERMISSION_CATEGORIES.map((c) => {
        const row: Record<string, number | string> = { category: c.id }
        for (const role of ROLES) {
          row[role] = ROLE_GRANTS[role].filter(
            (code) => getCatalogEntry(code).category === c.id
          ).length
        }
        return row
      }),
    []
  )

  const chartConfig = useMemo(() => {
    const config: ChartConfig = { count: { label: 'Codes', color: 'var(--primary)' } }
    for (const role of ROLES) config[role] = { label: ROLE_LABELS[role], color: ROLE_COLORS[role] }
    return config
  }, [])

  const canManage = ROLES.filter((role) => ROLE_GRANTS[role].includes('permissions.manage'))

  return (
    <PageShell>
      <div className='flex items-center gap-3'>
        <div className='flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
          <ShieldCheck className='size-5' />
        </div>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>Matrice de permissions</h1>
          <p className='text-sm text-muted-foreground'>
            Catalogue unique ({PERMISSION_CATALOG.length} droits) assigné aux rôles système
          </p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <KpiTile label='Droits définis' value={String(PERMISSION_CATALOG.length)} />
        <KpiTile label='Catégories' value={String(PERMISSION_CATEGORIES.length)} />
        <KpiTile label='Rôles applicatifs' value={String(ROLES.length)} />
        <KpiTile label='Rôles gestion matrice' value={String(canManage.length)} />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Codes par catégorie</CardTitle>
            <CardDescription>Répartition des {PERMISSION_CATALOG.length} droits</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
              <BarChart data={countByCategory}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis
                  dataKey='category'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => CATEGORY_SHORT[value as PermissionCategory] ?? value}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        CATEGORY_SHORT[value as PermissionCategory] ?? value
                      }
                    />
                  }
                />
                <Bar dataKey='count' fill='var(--color-count)' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Droits par rôle et catégorie</CardTitle>
            <CardDescription>Volume de droits octroyés, par rôle</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
              <BarChart data={grantsByCategory}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis
                  dataKey='category'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => CATEGORY_SHORT[value as PermissionCategory] ?? value}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        CATEGORY_SHORT[value as PermissionCategory] ?? value
                      }
                    />
                  }
                />
                {ROLES.map((role) => (
                  <Bar
                    key={role}
                    dataKey={role}
                    stackId='a'
                    fill={`var(--color-${role})`}
                    radius={[0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <SectionCard title={`Matrice ${filter === 'all' ? 'complète' : ''}`}>
        <div className='mb-4 flex flex-wrap items-center gap-2'>
          <div className='relative flex-1 min-w-[220px]'>
            <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Rechercher un droit (code ou libellé)…'
              className='pl-9'
            />
          </div>
          <div className='flex flex-wrap gap-1.5'>
            <Button
              key='all'
              size='sm'
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Tous
            </Button>
            {PERMISSION_CATEGORIES.map((c) => (
              <Button
                key={c.id}
                size='sm'
                variant={filter === c.id ? 'default' : 'outline'}
                onClick={() => setFilter(filter === c.id ? 'all' : c.id)}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='min-w-[240px] pb-3 text-left font-medium text-muted-foreground'>
                  Permission
                </th>
                {ROLES.map((role) => (
                  <th key={role} className='pb-3 text-center font-medium text-muted-foreground'>
                    <span className='inline-flex flex-col items-center gap-1'>
                      <span
                        className='size-2.5 rounded-full'
                        style={{ backgroundColor: ROLE_COLORS[role] }}
                      />
                      {ROLE_SHORT[role]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <RoleCategoryBody
                  key={cat.id}
                  categoryLabel={cat.label}
                  count={filter === 'all' ? undefined : entries.length}
                  showHeader={filter === 'all'}
                  rows={entries.filter((e) => e.category === cat.id)}
                />
              ))}
            </tbody>
          </table>
          {entries.length === 0 && (
            <p className='py-8 text-center text-sm text-muted-foreground'>
              Aucun droit ne correspond à cette recherche.
            </p>
          )}
        </div>
      </SectionCard>
    </PageShell>
  )
}

function RoleCategoryBody({
  categoryLabel,
  count,
  showHeader,
  rows,
}: {
  categoryLabel: string
  count?: number
  showHeader: boolean
  rows: (typeof PERMISSION_CATALOG)[number][]
}) {
  if (rows.length === 0 && showHeader) return null

  const head = showHeader ? `${categoryLabel} (${count ?? rows.length})` : categoryLabel
  return (
    <>
      <tr className='border-b bg-muted/40'>
        <td colSpan={ROLES.length + 1} className='px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground'>
          {head}
        </td>
      </tr>
      {rows.map((entry) => {
        return (
          <tr key={entry.code} className='border-b last:border-0 hover:bg-muted/20'>
            <td className='py-2 pr-3'>
              <div className='flex items-center gap-2'>
                <code className='rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground'>
                  {entry.code}
                </code>
                <span className='font-medium'>{entry.label}</span>
              </div>
            </td>
            {ROLES.map((role) => {
              const has = ROLE_GRANTS[role].includes(entry.code)
              return (
                <td key={role} className='py-2 text-center'>
                  {has ? (
                    <Check className='inline size-4 text-emerald-600' data-testid={`grant-${role}-${entry.code}`} />
                  ) : (
                    <Minus className='inline size-3.5 text-muted-foreground/30' />
                  )}
                </td>
              )
            })}
          </tr>
        )
      })}
    </>
  )
}