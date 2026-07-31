import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@lpg/ui'
import { useGlobalSearchStore } from './global-search-store'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { useRoleStore } from '@/store/role-store'
import { getSidebarData } from '@/config/rbac/sidebar-by-role'
import { trucks } from '@/features/trucks/data/trucks'
import { sites } from '@/features/sites/data/sites'
import { transporters } from '@/features/transporters/data/transporters'
import { marketers } from '@/features/marketers/data/marketers'
import { TruckIcon, MapPin, Handshake, Building2, Home } from 'lucide-react'

type SearchItem = {
  category: string
  title: string
  subtitle: string
  value: string
  url: string
  icon: React.ElementType
}

function getSitesUrlForRole(role: string): string | null {
  try {
    const data = getSidebarData(role as any)
    for (const group of data.navGroups) {
      for (const item of group.items) {
        if (
          'url' in item &&
          typeof (item as { url: string }).url === 'string' &&
          ((item as { url: string }).url.includes('/sites') ||
            (item as { url: string }).url.includes('/site-verification'))
        ) {
          return (item as { url: string }).url
        }
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

function buildIndex(role: string): SearchItem[] {
  const items: SearchItem[] = []

  try {
    const data = getSidebarData(role as any)
    for (const group of data.navGroups) {
      for (const item of group.items) {
        if ('url' in item && typeof (item as { url: string }).url === 'string') {
          const leaf = item as { title: string; url: string }
          items.push({
            category: group.title,
            title: leaf.title,
            subtitle: '',
            value: `${leaf.title} ${group.title}`,
            url: leaf.url,
            icon: Home,
          })
        } else if ('items' in item) {
          for (const child of (item as { items: Array<{ title: string; url: string }> }).items) {
            if ('url' in child && typeof child.url === 'string') {
              items.push({
                category: group.title,
                title: child.title,
                subtitle: '',
                value: `${child.title} ${group.title}`,
                url: child.url,
                icon: Home,
              })
            }
          }
        }
      }
    }
  } catch {
    /* ignore */
  }

  for (const t of trucks) {
    items.push({
      category: 'Camions',
      title: t.plateNumber,
      subtitle: `${t.tenantName} · ${t.assignedDriver}`,
      value: `${t.plateNumber} ${t.tenantName} ${t.assignedDriver} ${t.id}`,
      url: `/trucks/${t.id}`,
      icon: TruckIcon,
    })
  }

  for (const t of transporters) {
    items.push({
      category: 'Transporteurs',
      title: t.name,
      subtitle: t.region,
      value: `${t.name} ${t.region} ${t.id}`,
      url: `/transporters/${t.id}`,
      icon: Handshake,
    })
  }

  for (const m of marketers) {
    items.push({
      category: 'Marketeurs',
      title: m.name,
      subtitle: m.region,
      value: `${m.name} ${m.region} ${m.id}`,
      url: `/marketers/${m.id}`,
      icon: Building2,
    })
  }

  const sitesUrl = getSitesUrlForRole(role)
  if (sitesUrl) {
    for (const s of sites) {
      items.push({
        category: 'Sites',
        title: s.name,
        subtitle: `${s.city} · ${s.region}`,
        value: `${s.name} ${s.city} ${s.region} ${s.id}`,
        url: `${sitesUrl}?q=${encodeURIComponent(s.name)}`,
        icon: MapPin,
      })
    }
  }

  return items
}

export function GlobalSearch() {
  const { open, close, toggle } = useGlobalSearchStore()
  const { activeRole } = useRoleStore()
  const navigate = useNavigate()

  const items = useMemo(() => buildIndex(activeRole), [activeRole])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [toggle])

  return (
    <CommandDialog open={open} onOpenChange={(o) => { if (!o) close() }}>
      <CommandInput placeholder="Rechercher une page, un camion, un site�" />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>
        {(() => {
          const grouped = new Map<string, SearchItem[]>()
          for (const item of items) {
            const group = grouped.get(item.category) ?? []
            group.push(item)
            grouped.set(item.category, group)
          }
          return Array.from(grouped.entries()).map(([category, groupItems]) => (
            <CommandGroup key={category} heading={category}>
              {groupItems.slice(0, 6).map((item) => (
                <CommandItem
                  key={item.url}
                  value={item.value}
                  onSelect={() => {
                    navigate({ to: item.url })
                    close()
                  }}
                >
                  <item.icon className="size-4 shrink-0 opacity-50 mr-2" />
                  {item.title}
                  {item.subtitle && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.subtitle}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))
        })()}
      </CommandList>
    </CommandDialog>
  )
}

