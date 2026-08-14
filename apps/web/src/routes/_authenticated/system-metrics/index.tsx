import { createFileRoute } from '@tanstack/react-router'
import { SystemMetricsPage } from '@/features/system-metrics'

export const Route = createFileRoute('/_authenticated/system-metrics/')({
  component: SystemMetricsPage,
})