import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn, SidebarInset, SidebarProvider } from '@lpg/ui'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SkipToMain />
      <AppSidebar />
      <SidebarInset
        className={cn(
          // Set content container, so we can use container queries
          '@container/content bg-muted/20'
        )}
      >
        <AppHeader />
        {children ?? <Outlet />}
      </SidebarInset>
    </SidebarProvider>
  )
}
