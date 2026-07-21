import { type ElementType, useMemo } from 'react'
import { FileText, Fuel, Route, Truck } from 'lucide-react'
import { Card, CardContent, Skeleton } from '@lpg/ui'
import { trucksHooks, toursHooks, sitesHooks, declarationsHooks } from '@/lib/api/use-resources'

type StatCard = {
  id: string
  label: string
  count: number
  icon: ElementType
  gradient: string
}

export function StatsOverviewCards() {
  const { data: trucksResult, isPending: trucksPending } = trucksHooks.useList({ page: 1, limite: 100 })
  const { data: toursResult, isPending: toursPending } = toursHooks.useList({ page: 1, limite: 100 })
  const { data: sitesResult, isPending: sitesPending } = sitesHooks.useList({ page: 1, limite: 100 })
  const { data: declarationsResult, isPending: declarationsPending } = declarationsHooks.useList({ page: 1, limite: 100 })

  const stats: StatCard[] = useMemo(() => {
    const trucksData = trucksResult?.data ?? []
    const toursData = toursResult?.data ?? []
    const sitesData = sitesResult?.data ?? []
    const declarationsData = declarationsResult?.data ?? []

    return [
      {
        id: 'trucks',
        label: 'Total camions',
        count: trucksData.length,
        icon: Truck,
        gradient: 'from-sky-400 to-sky-600',
      },
      {
        id: 'tours',
        label: 'Tournées actives',
        count: toursData.filter((t) => t.status === 'in_progress').length,
        icon: Route,
        gradient: 'from-emerald-400 to-emerald-600',
      },
      {
        id: 'sites',
        label: 'Citernes',
        count: sitesData.length,
        icon: Fuel,
        gradient: 'from-amber-400 to-amber-600',
      },
      {
        id: 'declarations',
        label: 'Déclarations',
        count: declarationsData.length,
        icon: FileText,
        gradient: 'from-violet-400 to-violet-600',
      },
    ]
  }, [trucksResult, toursResult, sitesResult, declarationsResult])

  const loading = trucksPending || toursPending || sitesPending || declarationsPending

  if (loading) {
    return (
      <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='overflow-hidden rounded-2xl border-border/60 shadow-none'>
            <div className='h-1.5 bg-muted' />
            <CardContent className='flex items-center gap-4 pt-5'>
              <Skeleton className='size-12 rounded-xl' />
              <div className='min-w-0 space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-8 w-12' />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    )
  }

  return (
    <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat) => (
        <Card key={stat.id} className='overflow-hidden rounded-2xl border-border/60 shadow-none'>
          <div className={`h-1.5 bg-gradient-to-r ${stat.gradient}`} />
          <CardContent className='flex items-center gap-4 pt-5'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted/40'>
              <stat.icon className='size-5 text-muted-foreground' />
            </div>
            <div className='min-w-0'>
              <p className='text-sm text-muted-foreground'>{stat.label}</p>
              <p className='text-3xl font-semibold tracking-tight'>{stat.count}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
