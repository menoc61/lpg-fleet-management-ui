import { useCallback, useEffect, useState } from 'react'
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
import {
  LayoutDashboard,
  Search,
  Truck,
  Fuel,
  Wrench,
  Map,
  Users,
  FileText,
  Settings,
  User,
} from 'lucide-react'

type CommandItemDef = {
  title: string
  to: string
  icon: typeof LayoutDashboard
}

const COMMANDS: CommandItemDef[] = [
  { title: 'Tableau de bord', to: '/dashboard', icon: LayoutDashboard },
  { title: 'Véhicules', to: '/vehicles', icon: Truck },
  { title: 'Citernes', to: '/cylinders', icon: Fuel },
  { title: 'Entretien', to: '/maintenance', icon: Wrench },
  { title: 'Suivi en temps réel', to: '/tracking', icon: Map },
  { title: 'Chauffeurs', to: '/drivers', icon: Users },
  { title: 'Rapports', to: '/reports', icon: FileText },
  { title: 'Paramètres', to: '/settings', icon: Settings },
  { title: 'Profil', to: '/settings/profile', icon: User },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

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
        type='button'
        variant='outline'
        onClick={() => setOpen(true)}
        className='h-9 w-9 justify-start gap-2 rounded-full px-3 text-muted-foreground sm:w-64 sm:px-3'
        aria-label='Rechercher'
      >
        <Search className='size-4' />
        <span className='hidden flex-1 text-left text-sm sm:inline'>Rechercher…</span>
        <kbd className='hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex'>
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder='Rechercher une page…' />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading='Navigation'>
            {COMMANDS.map((c) => {
              const Icon = c.icon
              return (
                <CommandItem key={c.to} value={c.title} onSelect={() => run(c.to)}>
                  <Icon className='size-4' />
                  {c.title}
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
