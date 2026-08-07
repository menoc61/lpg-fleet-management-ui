import { createFileRoute } from '@tanstack/react-router'
import { AlertRulesPage } from '@/features/alert-rules'

export const Route = createFileRoute('/_authenticated/alert-rules/')({
  component: AlertRulesPage,
})