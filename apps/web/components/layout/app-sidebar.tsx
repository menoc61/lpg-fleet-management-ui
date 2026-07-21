import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@lpg/ui'
import { RoleSwitcher } from './role-switcher-07'
import { NavMain } from './nav-main-07'
import { NavUser } from './nav-user-07'
import { useRoleStore } from '@/store/role-store'
import { getSidebarData } from '@/config/rbac/sidebar-by-role'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const activeRole = useRoleStore((s) => s.activeRole)
  const sidebarData = getSidebarData(activeRole)

  return (
    <Sidebar collapsible='icon' variant='sidebar' {...props}>
      <SidebarHeader>
        <RoleSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((group) => (
          <NavMain
            key={group.title}
            label={group.title}
            items={group.items
              .filter((item) => item.url != null)
              .map((item) => ({
                title: item.title,
                url: item.url!,
                icon: item.icon as never,
                badge: item.badge as number | string | undefined,
                items: (item as any).items as any[] | undefined,
              }))}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
