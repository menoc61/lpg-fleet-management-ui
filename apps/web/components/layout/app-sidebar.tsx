import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@lpg/ui'
import { AppTitle } from './app-title'
import { NavGroup } from './nav-group'
import { useRoleStore } from '@/store/role-store'
import { getSidebarData, roleSlug } from '@/config/rbac/sidebar-by-role'
import { ROLE_LABELS } from '@/config/rbac/roles'

export function AppSidebar() {
  const activeRole = useRoleStore((s) => s.activeRole)
  const sidebarData = getSidebarData(activeRole)
  return (
    <Sidebar collapsible='icon' variant='inset'>
      <SidebarHeader>
        <AppTitle subtitle={ROLE_LABELS[activeRole]} href={`/${roleSlug(activeRole)}`} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
