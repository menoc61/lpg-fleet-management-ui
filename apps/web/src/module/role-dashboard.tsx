import { Link } from '@tanstack/react-router'
import { ArrowRight, ShieldCheck, Truck, Users, Activity, Radio, ClipboardList, Building2, Route, ScanLine } from 'lucide-react'
import { Badge } from '@lpg/ui'
import { PERMISSION_CATEGORIES, ROLE_GRANTS, getCatalogEntry } from '@lpg/permissions'
import { type Role, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/config/rbac/roles'
import { getSidebarData } from '@/config/rbac/sidebar-by-role'
import { KpiTile, PageShell, SectionCard } from '@/components/layout/page'

type Kpi = { label: string; value: string; delta?: string; trend?: 'up' | 'down'; icon?: React.ReactNode }

const KPI_BY_ROLE: Record<Role, Kpi[]> = {
  SUPERADMIN: [
    { label: 'Volume national', value: '12 480 t', delta: '+4,2%', trend: 'up' },
    { label: 'Traçabilité', value: '94,1%', delta: '+1,1%', trend: 'up' },
    { label: 'Anomalies', value: '37', delta: '-8', trend: 'down' },
    { label: 'Subventions', value: '1,2 Md FCFA', delta: '+2,4%', trend: 'up' },
  ],
  ADMIN: [
    { label: 'Utilisateurs actifs', value: '312', delta: '+12', trend: 'up' },
    { label: 'Déclarations', value: '28', delta: '+5', trend: 'up' },
    { label: 'Marketeurs', value: '46', delta: '—', trend: 'up' },
    { label: 'Règles', value: '18', delta: '+2', trend: 'up' },
  ],
  SUPERVISOR: [
    { label: 'Disponibilité', value: '99,5%', delta: '—', trend: 'up' },
    { label: 'PDA hors-ligne', value: '7', delta: '+3', trend: 'down' },
    { label: 'Alertes', value: '4', delta: '-2', trend: 'down' },
    { label: 'Requêtes/s', value: '1 240', delta: '+5%', trend: 'up' },
  ],
  INTEGRATEUR: [
    { label: 'PDA actifs', value: '218', delta: '+9', trend: 'up' },
    { label: 'Échecs GPS', value: '3', delta: '-1', trend: 'down' },
    { label: 'Batteries', value: '11', delta: '+4', trend: 'down' },
    { label: 'Non synchronisés', value: '7', delta: '+2', trend: 'down' },
  ],
  AGENT: [
    { label: 'Marketeurs', value: '12', delta: '—', trend: 'up' },
    { label: 'En attente', value: '9', delta: '+3', trend: 'up' },
    { label: 'Anomalies', value: '14', delta: '-2', trend: 'down' },
    { label: 'Visites/mois', value: '23', delta: '+6', trend: 'up' },
  ],
  MARKETEUR: [
    { label: 'Camions', value: '18', delta: '+1', trend: 'up' },
    { label: 'En cours', value: '5', delta: '+2', trend: 'up' },
    { label: 'Quota', value: '42 t', delta: '-3%', trend: 'down' },
    { label: 'Livraisons', value: '1 380', delta: '+9%', trend: 'up' },
  ],
  TRANSPORTEUR: [
    { label: 'Tournées', value: '4', delta: '+1', trend: 'up', icon: <Route className='size-4 text-orange-600 dark:text-orange-400' /> },
    { label: 'Camions', value: '9', delta: '—', trend: 'up', icon: <Truck className='size-4 text-orange-600 dark:text-orange-400' /> },
    { label: 'Chauffeurs', value: '12', delta: '+1', trend: 'up', icon: <Users className='size-4 text-orange-600 dark:text-orange-400' /> },
    { label: 'Scans', value: '212', delta: '+24', trend: 'up', icon: <ScanLine className='size-4 text-orange-600 dark:text-orange-400' /> },
  ],
}

const ROLE_ICON: Record<Role, React.ComponentType<{ className?: string }>> = {
  SUPERADMIN: ShieldCheck,
  ADMIN: Users,
  SUPERVISOR: Activity,
  INTEGRATEUR: Radio,
  AGENT: ClipboardList,
  MARKETEUR: Building2,
  TRANSPORTEUR: Truck,
}

const ROLE_COLOR: Record<Role, string> = {
  SUPERADMIN: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  ADMIN: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  SUPERVISOR: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  INTEGRATEUR: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  AGENT: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  MARKETEUR: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  TRANSPORTEUR: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
}

export function RoleDashboard({ role }: { role: Role }) {
  const sidebar = getSidebarData(role)
  const kpis = KPI_BY_ROLE[role]
  const Icon = ROLE_ICON[role]

  return (
    <PageShell>
      <div className='flex items-center gap-3'>
        <div className={`flex size-10 items-center justify-center rounded-xl ${ROLE_COLOR[role]}`}>
          <Icon className='size-5' />
        </div>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>{ROLE_LABELS[role]}</h1>
          <p className='text-sm text-muted-foreground'>{ROLE_DESCRIPTIONS[role]}</p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {kpis.map((kpi) => (
          <KpiTile key={kpi.label} label={kpi.label} value={kpi.value} delta={kpi.delta} trend={kpi.trend} symbol={kpi.icon} />
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        {sidebar.navGroups.map((group) => (
          <SectionCard key={group.title} title={group.title}>
            <div className='grid gap-0.5'>
              {group.items
                .filter((item) => !!item.url)
                .map((item) => (
                  <Link
                    key={item.title + item.url}
                    to={item.url as never}
                      className='group flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  >
                    <span className='flex items-center gap-2.5'>
                      {item.icon && (
                        <span className='flex size-7 items-center justify-center rounded-md bg-muted/60'>
                          <item.icon className='size-3.5 text-muted-foreground' />
                        </span>
                      )}
                      <span className='font-medium'>{item.title}</span>
                    </span>
                    <ArrowRight className='size-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5' />
                  </Link>
                ))}
            </div>
          </SectionCard>
        ))}
      </div>

      <SectionCard title={`Mes permissions (${ROLE_GRANTS[role].length})`}>
        <div className='space-y-4'>
          {PERMISSION_CATEGORIES.map((cat) => {
            const codes = ROLE_GRANTS[role].filter(
              (code) => getCatalogEntry(code).category === cat.id
            )
            if (codes.length === 0) return null
            return (
              <div key={cat.id}>
                <div className='mb-1.5 flex items-center justify-between'>
                  <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    {cat.label}
                  </p>
                  <span className='text-xs text-muted-foreground'>{codes.length}</span>
                </div>
                <div className='flex flex-wrap gap-1.5'>
                  {codes.map((code) => (
                    <Badge key={code} variant='outline' className='font-normal'>
                      {getCatalogEntry(code).label}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </PageShell>
  )
}
