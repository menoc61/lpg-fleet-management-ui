import { createFileRoute } from '@tanstack/react-router'
import { PickupTrackingPage } from '@/features/pickup-tracking'

export const Route = createFileRoute('/_authenticated/pickup-tracking/')({
  component: PickupTrackingPage,
})