import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { ROLE_LABELS } from '@/config/rbac/roles'
import { getSidebarData } from '@/config/rbac/sidebar-by-role'
import { useRoleStore } from '@/store/role-store'
import { getOverviewCards, type OverviewCard } from './data/overview'
import { formatTm } from '@/features/map/utils/format'
import type { Role } from '@/config/rbac/roles'
import type { DashboardView } from '@/features/dashboard/data/dashboard'

export function OverviewPage({
  role,
  dashboard,
}: {
  role?: Role
  dashboard?: DashboardView
}) {
  const storeRole = useRoleStore((s) => s.activeRole)
  const activeRole = role ?? storeRole
  const cards = useMemo(() => getOverviewCards(activeRole), [activeRole])
  const roleLabel = ROLE_LABELS[activeRole] ?? activeRole

  const quickLinks = useMemo(() => {
    const sidebar = getSidebarData(activeRole)
    return sidebar.navGroups.flatMap((group) =>
      group.items.flatMap((item) =>
        'items' in item
          ? (item.items ?? []).map((sub) => ({
              title: sub.title,
              url: sub.url,
              icon: sub.icon,
            }))
          : [{ title: item.title, url: item.url, icon: item.icon }],
      ),
    )
  }, [activeRole])

  return (
    <Main fluid className='space-y-6 bg-muted/20'>
      <section className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-xl border bg-muted/30'>
              <LayoutDashboard className='size-5 text-primary' />
            </div>
            <h1 className='font-manrope text-3xl font-semibold tracking-tight'>
              Vue d&apos;ensemble
            </h1>
          </div>
          <p className='max-w-3xl text-sm text-muted-foreground sm:text-base'>
            Indicateurs clés consolidés pour votre rôle.
          </p>
        </div>

        <Badge
          variant='outline'
          className='w-fit rounded-xl border-transparent bg-muted/40 px-3 py-2 text-foreground'
        >
          {roleLabel}
        </Badge>
      </section>

      {dashboard ? (
        <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Metric value={formatTm(dashboard.overview.totalTransportedTM)} label='Transporté' />
          <Metric value={formatTm(dashboard.overview.totalDeliveredTM)} label='Livré' />
          <Metric
            value={String(dashboard.overview.activeTrips + dashboard.overview.plannedTrips)}
            label='Tournées'
          />
          <Metric value={String(dashboard.overview.openAlerts)} label='Alertes ouvertes' />
        </section>
      ) : null}

      <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {cards.map((card) => (
          <OverviewCardItem key={card.id} card={card} />
        ))}
      </section>

      <section>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-lg font-semibold tracking-tight'>Accès rapides</h2>
          <span className='text-xs text-muted-foreground'>
            Raccourcis vers vos modules
          </span>
        </div>
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {quickLinks.map((link) => (
            <Link
              key={String(link.url)}
              to={link.url as never}
              className='group flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background px-3 py-2.5 transition-colors hover:bg-muted/50'
            >
              <span className='flex min-w-0 items-center gap-2 text-sm'>
                {link.icon ? <link.icon className='size-4 shrink-0 text-primary' /> : null}
                <span className='truncate'>{link.title}</span>
              </span>
              <ArrowRight className='size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
            </Link>
          ))}
        </div>
      </section>
    </Main>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <Card className='rounded-2xl border-border/60 shadow-none'>
      <CardContent className='p-4'>
        <p className='text-xl font-semibold tracking-tight'>{value}</p>
        <p className='mt-1 text-xs text-muted-foreground'>{label}</p>
      </CardContent>
    </Card>
  )
}

function OverviewCardItem({ card }: { card: OverviewCard }) {
  return (
    <Card className='flex h-full flex-col rounded-2xl border-border/60 shadow-none transition-colors'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-medium'>{card.label}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col justify-between gap-3'>
        <p className='text-4xl font-semibold tracking-tight'>{card.value}</p>
        <CardDescription>{card.detail}</CardDescription>
      </CardContent>
    </Card>
  )
}
