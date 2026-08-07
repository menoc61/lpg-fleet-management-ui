import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/store/auth-store'
import { type Role } from '@/config/rbac/roles'
import { deniedPathRedirect } from '@/config/rbac/route-access'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { accessToken, hydrateSession } = useAuthStore.getState()
    if (!accessToken) {
      await hydrateSession()
    }
    const auth = useAuthStore.getState()
    const token = auth.accessToken
    if (!token) {
      throw redirect({
        to: '/login',
      })
    }

    // Defense-in-depth: nav visibility alone must not guarantee access.
    const role = auth.user?.system_role as Role | undefined
    if (role) {
      const deniedTo = deniedPathRedirect(role, location.pathname)
      if (deniedTo) throw redirect({ to: deniedTo })
    }
  },
  component: AuthenticatedLayout,
})
