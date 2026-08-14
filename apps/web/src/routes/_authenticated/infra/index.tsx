import { createFileRoute } from '@tanstack/react-router'
import { InfraPage } from '@/features/infra'

export const Route = createFileRoute('/_authenticated/infra/')({
  component: InfraPage,
})