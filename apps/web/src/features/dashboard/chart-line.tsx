import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@lpg/ui'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@lpg/ui'
import { deliveryToursHooks as toursHooks } from '@/lib/api/use-resources'
import type { DeliveryTour } from '@lpg/types'

const chartConfig = {
  CLOSED: { label: 'Terminées', color: 'var(--chart-1)' },
  PLANNED: { label: 'Planifiées', color: 'var(--chart-2)' },
} satisfies ChartConfig

interface ChartPoint {
  date: string
  CLOSED: number
  PLANNED: number
}

export function ChartLine() {
  const tours = toursHooks.useList().data ?? []

  const chartData = useMemo<ChartPoint[]>(() => {
    if (tours.length === 0) return []
    const closedByDate = new Map<string, number>()
    const plannedByDate = new Map<string, number>()
    for (const tour of tours as DeliveryTour[]) {
      const date = (tour.created_at ?? '').split('T')[0]
      if (!date) continue
      const bucket = tour.status === 'CLOSED' ? closedByDate : plannedByDate
      bucket.set(date, (bucket.get(date) ?? 0) + 1)
    }
    const allDates = new Set<string>([...closedByDate.keys(), ...plannedByDate.keys()])
    return Array.from(allDates)
      .sort()
      .map((date) => ({
        date,
        CLOSED: closedByDate.get(date) ?? 0,
        PLANNED: plannedByDate.get(date) ?? 0,
      }))
  }, [tours])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des tournées</CardTitle>
        <CardDescription>Tournées planifiées vs terminées par jour</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) =>
                new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
              }
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Line
              dataKey="PLANNED"
              type="monotone"
              stroke="var(--color-PLANNED)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="CLOSED"
              type="monotone"
              stroke="var(--color-CLOSED)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}