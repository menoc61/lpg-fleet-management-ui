import { useEffect, useState, useMemo } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useLocation } from '@tanstack/react-router'
import { useTheme } from '@/context/theme-provider'
import { Button, cn, Separator, SidebarTrigger } from '@lpg/ui'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { NotificationCenter } from '@/features/notifications/notification-center'
import { CommandPalette } from '@/features/command-palette/command-palette'
import { generateBreadcrumbs } from '@/lib/breadcrumbs'

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const pageTitle = useMemo(() => {
    const crumbs = generateBreadcrumbs(pathname)
    return crumbs.length > 0 ? crumbs[crumbs.length - 1].label : ''
  }, [pathname])

  return (
    <header
      className={cn(
        'flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height,border-color,background-color,box-shadow] duration-200 ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
        scrolled
          ? 'border-border bg-background/90 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/80'
          : 'border-transparent bg-background'
      )}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumbs pathname={pathname} />
        <span className="ml-1 text-base font-medium text-muted-foreground">
          {pageTitle}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <CommandPalette />
          <NotificationCenter />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Changer le theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
