import { cn } from '@lpg/ui'
import { type ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

type PageShellProps = React.HTMLAttributes<HTMLElement> & {
  fluid?: boolean
  children?: ReactNode
}

/**
 * Single page container used by every screen. Replaces the hand-rolled
 * `<main>` + slate gradient duplicated across feature pages and role screens.
 */
export function PageShell({ fluid, className, children, ...props }: PageShellProps) {
  return (
    <main
      id='main-content'
      className={cn('page', !fluid && 'mx-auto w-full max-w-7xl', className)}
      {...props}
    >
      {children}
    </main>
  )
}

type KpiTileProps = {
  label: string
  value: string
  delta?: string
  trend?: 'up' | 'down'
}

export function KpiTile({ label, value, delta, trend }: KpiTileProps) {
  return (
    <div className='surface-card p-4'>
      <p className='data-label'>{label}</p>
      <p className='data-value mt-1'>{value}</p>
      {delta && (
        <p
          className={cn(
            'mt-1 flex items-center gap-1 text-xs font-medium',
            trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
          )}
        >
          {trend === 'up' ? (
            <ArrowUpRight className='size-3.5' />
          ) : (
            <ArrowDownRight className='size-3.5' />
          )}
          {delta}
        </p>
      )}
    </div>
  )
}

type SectionCardProps = {
  title?: string
  description?: string
  actions?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

export function SectionCard({
  title,
  description,
  actions,
  className,
  bodyClassName,
  children,
}: SectionCardProps) {
  return (
    <section className={cn('surface-card', className)}>
      {(title || actions) && (
        <header className='flex items-start justify-between gap-3 border-b border-border/60 p-4'>
          <div>
            {title && <h2 className='text-base font-semibold tracking-tight'>{title}</h2>}
            {description && (
              <p className='mt-0.5 text-sm text-muted-foreground'>{description}</p>
            )}
          </div>
          {actions && <div className='flex items-center gap-2'>{actions}</div>}
        </header>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  )
}

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className='surface-card flex flex-col items-center justify-center gap-3 p-10 text-center'>
      <p className='text-base font-semibold'>{title}</p>
      {description && (
        <p className='max-w-sm text-sm text-muted-foreground'>{description}</p>
      )}
      {action && <div className='mt-1'>{action}</div>}
    </div>
  )
}
