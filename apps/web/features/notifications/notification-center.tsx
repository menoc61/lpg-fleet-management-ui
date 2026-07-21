import {
  Bell,
  CheckCheck,
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
} from 'lucide-react'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  cn,
} from '@lpg/ui'
import {
  useNotificationsStore,
  getNotificationsForRole,
  type NotificationLevel,
} from './notifications-store'
import { useRoleStore } from '@/store/role-store'
import { ROLE_LABELS } from '@/config/rbac/roles'
import { EmptyState } from '@/components/layout/page'

const LEVEL_ICON: Record<NotificationLevel, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleX,
}

const LEVEL_CLASS: Record<NotificationLevel, string> = {
  info: 'text-muted-foreground',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  error: 'text-rose-600',
}

const EMPTY_BY_ROLE: Record<string, string> = {
  SUPER_ADMIN: 'Toutes les notifications système sont sous contrôle.',
  ADMIN: 'Aucune notification administrative en attente.',
  MARKETEUR: 'Aucune notification pour vos tournées.',
  LIVREUR: 'Aucune notification de mission.',
}

export function NotificationCenter() {
  const activeRole = useRoleStore((s) => s.activeRole)
  const filtered = getNotificationsForRole(activeRole)
  const unread = filtered.filter((n) => !n.read).length
  const markRead = useNotificationsStore((s) => s.markRead)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='relative rounded-full text-muted-foreground'
          aria-label='Notifications'
        >
          <Bell className='size-4' />
          {unread > 0 && (
            <span className='absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white'>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-0'>
        <div className='flex items-center justify-between border-b p-3'>
          <p className='text-sm font-semibold'>Notifications</p>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-7 gap-1 text-xs'
            onClick={markAllRead}
            disabled={unread === 0}
          >
            <CheckCheck className='size-3.5' />
            Tout lire
          </Button>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            title='Aucune notification'
            description={
              EMPTY_BY_ROLE[activeRole] ??
              `Aucune notification pour ${ROLE_LABELS[activeRole as keyof typeof ROLE_LABELS] ?? 'votre rôle'}.`
            }
          />
        ) : (
          <ScrollArea className='max-h-80'>
            <ul className='divide-y'>
              {filtered.map((n) => {
                const Icon = LEVEL_ICON[n.level]
                return (
                  <li key={n.id}>
                    <button
                      type='button'
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'flex w-full items-start gap-3 p-3 text-start',
                        !n.read && 'bg-primary/5'
                      )}
                    >
                      <Icon className={cn('mt-0.5 size-4 shrink-0', LEVEL_CLASS[n.level])} />
                      <span className='min-w-0'>
                        <span className='block truncate text-sm font-medium'>{n.title}</span>
                        <span className='block text-xs text-muted-foreground'>{n.body}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
