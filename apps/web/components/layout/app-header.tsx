import { LogOut, Moon, Search, Sun } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
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
  Input,
} from '@lpg/ui'
import { Header } from './header'
import { RoleSwitcher } from './role-switcher'
import csphLogo from '@/assets/logo-csph-small.png'
import { useAuthStore } from '@/store/auth-store'
import { NotificationCenter } from '@/features/notifications/notification-center'

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate({ to: '/login' })
  }

  return (
    <Header fixed>
      <div className='flex flex-1 items-center justify-between gap-3'>
        <div className='hidden flex-1 items-center gap-3 md:flex'>
          <div className='relative w-full max-w-md'>
            <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              aria-label='Rechercher'
              placeholder='Rechercher un camion, une tournee, un depot...'
              className='h-10 rounded-xl border-border/60 bg-background/80 pr-16 pl-9 shadow-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/30'
            />
            <div className='pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 rounded-md border bg-muted/70 px-1.5 py-1 text-[10px] font-medium text-muted-foreground'>
              <span>Ctrl</span>
              <span>K</span>
            </div>
          </div>
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
