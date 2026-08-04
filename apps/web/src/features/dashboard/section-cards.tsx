import { TrendingDown, TrendingUp } from 'lucide-react'
import { Badge, Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@lpg/ui'
import {
  vehiclesHooks as trucksHooks,
  deliveryToursHooks as toursHooks,
  sitesHooks,
  declarationsHooks,
} from '@/lib/api/use-resources'
import type { DeliveryTour } from '@lpg/types'

interface MetricCard {
  key: string
  title: string
  value: number
  trend: string
  up: boolean
  detail: string
  footer: string
}

export function SectionCards() {
  const trucks = trucksHooks.useList().data ?? []
  const tours = toursHooks.useList().data ?? []
  const sites = sitesHooks.useList().data ?? []
  const declarations = declarationsHooks.useList().data ?? []

  const activeTours = tours.filter((t: DeliveryTour) => t.status === 'INPROGRESS').length

  const cards: MetricCard[] = [
    {
      key: 'trucks',
      title: 'Total camions',
      value: trucks.length,
      trend: '+8.2%',
      up: true,
      footer: 'Flotte enregistrée',
      detail: 'En hausse ce mois',
    },
    {
      key: 'tours',
      title: 'Tournées actives',
      value: activeTours,
      trend: '+12.5%',
      up: true,
      footer: 'En cours de livraison',
      detail: 'En hausse ce mois',
    },
    {
      key: 'sites',
      title: 'Sites',
      value: sites.length,
      trend: '-2.4%',
      up: false,
      footer: 'Sites opérationnels',
      detail: 'En baisse ce mois',
    },
    {
      key: 'declarations',
      title: 'Déclarations',
      value: declarations.length,
      trend: '+24.8%',
      up: true,
      footer: 'Ce mois-ci',
      detail: 'En hausse ce mois',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.key} className="@container/card">
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {card.up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                {card.trend}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.detail}
              {card.up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            </div>
            <div className="text-muted-foreground">{card.footer}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}