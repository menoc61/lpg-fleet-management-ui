import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Truck, Users } from 'lucide-react'
import type { Organization } from '@lpg/types'

export function MarketerOverview({ marketer }: { marketer: Organization }) {
  return (
    <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>Sites Associés</CardTitle>
          <Building2 className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{marketer.operational_site_count ?? 0}</div>
          <p className='text-xs text-muted-foreground'>Sites opérationnels</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>Camions Actifs</CardTitle>
          <Truck className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{marketer.vehicle_count ?? 0}</div>
          <p className='text-xs text-muted-foreground'>Véhicules enregistrés</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>Utilisateurs</CardTitle>
          <Users className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{marketer.user_count ?? 0}</div>
          <p className='text-xs text-muted-foreground'>Utilisateurs de l'organisation</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
          <CardTitle className='text-sm font-medium'>Clients</CardTitle>
          <Building2 className='w-4 h-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{marketer.client_site_count ?? 0}</div>
          <p className='text-xs text-muted-foreground'>Sites clients</p>
        </CardContent>
      </Card>
    </div>
  )
}