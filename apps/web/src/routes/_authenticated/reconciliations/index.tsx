import { createFileRoute } from '@tanstack/react-router'
import { ReconciliationsPage } from '@/features/reconciliations'

export const Route = createFileRoute('/_authenticated/reconciliations/')({
  component: ReconciliationsPage,
})