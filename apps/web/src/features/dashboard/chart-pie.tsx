import { Pie, PieChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@lpg/ui'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@lpg/ui'
import { vehiclesHooks as trucksHooks } from '@/lib/api/use-resources'

const chartConfig = {
  AVAILABLE: { label: 'Disponible', color: 'var(--chart-1)' },
  IN_TRANSIT: { label: 'En livraison', color: 'var(--chart-2)' },
  MAINTENANCE: { label: 'Maintenance', color: 'var(--chart-3)' },
  INACTIVE: { label: 'Inactif', color: 'var(--chart-4)' },
} satisfies ChartConfig

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponible',
  IN_TRANSIT: 'En livraison',
  MAINTENANCE: 'Maintenance',
  INACTIVE: 'Inactif',
}

interface ChartRow {
  status: string
  count: number
  fill: string
}

export function ChartPie() {
  const trucks = trucksHooks.useList().data ?? []

  const grouped = new Map<string, number>()
  for (const truck of trucks) {
    const key = truck.status
    grouped.set(key, (grouped.get(key) ?? 0) + 1)
  }
  const chartData: ChartRow[] = Array.from(grouped, ([status, count]) => ({
    status,
    count,
    fill: `var(--color-${status})`,
  }))

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Statut de la flotte</CardTitle>
        <CardDescription>Répartition des camions par état</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => STATUS_LABELS[value] ?? value}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={3}
              strokeWidth={0}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}