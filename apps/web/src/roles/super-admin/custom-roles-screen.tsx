import { useState } from 'react'
import { ShieldCheck, Plus, Trash2, Save, Users, Building2 } from 'lucide-react'
import { PageShell } from '@/components/layout/page'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@lpg/ui'
import {
  users,
  organizations,
} from '@lpg/mock-data'

const RESOURCES = [
  'tours',
  'declarations',
  'pickups',
  'deliveries',
  'scans',
  'checkpoints',
  'vehicles',
  'drivers',
  'sites',
  'organizations',
  'users',
  'anomalies',
  'reports',
  'pda',
  'rfid-tags',
  'notification-groups',
] as const

type Action = 'create' | 'read' | 'update' | 'delete'

const ACTIONS: readonly Action[] = ['create', 'read', 'update', 'delete']

const ACTION_LABELS: Record<Action, string> = {
  create: 'Créer',
  read: 'Lire',
  update: 'Modifier',
  delete: 'Supprimer',
}

interface Permission {
  action: Action
  resource: string
}

interface RoleData {
  id: string
  org_id: string
  name: string
  description?: string
  permissions: Permission[]
  is_active?: boolean
}

const SEED_ROLES: readonly RoleData[] = [
  {
    id: 'role-chef-depot',
    org_id: organizations[0]?.id ?? '',
    name: 'Chef de dépôt',
    description: 'Pilote les opérations journalières du dépôt',
    permissions: [
      { action: 'read', resource: 'pickups' },
      { action: 'update', resource: 'pickups' },
      { action: 'read', resource: 'vehicles' },
    ],
    is_active: true,
  },
  {
    id: 'role-superviseur-livraison',
    org_id: organizations[0]?.id ?? '',
    name: 'Superviseur livraison',
    description: 'Supervise les tournées et valide les réceptions',
    permissions: [
      { action: 'read', resource: 'tours' },
      { action: 'read', resource: 'scans' },
      { action: 'update', resource: 'pickups' },
    ],
    is_active: true,
  },
]

interface UserRoleAssignment {
  id: string
  user_id: string
  custom_role_id: string
  site_id?: string
}

const SEED_ASSIGNMENTS: readonly UserRoleAssignment[] = users.slice(0, 2).map((u, idx) => ({
  id: `assign-${idx + 1}`,
  user_id: u.id,
  custom_role_id: SEED_ROLES[idx % SEED_ROLES.length]!.id,
  site_id: idx === 0 ? u.org_id : undefined,
}))

