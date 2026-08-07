import { createFileRoute } from '@tanstack/react-router'
import { RecomputePage } from '@/features/recompute'

export const Route = createFileRoute('/_authenticated/recompute/')({
  component: RecomputePage,
})