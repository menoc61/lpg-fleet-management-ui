import { useMemo } from 'react'
import { RouteOff, Workflow } from 'lucide-react'
import { Badge } from '@lpg/ui'
import { PageHeader } from '@/components/layout/page-header'
import { KpiTile, PageShell, SectionCard } from '@/components/layout/page'
import {
  getNotifActiveRuleCount,
  getNotifRuleCount,
  getNotifRoutingGroups,
  routingSeverityLabels,
  type NotifRoutingGroup,
} from './data/notification-rules'

export function NotificationRulesPage() {
  const groups = useMemo(() => getNotifRoutingGroups(), [])
  const total = useMemo(() => getNotifRuleCount(), [])
  const active = useMemo(() => getNotifActiveRuleCount(), [])

  return (
    <PageShell>
      <PageHeader
        title='Règles de notification'
        description='Routage anomalie vers groupe de notification par type et sévérité.'
      />

      <div className='grid gap-4 sm:grid-cols-3'>
        <KpiTile label='Règles' value={String(total)} />
        <KpiTile label='Règles actives' value={String(active)} />
        <KpiTile label='Groupes cibles' value={String(groups.length)} />
      </div>

      <SectionCard title='Routage par groupe' description='Une carte de routage groupée par groupe de notification cible.'>
        <div className='space-y-3'>
          {groups.map((group) => (
            <RoutingGroupCard key={group.targetGroupId} group={group} />
          ))}
        </div>
      </SectionCard>
    </PageShell>
  )
}

function RoutingGroupCard({ group }: { group: NotifRoutingGroup }) {
  return (
    <div className='rounded-lg border p-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Workflow className='size-4 text-primary' />
          <span className='font-medium'>{group.targetGroupName}</span>
        </div>
        <Badge variant='secondary'>{group.rules.length} règles</Badge>
      </div>

      <ul className='mt-2 space-y-1'>
        {group.rules.map((rule) => (
          <li key={rule.id} className='flex flex-wrap items-center justify-between gap-2 text-sm'>
            <span className='truncate'>{rule.name}</span>
            <span className='flex items-center gap-1.5'>
              {rule.anomalyType && (
                <Badge variant='outline' className='font-mono text-[10px]'>
                  {rule.anomalyType}
                </Badge>
              )}
              {rule.minSeverity && (
                <Badge variant='secondary'>{routingSeverityLabels[rule.minSeverity]}</Badge>
              )}
              <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                {rule.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </span>
          </li>
        ))}
      </ul>

      <div className='mt-2 flex items-center gap-1 text-xs text-muted-foreground'>
        {group.activeRuleCount === 0 ? (
          <>
            <RouteOff className='size-3.5' /> Toutes inactives
          </>
        ) : (
          <span>{group.activeRuleCount} active(s) sur {group.ruleCount}</span>
        )}
      </div>
    </div>
  )
}
