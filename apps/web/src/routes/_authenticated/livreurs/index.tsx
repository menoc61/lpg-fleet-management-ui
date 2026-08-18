import { createFileRoute, redirect } from '@tanstack/react-router'
import { landingPathFor } from '@/config/rbac/sidebar-by-role'
import { LivreursPage } from '@/features/livreurs'
import { hasPermission } from '@lpg/permissions'
import { useRoleStore } from '@/store/role-store'

export const Route = createFileRoute('/_authenticated/livreurs/')({
  beforeLoad: () => {
    const role = useRoleStore.getState().activeRole
    if (!hasPermission(role, 'livreurs.read')) {
      throw redirect({ to: landingPathFor(role) })
    }
  },
  component: LivreursPage,
})
