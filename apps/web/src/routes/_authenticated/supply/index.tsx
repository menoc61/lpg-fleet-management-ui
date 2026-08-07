import { createFileRoute } from '@tanstack/react-router'
import { SupplyRequestPage } from '@/features/supply'

export const Route = createFileRoute('/_authenticated/supply/')({
  component: SupplyRequestPage,
})