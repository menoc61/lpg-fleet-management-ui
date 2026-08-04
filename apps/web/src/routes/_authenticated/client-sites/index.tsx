import { createFileRoute } from '@tanstack/react-router'
import { SitesScreen } from '@/features/sites'

export const Route = createFileRoute('/_authenticated/client-sites/')({
  component: () => <SitesScreen kind='client_site' role='SUPERADMIN' />,
})
