import { type ElementType } from 'react'
import { FileText, Fuel, Route, Truck } from 'lucide-react'
import { Card, CardContent } from '@lpg/ui'

type StatCard = {
  id: string
  label: string
  count: number
  icon: ElementType
  gradient: string
}

const stats: StatCard[] = [
  {
    id: 'trucks',
    label: 'Total camions',
    count: 8,
    icon: Truck,
    gradient: 'from-sky-400 to-sky-600',
  },
  {
    id: 'tours',
    label: 'Tournées actives',
    count: 2,
    icon: Route,
    gradient: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 'sites',
    label: 'Citernes',
    count: 8,
    icon: Fuel,
    gradient: 'from-amber-400 to-amber-600',
  },
  {
    id: 'declarations',
    label: 'Déclarations',
    count: 5,
    icon: FileText,
    gradient: 'from-violet-400 to-violet-600',
  },
]

export function StatsOverviewCards() {
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
