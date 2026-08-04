import { createFileRoute } from '@tanstack/react-router'
import { roleFromSlug } from '@/config/rbac/sidebar-by-role'
import { SuperAdminOverviewScreen } from '@/roles/super-admin/overview-screen'

export const Route = createFileRoute('/_authenticated/$role/dashboard')({
  component: DashboardWrapper,
})

function DashboardWrapper() {
  const { role } = Route.useParams()
  const resolved = roleFromSlug(role)

  if (!resolved) {
    return (
      <main id='main-content' className='flex-1 p-6'>
        <p className='text-sm text-muted-foreground'>Rôle inconnu : {role}</p>
      </main>
    )
  }

  if (resolved === 'SUPER_ADMIN') {
    return <SuperAdminOverviewScreen />
  }

  return (
    <main id='main-content' className='flex-1 p-6'>
      <p className='text-sm text-muted-foreground'>Tableau de bord non disponible pour ce rôle.</p>
    </main>
  )
}
