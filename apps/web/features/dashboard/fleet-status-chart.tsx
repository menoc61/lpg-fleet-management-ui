import { Cell, Pie, PieChart } from 'recharts'
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
  available: { label: 'Disponible', color: 'var(--chart-1)' },
  in_transit: { label: 'En transit', color: 'var(--chart-2)' },
  maintenance: { label: 'Maintenance', color: 'var(--chart-3)' },
  inactive: { label: 'Inactif', color: 'var(--chart-4)' },
} satisfies ChartConfig

const data = [
  { status: 'available', count: 3, fill: 'var(--color-available)' },
  { status: 'in_transit', count: 2, fill: 'var(--color-in_transit)' },
  { status: 'maintenance', count: 2, fill: 'var(--color-maintenance)' },
  { status: 'inactive', count: 1, fill: 'var(--color-inactive)' },
]

export function FleetStatusChart() {
  return (
    <Card className='rounded-2xl border-border/60 shadow-none'>
      <CardHeader>
        <CardTitle>État de la flotte</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='mx-auto aspect-square max-h-[280px]'>
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey='count'
              nameKey='status'
              innerRadius={60}
              outerRadius={110}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
