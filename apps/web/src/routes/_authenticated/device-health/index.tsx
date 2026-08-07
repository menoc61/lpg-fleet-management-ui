import { createFileRoute } from '@tanstack/react-router'
import { DeviceHealthPage } from '@/features/device-health'

export const Route = createFileRoute('/_authenticated/device-health/')({
  component: DeviceHealthPage,
})