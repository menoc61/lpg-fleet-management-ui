import { Outlet, Link, useLocation, useParams } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { getSidebarData } from '@/config/rbac/sidebar-by-role'
import type { Role } from '@/config/rbac/roles'

export function RoleLayout() {
  const { role: rawRole } = useParams({ from: '/_authenticated/$role/' })
  const role = rawRole as Role
  const data = getSidebarData(role)
  const location = useLocation()

  if (!data) {
    return (
      <div className='flex-1 p-6'>
        <p className='text-sm text-muted-foreground'>Unknown role: {rawRole}</p>
      </div>
    )
  }

  const currentPath = location.pathname

  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(`${href}/`)
  }

  return (
    <div className='flex flex-1'>
      <aside className='hidden w-56 shrink-0 border-r bg-muted/20 p-3 md:block'>
        <div className='mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          Navigation
        </div>
        <nav className='space-y-4'>
          {data.navGroups.map((group) => (
            <div key={group.title}>
              <div className='mb-1 px-2 text-xs font-medium text-muted-foreground'>
                {group.title}
              </div>
              <ul className='space-y-0.5'>
                {group.items.map((item: any) => {
                  const href = 'url' in item ? item.url : item.items?.[0]?.url
                  if (!href) return null
                  const active = isActive(href)
                  return (
                    <li key={`${item.title}-${href}`}>
                      <Link
                        to={href as any}
                        className={`flex items-center rounded-md px-2 py-1.5 text-sm transition-colors ${
                          active
                            ? 'bg-secondary text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <span className='flex-1'>{item.title}</span>
                        {active && <ChevronRight className='size-3.5 opacity-60' />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main className='flex-1'>
        <Outlet />
      </main>
    </div>
  )
}
