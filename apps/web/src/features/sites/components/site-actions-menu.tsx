import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@lpg/ui'
import { MoreHorizontal } from 'lucide-react'
import { canTransition, type SiteRole, type SiteRow, type TransitionRequest } from '../lib/site-status-machine'

export function SiteActionsMenu({
  row,
  role,
  onAction,
}: {
  row: SiteRow
  role: SiteRole
  onAction: (req: TransitionRequest) => void
}) {
  const verify = canTransition(row, role, { kind: 'verify' })
  const suspend = canTransition(row, role, { kind: 'suspend', reason: 'Suspendu via UI' })
  const reject = canTransition(row, role, { kind: 'reject', reason: 'Rejeté via UI' })
  const reassign = canTransition(row, role, { kind: 'reassign' })

  const noActions = !verify.ok && !suspend.ok && !reject.ok && !reassign.ok

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' aria-label='Actions'>
          <MoreHorizontal className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {verify.ok ? (
          <DropdownMenuItem onSelect={() => onAction({ kind: 'verify' })}>
            Vérifier
          </DropdownMenuItem>
        ) : null}
        {suspend.ok ? (
          <DropdownMenuItem
            onSelect={() => onAction({ kind: 'suspend', reason: 'Suspendu via UI' })}
          >
            Suspendre
          </DropdownMenuItem>
        ) : null}
        {reject.ok ? (
          <DropdownMenuItem
            onSelect={() => onAction({ kind: 'reject', reason: 'Rejeté via UI' })}
          >
            Rejeter
          </DropdownMenuItem>
        ) : null}
        {reassign.ok ? (
          <DropdownMenuItem onSelect={() => onAction({ kind: 'reassign' })}>
            Réassigner
          </DropdownMenuItem>
        ) : null}
        {noActions ? (
          <DropdownMenuItem disabled>Aucune action disponible</DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
