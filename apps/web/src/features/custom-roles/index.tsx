import { useMemo, useState } from 'react'
import { Check, ShieldCheck, UserRound } from 'lucide-react'
import { Badge } from '@lpg/ui'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { KpiTile, PageShell, SectionCard } from '@/components/layout/page'
import {
  getActiveCustomRoleCount,
  getCustomRoleAssignmentCount,
  getCustomRoles,
  type CustomRoleView,
} from './data/custom-roles'

export function CustomRolesPage() {
  const roles = useMemo(() => getCustomRoles(), [])
  const active = useMemo(() => getActiveCustomRoleCount(), [])
  const assignments = useMemo(() => getCustomRoleAssignmentCount(), [])
  const [expandedId, setExpandedId] = useState<string | null>(roles[0]?.id ?? null)

  return (
    <PageShell>
      <PageHeader
        title='Rôles personnalisés'
        description='Rôles construits par organisation avec leurs propres jeux de permissions.'
      />

      <div className='grid gap-4 sm:grid-cols-3'>
        <KpiTile label='Rôles' value={String(roles.length)} />
        <KpiTile label='Rôles actifs' value={String(active)} />
        <KpiTile label='Affectations' value={String(assignments)} />
      </div>

      <SectionCard
        title='Liste des rôles'
        description='Chaque rôle porte un sous-ensemble de permissions et des membres affectés.'
      >
        <div className='space-y-3'>
          {roles.length === 0 && <p className='text-sm text-muted-foreground'>Aucun rôle personnalisé.</p>}
          {roles.map((role) => (
            <CustomRoleCard
              key={role.id}
              role={role}
              expanded={expandedId === role.id}
              onToggle={() => setExpandedId(expandedId === role.id ? null : role.id)}
            />
          ))}
        </div>
      </SectionCard>
    </PageShell>
  )
}

function CustomRoleCard({
  role,
  expanded,
  onToggle,
}: {
  role: CustomRoleView
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className='rounded-lg border p-3'>
      <button type='button' onClick={onToggle} className='flex w-full items-center justify-between gap-2 text-left'>
        <div className='flex items-center gap-2'>
          <ShieldCheck className='size-4 text-primary' />
          <span className='font-medium'>{role.name}</span>
          <Badge
            variant={role.isActive ? 'default' : 'secondary'}
            className={cn(!role.isActive && 'text-muted-foreground')}
          >
            {role.isActive ? 'Actif' : 'Inactif'}
          </Badge>
          <span className='hidden text-xs text-muted-foreground sm:inline'>{role.orgName}</span>
        </div>
        <span className='text-xs text-muted-foreground'>{role.permissionCount} permissions</span>
      </button>

      {expanded && (
        <div className='mt-3 space-y-3 border-t pt-3'>
          <p className='text-sm text-muted-foreground'>{role.description || 'Aucune description.'}</p>

          <div>
            <div className='mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              Permissions ({role.permissionCount})
            </div>
            <div className='flex flex-wrap gap-1.5'>
              {role.permissions.map((code) => (
                <span
                  key={code}
                  className='inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 font-mono text-xs'
                >
                  <Check className='size-3 text-emerald-600' />
                  {code}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className='mb-1.5 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              <UserRound className='size-3.5' /> Membres ({role.memberCount})
            </div>
            {role.memberCount === 0 ? (
              <p className='text-sm text-muted-foreground'>Aucun membre affecté.</p>
            ) : (
              <ul className='space-y-1'>
                {role.members.map((m) => (
                  <li key={m.userId} className='text-sm'>
                    {m.fullName}
                    {m.siteId && <span className='ml-1 text-xs text-muted-foreground'>{m.siteId}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}