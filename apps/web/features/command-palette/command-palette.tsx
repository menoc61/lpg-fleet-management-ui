import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@lpg/ui'
import {
  LayoutDashboard,
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
  )
}
