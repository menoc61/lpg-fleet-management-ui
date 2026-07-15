import { createFileRoute } from '@tanstack/react-router'
import { ModuleScreen } from '@/module/module-screen'
import { roleFromSlug } from '@/config/rbac/sidebar-by-role'
import { getCustomScreen } from '@/module/custom-screens'

export const Route = createFileRoute('/_authenticated/$role/$module')({
  component: ModuleWrapper,
})

function ModuleWrapper() {
  const { role, module } = Route.useParams()
  const resolved = roleFromSlug(role)
  const Custom = resolved ? getCustomScreen(resolved, module) : undefined
  if (Custom) return <Custom />
  if (!resolved) {
    return (
      <main id='main-content' className='flex-1 p-6'>
        <p className='text-sm text-muted-foreground'>Rôle inconnu : {role}</p>
      </main>
    )
  }
  return <ModuleScreen role={resolved} module={module} />
}
