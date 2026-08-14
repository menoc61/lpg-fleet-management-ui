import { type Organization, type Vehicle } from '@lpg/types'
import { getTransporterTrucks } from '@/features/transporters/data/transporter-trucks'
import { getToursForTransporter } from '@/features/transporters/data/transporter-tours'
import { Card, CardContent, CardHeader, CardTitle } from '@lpg/ui'
import { Truck, Route, CheckCircle } from 'lucide-react'

export function TransporterOverview({ transporter }: { transporter: Organization }) {
  const trucks: Vehicle[] = getTransporterTrucks(transporter.id)
  const tours = getToursForTransporter(transporter.id)
  const availableTrucks = trucks.filter((t) => t.is_active).length
  const activeTours = tours.filter((t) => 
    t.status === 'INPROGRESS' || t.status === 'CHECKPOINTACTIVE'
  ).length
  const pendingAck = tours.filter((t) => t.status === 'PENDINGTRANSPORTERACK').length

  return (
    <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>Flotte Totale</CardTitle>
          <Truck className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{trucks.length}</div>
          <p className='text-xs text-muted-foreground'>{availableTrucks} disponibles</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>Tournées en cours</CardTitle>
          <Route className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{activeTours}</div>
          <p className='text-xs text-muted-foreground'>sur {tours.length} total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>En attente d\'accusé</CardTitle>
          <CheckCircle className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{pendingAck}</div>
          <p className='text-xs text-muted-foreground'>à reconnaître</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>Capacité Totale</CardTitle>
          <Truck className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {trucks.reduce((sum, t) => sum + (t.max_volume ?? 0), 0)} TM
          </div>
          <p className='text-xs text-muted-foreground'>Tous camions confondus</p>
        </CardContent>
      </Card>
    </div>
  )
}