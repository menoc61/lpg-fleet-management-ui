import { createFileRoute } from '@tanstack/react-router'
import { QuotasPage } from '@/features/quotas'

export const Route = createFileRoute('/_authenticated/quotas/')({
  component: QuotasPage,
})