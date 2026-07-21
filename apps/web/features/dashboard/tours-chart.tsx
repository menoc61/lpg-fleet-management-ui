import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Skeleton,
} from '@lpg/ui'
import { toursHooks } from '@/lib/api/use-resources'

const chartConfig = {
  planned: { label: 'Planifiée', color: 'var(--chart-1)' },
  in_progress: { label: 'En cours', color: 'var(--chart-2)' },
  completed: { label: 'Terminée', color: 'var(--chart-3)' },
  cancelled: { label: 'Annulée', color: 'var(--chart-4)' },
} satisfies ChartConfig

export function ToursChart() {
  const { data: toursResult, isPending } = toursHooks.useList({ page: 1, limite: 100 })

  const data = useMemo(() => {
    const tours = (toursResult?.data ?? []) as Array<{ status: string }>
    const counts: Record<string, number> = {
      planned: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    }
    for (const t of tours) {
      if (counts[t.status] !== undefined) {
        counts[t.status]++
      }
    }
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
    }))
  }, [toursResult])

  if (isPending) {
    return (
      <Card className='rounded-2xl border-border/60 shadow-none'>
        <CardHeader>
          <CardTitle>Tournées par statut</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-10 w-full rounded-lg' />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='rounded-2xl border-border/60 shadow-none'>
      <CardHeader>
        <CardTitle>Tournées par statut</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='max-h-[280px] w-full'>
          <BarChart data={data} barCategoryGap={18}>
            <CartesianGrid
              stroke='rgba(148, 163, 184, 0.18)'
              strokeDasharray='4 6'
              vertical={false}
            />
            <XAxis
              dataKey='status'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label ?? value
              }
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey='count'
              radius={[10, 10, 0, 0]}
              fill='var(--color-planned)'
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
