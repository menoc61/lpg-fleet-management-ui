import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useRoleStore } from '@/store/role-store'
import { useAuthStore } from '@/store/auth-store'
import { getScope } from '@/features/scope/scope'
import { buildDashboardView } from '@/features/dashboard/data/dashboard'
import { OverviewPage } from '@/features/overview'

function OverviewRouteComponent() {
  const role = useRoleStore((s) => s.activeRole)
  const user = useAuthStore((s) => s.user)
  const scope = useMemo(() => getScope(user), [user])
  const dashboard = useMemo(() => buildDashboardView(role, scope), [role, scope])
  return <OverviewPage role={role} dashboard={dashboard} />
}

export const Route = createFileRoute('/_authenticated/overview/')({
  component: OverviewRouteComponent,
})