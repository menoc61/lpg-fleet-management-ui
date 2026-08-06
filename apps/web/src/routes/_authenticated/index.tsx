import { createFileRoute, redirect } from '@tanstack/react-router'
import { useRoleStore } from '@/store/role-store'

const LANDING_BY_ROLE: Record<string, string> = {
  SUPERADMIN: '/dashboard',
  MARKETEUR: '/marketers',
  TRANSPORTEUR: '/transporters',
}

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: () => {
    const role = useRoleStore.getState().activeRole
    const landing = LANDING_BY_ROLE[role] ?? '/trucks'
    throw redirect({ to: landing })
  },
})
