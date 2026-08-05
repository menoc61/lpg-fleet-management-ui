import { type Organization } from '@lpg/types'
import { getTransporterTrucks } from './transporter-trucks'
import { getTransporterRoutes } from './transporter-routes'
import { Card, CardContent, CardHeader, CardTitle } from '@lpg/ui'
import { Truck, Route } from 'lucide-react'

export function TransporterOverview({ transporter }: { transporter: Organization }) {
  const trucks = getTransporterTrucks(transporter.id)
  const routes = getTransporterRoutes(transporter.id)
  const activeTrucks = trucks.filter((t) => t.status === 'AVAILABLE').length
  const activeRoutes = routes.filter((r) => r.status === 'IN_PROGRESS').length

  return (
    <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>Flotte Totale</CardTitle>
          <Truck className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{trucks.length}</div>
          <p className='text-xs text-muted-foreground'>{activeTrucks} disponibles</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>Tournées en cours</CardTitle>
          <Route className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{activeRoutes}</div>
          <p className='text-xs text-muted-foreground'>sur {routes.length} total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>Capacité Totale</CardTitle>
          <Truck className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{trucks.reduce((sum, t) => sum + (t.max_volume ?? 0), 0)} TM</div>
          <p className='text-xs text-muted-foreground'>Tous camions confondus</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>Statut</CardTitle>
          <Truck className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold capitalize'>{transporter.is_active ? 'Actif' : 'Inactif'}</div>
          <p className='text-xs text-muted-foreground'>{transporter.vehicle_count ?? 0} véhicules</p>
        </CardContent>
      </Card>
    </div>
  )
}