import { createFileRoute } from '@tanstack/react-router'
import { DepotsPage } from '@/features/depots'

export const Route = createFileRoute('/_authenticated/depots/')({
  component: DepotsPage,
})