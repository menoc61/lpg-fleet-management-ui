import { createFileRoute } from '@tanstack/react-router'
import { ToursPage } from '@/features/super-admin'

export const Route = createFileRoute('/_authenticated/super-admin/tours/')({
  component: ToursPage,
})