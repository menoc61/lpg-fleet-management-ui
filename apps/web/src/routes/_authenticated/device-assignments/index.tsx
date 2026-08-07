import { createFileRoute } from '@tanstack/react-router'
import { DeviceAssignmentsPage } from '@/features/device-assignments'

export const Route = createFileRoute('/_authenticated/device-assignments/')({
  component: DeviceAssignmentsPage,
})