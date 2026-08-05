import {
  UserRound,
  Wrench,
} from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle, cn, Separator } from '@lpg/ui'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@lpg/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@lpg/ui'
import {
  getTruckTelemetry,
  riskClasses,
  riskLabels,
  statusClasses,
  statusLabels,
  type Truck,
  type TruckTelemetry,
} from './trucks'
import { quantityInfo } from './lib/quantity'

type TruckDetailsSheetProps = {
  truck: Truck | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TruckDetailsSheet({
  truck,
  open,
  onOpenChange,
}: TruckDetailsSheetProps) {
  const telemetry = truck ? getTruckTelemetry(truck.id) : null
  const info = truck ? quantityInfo(truck) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {truck && telemetry && info ? (
        <SheetContent className='w-full overflow-y-auto sm:max-w-xl'>
          <SheetHeader className='pb-4'>
            <div className='flex items-start justify-between gap-3 pe-8'>
              <div>
                <SheetTitle className='text-xl'>{truck.id}</SheetTitle>
                <SheetDescription>
                  {truck.type} · {truck.license_plate} — {truck.tenant_name}
                </SheetDescription>
              </div>
              <Badge className={cn('font-medium', statusClasses[truck.tournee_status])}>
                {statusLabels[truck.tournee_status]}
              </Badge>
            </div>
          </SheetHeader>

          <div className='space-y-4 px-4 pb-6'>
            <TruckDetailsBody truck={truck} telemetry={telemetry} info={info} />
          </div>
        </SheetContent>
      ) : null}
    </Sheet>
  )
}

export interface TruckDetailsBodyProps {
  truck: Truck
  telemetry: TruckTelemetry
  info?: ReturnType<typeof quantityInfo>
}

export function TruckDetailsBody({
  truck,
  telemetry,
  info: providedInfo,
}: TruckDetailsBodyProps) {
  const info = providedInfo ?? quantityInfo(truck)
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-3'>
        <MetricCard
          label='LPG'
          value={
            truck.type === 'VRAC'
              ? `${Math.round(info.loaded)}/${truck.max_volume ?? '—'} TM`
              : `${Math.round(info.loaded)}/${truck.max_bottle_count ?? '—'} bouteilles`
          }
          detail={`${info.percent}% remplis`}
        />
        <MetricCard
          label='ETA'
          value={
            telemetry.expected_arrival
              ? new Date(telemetry.expected_arrival).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'
          }
          detail='Prochaine etape'
        />
        <MetricCard
          label='Risque'
          value={riskLabels[truck.risk_level]}
          detail='Score operationnel'
          className={riskClasses[truck.risk_level]}
        />
      </div>

      <Tabs defaultValue='resume'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='resume'>Resume</TabsTrigger>
          <TabsTrigger value='docs'>Documents</TabsTrigger>
        </TabsList>

        <TabsContent value='resume' className='space-y-3'>
          <Card className='surface-sunken'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm'>
                Mission courante
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <DetailLine label='Entreprise' value={truck.tenant_name} />
              <DetailLine label='Region' value={truck.region} />
              <DetailLine
                label='Position'
                value={truck.current_location ?? '—'}
              />
              <DetailLine label='Chauffeur' value={truck.assigned_driver ?? '—'} />
              <DetailLine
                label='Type'
                value={truck.type === 'VRAC' ? 'Vrac (TM)' : 'Bouteilles 50kg'}
              />
            </CardContent>
          </Card>

          <Card className='surface-sunken'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm'>
                <UserRound className='size-4 text-primary' />
                Equipe
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <DetailLine
                label='Chauffeur'
                value={truck.assigned_driver ?? '—'}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='docs' className='space-y-3'>
          <Separator />
          <DetailLine
            label='Certificat'
            value={truck.certificate_number ?? '—'}
          />
          <DetailLine
            label='Validite'
            value={
              truck.certificate_expiry_at
                ? new Date(truck.certificate_expiry_at).toLocaleDateString('fr-FR')
                : '—'
            }
          />
        </TabsContent>
      </Tabs>

      <Card className='surface-sunken'>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm'>
            <Wrench className='size-4 text-primary' />
            Etat technique
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <DetailLine
            label='Type vehicule'
            value={truck.type === 'VRAC' ? 'Vrac' : 'Bouteilles 50kg'}
          />
          <DetailLine
            label='Capacite max'
            value={
              truck.type === 'VRAC'
                ? `${truck.max_volume ?? '—'} TM`
                : `${truck.max_bottle_count ?? '—'} bouteilles`
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  label,
  value,
  detail,
  className,
}: {
  label: string
  value: string
  detail: string
  className?: string
}) {
  return (
    <div className={cn('surface-sunken p-3', className)}>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='mt-1 text-lg leading-none font-semibold'>{value}</p>
      <p className='mt-1 text-xs text-muted-foreground'>{detail}</p>
    </div>
  )
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-start justify-between gap-3 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='max-w-72 text-right font-medium'>{value}</span>
    </div>
  )
}
