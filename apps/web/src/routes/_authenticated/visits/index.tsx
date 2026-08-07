import { createFileRoute } from '@tanstack/react-router'
import { VisitsPage } from '@/features/visits'

export const Route = createFileRoute('/_authenticated/visits/')({
  component: VisitsPage,
})