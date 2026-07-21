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
} from '@lpg/ui'

const chartConfig = {
  planned: { label: 'Planifiée', color: 'var(--chart-1)' },
  in_progress: { label: 'En cours', color: 'var(--chart-2)' },
  completed: { label: 'Terminée', color: 'var(--chart-3)' },
  cancelled: { label: 'Annulée', color: 'var(--chart-4)' },
} satisfies ChartConfig

const data = [
  { status: 'planned', count: 2 },
  { status: 'in_progress', count: 1 },
  { status: 'completed', count: 1 },
  { status: 'cancelled', count: 1 },
]

export function ToursChart() {
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
