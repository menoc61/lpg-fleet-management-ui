import { Moon, Sun } from 'lucide-react'
import { useLocation } from '@tanstack/react-router'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@lpg/ui'
import { Header } from './header'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { NotificationCenter } from '@/features/notifications/notification-center'
import { CommandPalette } from '@/features/command-palette/command-palette'

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const { pathname } = useLocation()

  return (
    <Header fixed>
      <div className='flex flex-1 items-center justify-between gap-3'>
        <div className='hidden flex-1 items-center gap-3 md:flex'>
          <CommandPalette />
          <Breadcrumbs pathname={pathname} />
        </div>

        <div className='flex flex-1 items-center justify-end gap-2'>
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
        </div>
      </div>
    </Header>
  )
}
