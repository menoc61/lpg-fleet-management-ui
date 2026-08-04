import { createFileRoute } from '@tanstack/react-router'
import { SiteVerificationsScreen } from '@/features/sites'

export const Route = createFileRoute('/_authenticated/site-verifications/')({
  component: () => <SiteVerificationsScreen role='AGENT' />,
})
