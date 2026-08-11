import { useState } from 'react'
import { toast } from 'sonner'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from '@lpg/ui'
import { curated } from '@lpg/mock-data'
import { ROLE_LABELS, getCreatableRoles, type Role } from '@lpg/permissions'
import { useRoleStore } from '@/store/role-store'
import { useUsersStore, type UserPatch } from '@/store/users-store'
import type { UserView } from '../data/users'

type UserEditSheetProps = {
  user: UserView | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormState {
  first_name: string
  last_name: string
  email: string
  system_role: Role
  org_id: string
  is_active: boolean
}

function userToForm(u: UserView): FormState {
  const parts = u.fullName.split(' ')
  return {
    first_name: parts[0] ?? '',
    last_name: parts.slice(1).join(' ') ?? '',
    email: u.email,
    system_role: u.role,
    org_id: u.orgId,
    is_active: u.status === 'ACTIVE',
  }
}

export function UserEditSheet({
  user,
  open,
  onOpenChange,
}: UserEditSheetProps) {
  if (!user) return null
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <UserEditForm
        key={user.id}
        user={user}
        onClose={() => onOpenChange(false)}
      />
    </Sheet>
  )
}

function UserEditForm({
  user,
  onClose,
}: {
  user: UserView
  onClose: () => void
}) {
  const activeRole = useRoleStore((s) => s.activeRole)
  const creatable = getCreatableRoles(activeRole)
  const roleOptions = creatable
  const orgOptions = curated.organizations as Array<{ id: string; name: string }>

  const [form, setForm] = useState<FormState>(() => userToForm(user))

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSave() {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      toast.error('Nom, prénom et e-mail sont obligatoires.')
      return
    }
    if (!form.org_id) {
      toast.error('Une organisation est obligatoire.')
      return
    }
    const patch: UserPatch = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      system_role: form.system_role,
      org_id: form.org_id,
      is_active: form.is_active,
    }
    useUsersStore.getState().updateUser(user.id, patch)
    toast.success(`Utilisateur ${form.email} mis à jour`)
    onClose()
  }

  return (
    <SheetContent className='flex w-full flex-col sm:max-w-xl'>
      <SheetHeader className='pb-2'>
        <SheetTitle>Modifier l&apos;utilisateur</SheetTitle>
        <SheetDescription>
          {user.email} — {ROLE_LABELS[user.role]}
        </SheetDescription>
      </SheetHeader>

      <div className='flex-1 space-y-4 overflow-y-auto px-4 pb-2'>
        <div className='grid grid-cols-2 gap-3'>
          <div className='space-y-1.5'>
            <Label htmlFor='first_name'>Prénom</Label>
            <Input
              id='first_name'
              value={form.first_name}
              onChange={(e) => update('first_name', e.target.value)}
            />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='last_name'>Nom</Label>
            <Input
              id='last_name'
              value={form.last_name}
              onChange={(e) => update('last_name', e.target.value)}
            />
          </div>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='email'>E-mail</Label>
          <Input
            id='email'
            type='email'
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div className='space-y-1.5'>
            <Label htmlFor='system_role'>Rôle</Label>
            <Select
              value={form.system_role}
              onValueChange={(v) => update('system_role', v as Role)}
            >
              <SelectTrigger id='system_role'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='org_id'>Organisation</Label>
            <Select
              value={form.org_id}
              onValueChange={(v) => update('org_id', v)}
            >
              <SelectTrigger id='org_id'>
                <SelectValue placeholder='Choisir...' />
              </SelectTrigger>
              <SelectContent>
                {orgOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex items-center justify-between rounded-md border p-3'>
          <div>
            <Label htmlFor='is_active' className='cursor-pointer'>
              Compte actif
            </Label>
            <p className='text-xs text-muted-foreground'>
              Désactiver bloque la connexion sans supprimer l&apos;utilisateur.
            </p>
          </div>
          <Switch
            id='is_active'
            checked={form.is_active}
            onCheckedChange={(v) => update('is_active', v)}
          />
        </div>
      </div>

      <SheetFooter className='gap-2 border-t pt-4'>
        <Button variant='outline' onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleSave}>Enregistrer</Button>
      </SheetFooter>
    </SheetContent>
  )
}