export function SuperAdminCustomRolesScreen() {
  const [roles, setRoles] = useState<RoleData[]>([...SEED_ROLES])
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null)

  function togglePermission(role: RoleData, action: Action, resource: string) {
    const exists = role.permissions.some((p) => p.action === action && p.resource === resource)
    const permissions = exists
      ? role.permissions.filter((p) => !(p.action === action && p.resource === resource))
      : [...role.permissions, { action, resource }]
    const updated = { ...role, permissions }
    setRoles((prev) => prev.map((r) => (r.id === role.id ? updated : r)))
    if (selectedRole?.id === role.id) setSelectedRole(updated)
  }

  function persist(updated: RoleData) {
    setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    setSelectedRole(updated)
  }

  return (
    <PageShell>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
            <ShieldCheck className='size-6 text-primary' />
            Rôles personnalisés
          </h1>
          <p className='text-sm text-muted-foreground'>
            Permissions granulaires par organisation — système à portée régionale optionnelle.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='size-4' />
              Nouveau rôle
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-lg'>
            <DialogHeader>
              <DialogTitle>Créer un rôle personnalisé</DialogTitle>
            </DialogHeader>
            <form
              className='space-y-3'
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                const orgId = String(fd.get('orgId') ?? '')
                const name = String(fd.get('name') ?? '').trim()
                if (!name) return
                const next: RoleData = {
                  id: `role-${Date.now()}`,
                  org_id: orgId,
                  name,
                  description: String(fd.get('description') ?? ''),
                  permissions: [],
                  is_active: true,
                }
                setRoles((prev) => [...prev, next])
                setOpen(false)
              }}
            >
              <div className='space-y-1'>
                <Label htmlFor='orgId'>Organisation</Label>
                <Select name='orgId' defaultValue={organizations[0]?.id ?? ''}>
                  <SelectTrigger>
                    <SelectValue placeholder='Organisation' />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1'>
                <Label htmlFor='name'>Nom du rôle</Label>
                <Input id='name' name='name' required placeholder='ex: Chef de dépôt' />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='description'>Description</Label>
                <Input id='description' name='description' placeholder='optionnelle' />
              </div>
              <div className='flex justify-end'>
                <Button type='submit'>
                  <Save className='size-4' />
                  Enregistrer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base'>
                  <ShieldCheck className='mr-2 inline size-4 text-primary' />
                  {role.name}
                </CardTitle>
                <Badge variant={role.is_active ? 'default' : 'secondary'}>
                  {role.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>
                <Building2 className='mr-1 inline size-3' /> Organisation {role.org_id}
              </p>
              {role.description ? (
                <p className='text-xs text-muted-foreground'>{role.description}</p>
              ) : null}
            </CardHeader>
            <CardContent>
              <div className='mb-3 text-xs font-medium text-muted-foreground'>
                {role.permissions.length} permission(s) — portée{' '}
                {role.permissions.length === 0 ? 'organisation' : 'organisation + site optionnel'}
              </div>
              <div className='flex flex-wrap gap-1'>
                {ACTIONS.map((action) => (
                  <Badge key={action} variant='outline'>{ACTION_LABELS[action]}</Badge>
                ))}
              </div>
              <div className='mt-3 flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedRole(role)}
                >
                  Éditer
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-rose-600'
                  onClick={() => {
                    if (!confirm(`Supprimer le rôle ${role.name} ?`)) return
                    setRoles((prev) => prev.filter((r) => r.id !== role.id))
                  }}
                >
                  <Trash2 className='size-3' />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Permissions matrix</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Sélectionnez un rôle pour éditer ses permissions case par case.
          </p>
        </CardHeader>
        <CardContent>
          {!selectedRole ? (
            <p className='text-sm text-muted-foreground'>Aucun rôle sélectionné — Cliquez sur « Éditer ».</p>
          ) : (
            <div>
              <p className='mb-3 text-sm font-medium'>
                <ShieldCheck className='mr-2 inline size-4 text-primary' /> {selectedRole.name}
              </p>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b text-left'>
                      <th className='pb-2 pr-4 font-medium'>Ressource</th>
                      {ACTIONS.map((a) => (
                        <th key={a} className='pb-2 px-2 text-center font-medium'>{ACTION_LABELS[a]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RESOURCES.map((resource) => (
                      <tr key={resource} className='border-b last:border-0'>
                        <td className='py-2 font-mono text-xs'>{resource}</td>
                        {ACTIONS.map((action) => {
                          const enabled = selectedRole.permissions.some(
                            (p) => p.action === action && p.resource === resource
                          )
                          return (
                            <td key={action} className='py-2 text-center'>
                              <Switch
                                checked={enabled}
                                onCheckedChange={() => togglePermission(selectedRole, action, resource)}
                                aria-label={`${selectedRole.name}: ${action} ${resource}`}
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='mt-4 flex justify-end'>
                <Button onClick={() => persist(selectedRole)}>
                  <Save className='size-4' /> Enregistrer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Assignations utilisateur-rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Les assignations sont gérées via l&apos;API <code className='rounded bg-muted px-1.5 py-0.5 text-xs'>/user-custom-roles</code>.
            Chaque utilisateur peut avoir plusieurs rôles personnalisés, éventuellement limités à un site spécifique (portée régionale).
          </p>
          <div className='mt-4 grid gap-2 sm:grid-cols-2'>
            {SEED_ASSIGNMENTS.map((assignment) => {
              const user = users.find((u) => u.id === assignment.user_id)
              const role = roles.find((r) => r.id === assignment.custom_role_id)
              return (
                <div key={assignment.id} className='flex items-center gap-3 rounded-lg border p-3 text-sm'>
                  <Users className='size-4 text-muted-foreground' />
                  <div className='flex-1'>
                    <p className='font-medium'>
                      {user ? `${user.first_name} ${user.last_name}` : '—'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {role?.name ?? assignment.custom_role_id}
                    </p>
                  </div>
                  {assignment.site_id ? (
                    <Badge variant='outline' className='text-[10px]'>
                      Site: {assignment.site_id}
                    </Badge>
                  ) : null}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}