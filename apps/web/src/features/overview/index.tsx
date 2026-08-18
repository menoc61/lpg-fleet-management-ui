import { useMemo } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { Badge } from '@lpg/ui'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@lpg/ui'
import { Main } from '@/components/layout/main'
import { ROLE_LABELS } from '@/config/rbac/roles'
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