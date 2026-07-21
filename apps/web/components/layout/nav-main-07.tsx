import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
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

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  badge?: number | string
  items?: { title: string; url: string }[]
}

export function NavMain({ items, label }: { items: NavItem[]; label?: string }) {
  if (!items.length) return null

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const hasSub = item.items && item.items.length > 0
          if (!hasSub) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                  <Link to={item.url as never}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge !== undefined && (
                      <span className='ml-auto rounded-full bg-sidebar-primary px-1.5 text-[10px] font-medium text-sidebar-primary-foreground'>
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
              defaultOpen={item.isActive}
              className='group/collapsible'
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items!.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={subItem.url as never}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
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
