import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { VehiclesPage } from '@/features/vehicles'

const vehiclesSearchSchema = z.object({
  q: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/vehicles/')({
  validateSearch: vehiclesSearchSchema,
  component: VehiclesPage,
})