import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { type Role, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/config/rbac/roles'
import { getSidebarData } from '@/config/rbac/sidebar-by-role'
import { PageHeader } from '@/components/layout/page-header'
import { KpiTile, PageShell, SectionCard } from '@/components/layout/page'

type Kpi = { label: string; value: string; delta?: string; trend?: 'up' | 'down' }

const KPI_BY_ROLE: Record<Role, Kpi[]> = {
  SUPER_ADMIN: [
    { label: 'Volumes trackés', value: '12 480 t', delta: '+4,2%', trend: 'up' },
    { label: 'Taux de traçabilité', value: '94,1%', delta: '+1,1%', trend: 'up' },
    { label: 'Anomalies ouvertes', value: '37', delta: '-8', trend: 'down' },
    { label: 'Subventions', value: '1,2 Md XAF', delta: '+2,4%', trend: 'up' },
  ],
  ADMIN: [
    { label: 'Utilisateurs', value: '312', delta: '+12', trend: 'up' },
    { label: 'Déclarations en attente', value: '28', delta: '+5', trend: 'up' },
    { label: 'Marketeurs', value: '46', delta: '0', trend: 'up' },
    { label: 'Règles actives', value: '18', delta: '+2', trend: 'up' },
  ],
  SUPERVISOR: [
    { label: 'Disponibilité', value: '99,5%', delta: 'stable', trend: 'up' },
    { label: 'PDA hors-ligne', value: '7', delta: '+3', trend: 'down' },
    { label: 'Alertes critiques', value: '4', delta: '-2', trend: 'down' },
    { label: 'Requêtes/s', value: '1 240', delta: '+5%', trend: 'up' },
  ],
  INTEGRATEUR: [
    { label: 'PDA actifs', value: '218', delta: '+9', trend: 'up' },
    { label: 'Échecs GPS', value: '3', delta: '-1', trend: 'down' },
    { label: 'Batteries faibles', value: '11', delta: '+4', trend: 'down' },
    { label: 'Appareils non sync', value: '7', delta: '+2', trend: 'down' },
  ],
  AGENT: [
    { label: 'Mes marketeurs', value: '12', delta: '0', trend: 'up' },
    { label: 'Déclarations à valider', value: '9', delta: '+3', trend: 'up' },
    { label: 'Anomalies', value: '14', delta: '-2', trend: 'down' },
    { label: 'Visites ce mois', value: '23', delta: '+6', trend: 'up' },
  ],
  MARKETEUR: [
    { label: 'Camions dispo.', value: '18', delta: '+1', trend: 'up' },
    { label: 'Tournées en cours', value: '5', delta: '+2', trend: 'up' },
    { label: 'Quota restant', value: '42 t', delta: '-3%', trend: 'down' },
    { label: 'Livraisons/mois', value: '1 380', delta: '+9%', trend: 'up' },
  ],
  LIVREUR: [
    { label: 'Missions du jour', value: '6', delta: '0', trend: 'up' },
    { label: 'Bouteilles OUT', value: '48', delta: '+12', trend: 'up' },
    { label: 'Bouteilles IN', value: '41', delta: '+9', trend: 'up' },
    { label: 'Sync PDA', value: '92%', delta: '+4%', trend: 'up' },
  ],
}

export function RoleDashboard({ role }: { role: Role }) {
  const sidebar = getSidebarData(role)
  const kpis = KPI_BY_ROLE[role]

  return (
    <PageShell>
      <PageHeader
        title={`Tableau de bord — ${ROLE_LABELS[role]}`}
        description={ROLE_DESCRIPTIONS[role]}
      />

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {kpis.map((kpi) => (
          <KpiTile key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {sidebar.navGroups.map((group) => (
          <SectionCard key={group.title} title={group.title}>
            <div className='grid gap-2'>
              {group.items
                .filter((item) => !!item.url)
                .map((item) => (
                  <Link
                    key={item.title + item.url}
                    to={item.url as never}
                    className='group flex items-center justify-between rounded-lg border border-transparent px-3 py-2 hover:border-border hover:bg-muted/50'
                  >
                    <span className='flex items-center gap-2 text-sm'>
                      {item.icon && <item.icon className='size-4 text-muted-foreground' />}
                      {item.title}
                    </span>
                    <ArrowRight className='size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100' />
                  </Link>
                ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </PageShell>
  )
}
