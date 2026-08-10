import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ToursPage } from '@/features/tours'

const toursSearchSchema = z.object({
  tour: z.string().optional().catch(undefined),
})

function ToursRouteComponent() {
  const { tour } = Route.useSearch()
  return <ToursPage slice='ALL' initialTourId={tour} />
}

export const Route = createFileRoute('/_authenticated/tours/')({
  validateSearch: toursSearchSchema,
  component: ToursRouteComponent,
})
