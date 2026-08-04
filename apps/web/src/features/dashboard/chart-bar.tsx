import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@lpg/ui'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@lpg/ui'
import { deliveryToursHooks as toursHooks } from '@/lib/api/use-resources'

const chartConfig = {
  count: { label: 'Tournées', color: 'var(--primary)' },
} satisfies ChartConfig

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  PLANNED: 'Planifiée',
  PENDINGTRANSPORTERACK: 'En attente d\'accusé',
  ACKNOWLEDGED: 'Accusée',
  INPROGRESS: 'En cours',
  CHECKPOINTACTIVE: 'Checkpoint actif',
  CLOSED: 'Clôturée',
  CANCELLED: 'Annulée',
}

interface ChartRow {
  status: string
  count: number
}

export function ChartBar() {
  const tours = toursHooks.useList().data ?? []

  const grouped = new Map<string, number>()
  for (const tour of tours) {
    const key = tour.status ?? 'unknown'
    grouped.set(key, (grouped.get(key) ?? 0) + 1)
  }

  const chartData: ChartRow[] = Array.from(grouped, ([status, count]) => ({ status, count }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tournées par statut</CardTitle>
        <CardDescription>Répartition des tournées actives et terminées</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="status"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => STATUS_LABELS[value] ?? value}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => STATUS_LABELS[value] ?? value}
                />
              }
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}