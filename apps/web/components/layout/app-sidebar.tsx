import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@lpg/ui'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { RoleSwitcher } from './role-switcher'
import { useRoleStore } from '@/store/role-store'
import { getSidebarData } from '@/config/rbac/sidebar-by-role'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const activeRole = useRoleStore((s) => s.activeRole)
  const sidebarData = getSidebarData(activeRole)

  const navGroups = sidebarData.navGroups.map((group) => ({
    title: group.title,
    items: group.items
      .filter((item) => item.url != null)
      .map((item) => ({
        title: item.title,
        url: item.url!,
        icon: item.icon as never,
        badge: item.badge as number | string | undefined,
        items: (item as { items?: { title: string; url: string }[] }).items,
      })),
  }))

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <RoleSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
