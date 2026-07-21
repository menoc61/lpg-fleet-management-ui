import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@lpg/ui'
import { Search } from 'lucide-react'
import { useRoleStore } from '@/store/role-store'
import { getSidebarData } from '@/config/rbac/sidebar-by-role'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const activeRole = useRoleStore((s) => s.activeRole)
  const sidebarData = getSidebarData(activeRole)

  const commands = useMemo(() => {
    return sidebarData.navGroups.flatMap((group) =>
      group.items
        .filter((item) => item.url != null)
        .map((item) => ({
          title: item.title,
          to: item.url!,
          icon: item.icon,
          group: group.title,
        }))
    )
  }, [sidebarData])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const run = useCallback(
    (to: string) => {
      setOpen(false)
      navigate({ to })
    },
    [navigate],
  )

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 w-9 justify-start gap-2 rounded-xl px-3 text-muted-foreground sm:w-64"
        aria-label="Rechercher"
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden flex-1 text-left text-sm sm:inline">Rechercher...</span>
        <kbd className="hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher une page..." />
        <CommandList>
          <CommandEmpty>Aucun resultat.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {commands.map((c) => {
              const Icon = c.icon
              return (
                <CommandItem key={`${c.group}-${c.title}`} value={c.title} onSelect={() => run(c.to)}>
                  {Icon && <Icon className="size-4" />}
                  <span>{c.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{c.group}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
