import { type Organization } from '@lpg/types'
import { getTransporterRoutes } from '../data/transporter-routes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  DRAFT: 'default',
  PLANNED: 'secondary',
  PENDINGTRANSPORTERACK: 'outline',
  ACKNOWLEDGED: 'default',
  INPROGRESS: 'default',
  CHECKPOINTACTIVE: 'default',
  CLOSED: 'secondary',
  CANCELLED: 'outline',
}

export function TransporterHistory({ transporter }: { transporter: Organization }) {
  const routes = getTransporterRoutes(transporter.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base sm:text-lg'>Historique des Tournées</CardTitle>
      </CardHeader>
      <CardContent className='px-0 sm:px-6'>
        {/* Mobile: card list */}
        <div className='flex flex-col gap-3 sm:hidden'>
          {routes.map((route) => (
            <div key={route.id} className='border rounded-lg p-3 mx-3'>
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0'>
                  <p className='font-medium text-sm'>{route.reference}</p>
                  <p className='text-xs text-muted-foreground font-mono'>{route.id}</p>
                </div>
                <Badge variant={statusVariant[route.status] ?? 'outline'} className='shrink-0'>
                  {route.status}
                </Badge>
              </div>
              <div className='mt-2 space-y-1 text-xs'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Date</span>
                  <span>{route.started_at ? new Date(route.started_at).toLocaleDateString() : '—'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Origine</span>
                  <span className='text-right'>{route.origin}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Destination</span>
                  <span className='text-right'>{route.destination}</span>
                </div>
              </div>
            </div>
          ))}
          {routes.length === 0 && (
            <p className='p-4 text-center text-muted-foreground'>
              Aucune tournée enregistrée pour ce transporter.
            </p>
          )}
        </div>

        {/* Desktop: table */}
        <div className='hidden sm:block overflow-x-auto rounded-md border'>
          <table className='w-full text-sm text-left'>
            <thead className='bg-muted/50 text-muted-foreground'>
              <tr>
                <th className='p-3 font-medium whitespace-nowrap'>Référence</th>
                <th className='p-3 font-medium'>ID</th>
                <th className='p-3 font-medium'>Origine</th>
                <th className='p-3 font-medium'>Destination</th>
                <th className='p-3 font-medium'>Statut</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className='border-t'>
                  <td className='p-3 font-medium whitespace-nowrap'>{route.reference}</td>
                  <td className='p-3 font-mono whitespace-nowrap'>{route.id}</td>
                  <td className='p-3'>{route.origin}</td>
                  <td className='p-3'>{route.destination}</td>
                  <td className='p-3'>
                    <Badge variant={statusVariant[route.status] ?? 'outline'}>
                      {route.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={5} className='p-4 text-center text-muted-foreground'>
                    Aucune tournée enregistrée pour ce transporter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}