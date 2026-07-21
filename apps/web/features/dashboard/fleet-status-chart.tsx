import { useMemo } from 'react'
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
  Skeleton,
} from '@lpg/ui'
import { trucksHooks } from '@/lib/api/use-resources'

const chartConfig = {
  available: { label: 'Disponible', color: 'var(--chart-1)' },
  in_transit: { label: 'En transit', color: 'var(--chart-2)' },
  maintenance: { label: 'Maintenance', color: 'var(--chart-3)' },
  inactive: { label: 'Inactif', color: 'var(--chart-4)' },
} satisfies ChartConfig

const statusFillMap: Record<string, string> = {
  available: 'var(--color-available)',
  in_transit: 'var(--color-in_transit)',
  maintenance: 'var(--color-maintenance)',
  inactive: 'var(--color-inactive)',
}

export function FleetStatusChart() {
  const { data: trucksResult, isPending } = trucksHooks.useList({ page: 1, limite: 100 })

  const data = useMemo(() => {
    const trucks = (trucksResult?.data as Array<{ status: string }> | undefined) ?? []
    const counts: Record<string, number> = {
      available: 0,
      in_transit: 0,
      maintenance: 0,
      inactive: 0,
    }
    for (const t of trucks) {
      if (counts[t.status] !== undefined) {
        counts[t.status]++
      }
    }
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      fill: statusFillMap[status] ?? 'var(--color-available)',
    }))
  }, [trucksResult])

  if (isPending) {
    return (
      <Card className='rounded-2xl border-border/60 shadow-none'>
        <CardHeader>
          <CardTitle>État de la flotte</CardTitle>
        </CardHeader>
        <CardContent className='flex items-center justify-center'>
          <Skeleton className='size-[220px] rounded-full' />
        </CardContent>
      </Card>
    )
  }

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
