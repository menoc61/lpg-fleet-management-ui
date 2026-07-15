import { Check, ChevronsUpDown, Shield } from 'lucide-react'
import { Button, cn } from '@lpg/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@lpg/ui'
import { useRoleStore } from '@/store/role-store'
import { ROLES, ROLE_LABELS, type Role } from '@/config/rbac/roles'

export function RoleSwitcher() {
  const activeRole = useRoleStore((s) => s.activeRole)
  const setActiveRole = useRoleStore((s) => s.setActiveRole)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='h-9 gap-2 border-border/60 bg-background/80'
          aria-label='Changer de rôle'
        >
          <Shield className='size-4 text-primary' />
          <span className='hidden text-sm font-medium sm:inline'>
            {ROLE_LABELS[activeRole]}
          </span>
          <ChevronsUpDown className='size-3.5 opacity-60' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel>Basculer de rôle (démo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((role: Role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => setActiveRole(role)}
            className={cn(
              'gap-2',
              role === activeRole && 'bg-secondary font-medium'
            )}
          >
            <Check
              className={cn('size-4', role === activeRole ? 'opacity-100' : 'opacity-0')}
            />
            {ROLE_LABELS[role]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
