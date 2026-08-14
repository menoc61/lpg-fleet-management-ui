import { useState } from 'react'
import {
  Lock,
  LockOpen,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@lpg/ui'
import { hasPermission } from '@lpg/permissions'
import { useRoleStore } from '@/store/role-store'
import { useUsersStore } from '@/store/users-store'
import type { UserView } from '../data/users'

type UserRowActionsProps = {
  user: UserView
  onEdit: (user: UserView) => void
}

export function UserRowActions({ user, onEdit }: UserRowActionsProps) {
  const activeRole = useRoleStore((s) => s.activeRole)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const canWrite = hasPermission(activeRole, 'users.write')
  const canDelete = hasPermission(activeRole, 'users.delete')
  const canReset = hasPermission(activeRole, 'users.reset')

  if (!canWrite && !canDelete && !canReset) return null

  const u = useUsersStore.getState().users.find((x) => x.id === user.id)
  const lockedUntil = u?.locked_until ?? null
  const isLocked = lockedUntil !== null && lockedUntil !== undefined

  function handleReset() {
    try {
      useUsersStore.getState().resetPassword(user.id)
      toast.success(`Lien de réinitialisation envoyé à ${user.email}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    }
  }

  function handleDelete() {
    try {
      useUsersStore.getState().deleteUser(user.id)
      toast.success(`Utilisateur ${user.email} supprimé`)
      setConfirmDelete(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
      setConfirmDelete(false)
    }
  }

  function handleToggleLock() {
    if (isLocked) {
      useUsersStore.getState().unlock(user.id)
      toast.success(`Compte ${user.email} déverrouillé`)
    } else {
      useUsersStore.getState().lockUntil(user.id)
      toast.success(`Compte ${user.email} verrouillé (15 min)`)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='size-8' aria-label='Actions'>
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-44'>
          {canWrite && (
            <DropdownMenuItem onSelect={() => onEdit(user)}>
              <Pencil className='mr-2 size-4' />
              Modifier
            </DropdownMenuItem>
          )}
          {canWrite && (
            <DropdownMenuItem onSelect={handleToggleLock}>
              {isLocked ? (
                <>
                  <LockOpen className='mr-2 size-4' />
                  Déverrouiller
                </>
              ) : (
                <>
                  <Lock className='mr-2 size-4' />
                  Verrouiller
                </>
              )}
            </DropdownMenuItem>
          )}
          {canReset && (
            <DropdownMenuItem onSelect={handleReset}>
              <RotateCcw className='mr-2 size-4' />
              Réinitialiser le mot de passe
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setConfirmDelete(true)}
                className='text-destructive focus:text-destructive'
              >
                <Trash2 className='mr-2 size-4' />
                Supprimer
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;utilisateur&nbsp;?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. L&apos;utilisateur{' '}
              <span className='font-semibold'>{user.email}</span> n&apos;aura plus
              accès au système.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
