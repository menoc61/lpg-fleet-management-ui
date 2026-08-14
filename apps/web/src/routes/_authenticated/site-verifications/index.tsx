import { createFileRoute } from '@tanstack/react-router'
import { SiteVerificationsScreen } from '@/features/sites'
import { useAuthStore } from '@/store/auth-store'
import type { SiteRole } from '@/features/sites/lib/site-status-machine'

function SiteVerificationsRouteComponent() {
  const role = useAuthStore((s) => s.user?.system_role) as SiteRole | undefined
  return <SiteVerificationsScreen role={role ?? 'AGENT'} />
}

export const Route = createFileRoute('/_authenticated/site-verifications/')({
  component: SiteVerificationsRouteComponent,
})