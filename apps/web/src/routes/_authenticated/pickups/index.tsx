import { createFileRoute } from '@tanstack/react-router'
import { PickupsPage } from '@/features/pickups'

export const Route = createFileRoute('/_authenticated/pickups/')({
  component: () => <PickupsPage role='SUPERADMIN' />,
})