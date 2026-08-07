import { createFileRoute } from '@tanstack/react-router'
import { RiskScoresPage } from '@/features/risks'

export const Route = createFileRoute('/_authenticated/risks/')({
  component: RiskScoresPage,
})