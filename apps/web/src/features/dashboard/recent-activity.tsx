import { useMemo } from 'react'
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@lpg/ui'
import { declarationsHooks } from '@/lib/api/use-resources'
import type { Declaration, DeclarationStatus } from '@lpg/types'

const statusLabels: Record<DeclarationStatus, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumise',
  RECONCILED: 'Validée',
  DISPUTED: 'Contestée',
}

const statusVariants: Record<DeclarationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  SUBMITTED: 'secondary',
  RECONCILED: 'default',
  DISPUTED: 'destructive',
}

export function RecentActivity() {
  const { data: declarations, isPending } = declarationsHooks.useList({ page: 1, limite: 100 })

  const sortedDeclarations = useMemo(() => {
    const items = (declarations ?? []) as Declaration[]
    return items
      .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
      .slice(0, 3)
  }, [declarations])

  if (isPending) {
    return (
      <Card className='rounded-2xl border-border/60 shadow-none'>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-[66px] w-full rounded-xl' />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='rounded-2xl border-border/60 shadow-none'>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {sortedDeclarations.map((declaration) => (
          <div
            key={declaration.id}
            className='flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3'
          >
            <div className='min-w-0'>
              <p className='text-sm font-medium'>Déclaration {declaration.id.slice(0, 8)}</p>
              <p className='text-xs text-muted-foreground'>
                {new Intl.DateTimeFormat('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }).format(new Date(declaration.created_at ?? ''))}
              </p>
            </div>
            <Badge variant={statusVariants[declaration.status] ?? 'outline'}>
              {statusLabels[declaration.status] ?? declaration.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}