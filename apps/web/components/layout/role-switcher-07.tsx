import { ChevronsUpDown, Shield } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@lpg/ui'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@lpg/ui'
import { useRoleStore } from '@/store/role-store'
import { ROLES, ROLE_LABELS } from '@/config/rbac/roles'

export function RoleSwitcher() {
  const { isMobile } = useSidebar()
  const activeRole = useRoleStore((s) => s.activeRole)
  const setActiveRole = useRoleStore((s) => s.setActiveRole)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <Shield className='size-4' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {ROLE_LABELS[activeRole]}
                </span>
                <span className='truncate text-xs'>{activeRole}</span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Roles
            </DropdownMenuLabel>
            {ROLES.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => setActiveRole(role)}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  <Shield className='size-3.5 shrink-0' />
                </div>
                <span>{ROLE_LABELS[role]}</span>
                {role === activeRole && (
                  <span className='ml-auto text-xs text-muted-foreground'>Actif</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
