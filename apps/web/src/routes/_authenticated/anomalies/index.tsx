import { createFileRoute } from '@tanstack/react-router'
import { AnomaliesPage } from '@/features/anomalies'

export const Route = createFileRoute('/_authenticated/anomalies/')({
  component: () => <AnomaliesPage track='ALL' />,
})