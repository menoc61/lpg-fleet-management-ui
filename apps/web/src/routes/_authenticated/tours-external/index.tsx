import { createFileRoute } from '@tanstack/react-router'
import { ToursPage } from '@/features/tours'

export const Route = createFileRoute('/_authenticated/tours-external/')({
  component: () => <ToursPage slice='EXTERNAL' />,
})