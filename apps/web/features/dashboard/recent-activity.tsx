import { Badge, Card, CardContent, CardHeader, CardTitle } from '@lpg/ui'

const declarations = [
  {
    reference: 'DEC-2026-0001',
    status: 'submitted',
    date: '2026-07-15',
  },
  {
    reference: 'DEC-2026-0002',
    status: 'validated',
    date: '2026-07-14',
  },
  {
    reference: 'DEC-2026-0005',
    status: 'submitted',
    date: '2026-07-15',
  },
] as const

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  submitted: 'Soumise',
  validated: 'Validée',
  rejected: 'Rejetée',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  submitted: 'secondary',
  validated: 'default',
  rejected: 'destructive',
}

export function RecentActivity() {
  return (
    <Card className='rounded-2xl border-border/60 shadow-none'>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {declarations.map((declaration) => (
          <div
            key={declaration.reference}
            className='flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3'
          >
            <div className='min-w-0'>
              <p className='text-sm font-medium'>{declaration.reference}</p>
              <p className='text-xs text-muted-foreground'>
                {new Intl.DateTimeFormat('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }).format(new Date(declaration.date))}
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
