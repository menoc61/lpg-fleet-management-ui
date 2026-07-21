import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@lpg/ui'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@lpg/ui'

interface NavSubItem {
  title: string
  url: string
}

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  badge?: number | string
  items?: NavSubItem[]
}

interface NavGroup {
  title: string
  items: NavItem[]
}

function isActiveUrl(pathname: string, url: string): boolean {
  return pathname === url || pathname.startsWith(url + '/')
}

function NavGroupComponent({ group, pathname }: { group: NavGroup; pathname: string }) {
  const isGroupActive = group.items.some((item) => {
    if (item.items && item.items.length > 0) {
      return item.items.some((sub) => isActiveUrl(pathname, sub.url))
    }
    return isActiveUrl(pathname, item.url)
  })

  return (
    <SidebarGroup key={group.title}>
      <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
      <SidebarMenu>
        {group.items.map((item) => {
          const hasSub = item.items && item.items.length > 0

          if (!hasSub) {
            const active = isActiveUrl(pathname, item.url)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={active}
                >
                  <Link to={item.url as never}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isGroupActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items!.map((sub) => {
                      const subActive = isActiveUrl(pathname, sub.url)

                      return (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton asChild isActive={subActive}>
                            <Link to={sub.url as never}>
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const { pathname } = useLocation()

  return (
    <>
      {groups.map((group) => (
        <NavGroupComponent key={group.title} group={group} pathname={pathname} />
      ))}
    </>
  )
}
