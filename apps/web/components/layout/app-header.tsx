import { LogOut, Moon, Sun } from 'lucide-react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from '@/context/theme-provider'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@lpg/ui'
import { Header } from './header'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { RoleSwitcher } from './role-switcher'
import csphLogo from '@/assets/logo-csph-small.png'
import { useAuthStore } from '@/store/auth-store'
import { NotificationCenter } from '@/features/notifications/notification-center'
import { CommandPalette } from '@/features/command-palette/command-palette'

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { pathname } = useLocation()

  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate({ to: '/login' })
  }

  return (
    <Header fixed>
      <div className='flex flex-1 items-center justify-between gap-3'>
        <div className='hidden flex-1 items-center gap-3 md:flex'>
          <CommandPalette />
          <Breadcrumbs pathname={pathname} />
        </div>


        <div className='flex flex-1 items-center justify-end gap-2'>
          <RoleSwitcher />
          <NotificationCenter />

          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='rounded-full text-muted-foreground'
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
            aria-label='Changer le theme'
          >
            {resolvedTheme === 'dark' ? (
              <Sun className='size-4' />
            ) : (
              <Moon className='size-4' />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='relative size-9 rounded-full p-0'
                aria-label='Menu utilisateur'
              >
                <Avatar className='size-9 rounded-full border bg-white'>
                  <AvatarImage src={csphLogo} alt='CSPH' className='object-contain' />
                  <AvatarFallback className='bg-primary/10 text-sm font-semibold text-primary'>
                    CS
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-60'>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col gap-0.5'>
                  <p className='text-sm font-medium'>
                    {user?.email?.split('@')[0] ?? 'Utilisateur'}
                  </p>
                  <p className='text-xs text-muted-foreground'>{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to='/settings/profile'>Profil</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className='text-rose-600 focus:text-rose-600'
              >
                <LogOut className='size-4' />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Header>
  )
}
