import { createFileRoute } from '@tanstack/react-router'
import { SitesScreen } from '@/features/sites'

export const Route = createFileRoute('/_authenticated/sites/')({
  component: () => <SitesScreen kind='site' role='SUPERADMIN' />,
})
