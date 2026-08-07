import { createFileRoute, redirect } from '@tanstack/react-router'
import { useRoleStore } from '@/store/role-store'
import { landingPathFor } from '@/config/rbac/sidebar-by-role'

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: () => {
    const role = useRoleStore.getState().activeRole
    throw redirect({ to: landingPathFor(role) })
  },
})
