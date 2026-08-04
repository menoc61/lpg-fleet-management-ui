import {
  CalendarDays,
  Gauge,
  MapPin,
  Route,
  ShieldCheck,
  Thermometer,
  UserRound,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getTruckTelemetry,
  riskClasses,
  riskLabels,
  statusClasses,
  statusLabels,
  type Truck,
} from '../data/trucks'

type TruckDetailsSheetProps = {
  truck: Truck | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DOCUMENT_REFERENCE_DATE_MS = new Date(
  '2026-04-23T00:00:00+01:00'
).getTime()

export function TruckDetailsSheet({
  truck,
  open,
  onOpenChange,
}: TruckDetailsSheetProps) {
  const telemetry = truck ? getTruckTelemetry(truck.id) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {truck && telemetry ? (
        <SheetContent className='w-full overflow-y-auto sm:max-w-xl'>
          <SheetHeader className='pb-4'>
            <div className='flex items-start justify-between gap-3 pe-8'>
              <div>
                <SheetTitle className='text-xl'>{truck.id}</SheetTitle>
                <SheetDescription>
                  {truck.make_model} - {truck.plate_number}
                </SheetDescription>
              </div>
              <Badge className={cn('font-medium', statusClasses[truck.status])}>
                {statusLabels[truck.status]}
              </Badge>
            </div>
          </SheetHeader>

          <div className='space-y-4 px-4 pb-6'>
            <div className='grid grid-cols-2 gap-3'>
              <MetricCard
                label='LPG'
                value={`${telemetry.lpg_level_percent}%`}
                detail={`${Math.round(
                  (truck.tank_capacity_liters * telemetry.lpg_level_percent) / 100
                ).toLocaleString()} L disponibles`}
              />
              <MetricCard
                label='Vitesse'
                value={`${telemetry.speed_kmh} km/h`}
                detail={`ETA ${telemetry.eta_text}`}
              />
              <MetricCard
                label='Pression'
                value={`${telemetry.pressureBar.toFixed(1)} bar`}
                detail={`${telemetry.temperature_celsius} C reservoir`}
              />
              <MetricCard
                label='Risque'
                value={riskLabels[truck.risk_level]}
                detail='Score operationnel'
                className={riskClasses[truck.risk_level]}
              />
            </div>

            <Tabs defaultValue='resume'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='resume'>Resume</TabsTrigger>
                <TabsTrigger value='docs'>Documents</TabsTrigger>
                <TabsTrigger value='maintenance'>Maintenance</TabsTrigger>
              </TabsList>

              <TabsContent value='resume' className='space-y-3'>
                <Card className='border-transparent bg-muted/20 shadow-xs'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <Route className='size-4 text-primary' />
                      Mission courante
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <DetailLine label='Entreprise' value={truck.tenant_name} />
                    <DetailLine label='Site' value={truck.marketer} />
                    <DetailLine label='Route' value={truck.assigned_route} />
                    <DetailLine
                      label='Position'
                      value={truck.current_location}
                    />
                    <DetailLine label='Destination' value={truck.destination} />
                    <div>
                      <div className='mb-1 flex justify-between text-xs'>
                        <span className='text-muted-foreground'>
                          Progression
                        </span>
                        <span className='font-medium'>
                          {telemetry.distance_km} km restants
                        </span>
                      </div>
                      <div className='h-2 overflow-hidden rounded-full bg-muted'>
                        <div
                          className='h-full rounded-full bg-primary'
                          style={{ width: `${telemetry.route_progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className='border-transparent bg-muted/20 shadow-xs'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <UserRound className='size-4 text-primary' />
                      Equipe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <DetailLine
                      label='Chauffeur'
                      value={truck.assigned_driver}
                    />
                    <DetailLine label='Telephone' value={truck.driver_phone} />
                    <DetailLine
                      label='Fleet manager'
                      value={truck.fleet_manager}
                    />
                    <DetailLine label='Region' value={truck.operating_region} />
                    <DetailLine label='Depot' value={truck.home_depot} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='docs' className='space-y-3'>
                <DocumentStatus
                  label='Permis transport GPL'
                  value={truck.permit_expiry}
                />
                <DocumentStatus
                  label='Assurance'
                  value={truck.insurance_expiry}
                />
                <DocumentStatus
                  label='Visite technique'
                  value={truck.technical_visit_expiry}
                />
                <Separator />
                <DetailLine label='GPS IMEI' value={truck.gpsImei} />
                <DetailLine label='Contrat' value={truck.contract_tier} />
                <DetailLine
                  label='Dernier ping'
                  value={formatDateTime(truck.last_ping)}
                />
              </TabsContent>

              <TabsContent value='maintenance' className='space-y-3'>
                <Card className='border-transparent bg-muted/20 shadow-xs'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <Wrench className='size-4 text-primary' />
                      Etat technique
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <DetailLine
                      label='Kilometrage'
                      value={`${truck.odometerKm.toLocaleString()} km`}
                    />
                    <DetailLine
                      label='Prochaine revision'
                      value={`${truck.nextServiceKm.toLocaleString()} km`}
                    />
                    <DetailLine
                      label='Dernier service'
                      value={formatDate(truck.last_service_date)}
                    />
                    <DetailLine
                      label='Capacite citerne'
                      value={`${truck.tank_capacity_liters.toLocaleString()} L`}
                    />
                    <DetailLine
                      label='Compartiments'
                      value={`${truck.compartments}`}
                    />
                    <DetailLine label='Carburant' value={truck.fuelType} />
                  </CardContent>
                </Card>

                <div className='grid grid-cols-2 gap-3'>
                  <MiniSignal
                    icon={<Gauge className='size-4' />}
                    label='Pression'
                    value={`${telemetry.pressureBar.toFixed(1)} bar`}
                  />
                  <MiniSignal
                    icon={<Thermometer className='size-4' />}
                    label='Temperature'
                    value={`${telemetry.temperature_celsius} C`}
                  />
                  <MiniSignal
                    icon={<MapPin className='size-4' />}
                    label='Distance'
                    value={`${telemetry.distance_km} km`}
                  />
                  <MiniSignal
                    icon={<CalendarDays className='size-4' />}
                    label='Ping'
                    value={formatDateTime(truck.last_ping)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      ) : null}
    </Sheet>
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
    <div className={cn('rounded-lg bg-muted/25 p-3 shadow-xs', className)}>
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

function DocumentStatus({ label, value }: { label: string; value: string }) {
  const daysLeft = Math.ceil(
    (new Date(value).getTime() - DOCUMENT_REFERENCE_DATE_MS) /
      (1000 * 60 * 60 * 24)
  )
  const status =
    daysLeft < 0 ? 'Expire' : daysLeft <= 45 ? 'Expire bientot' : 'Valide'
  const className =
    daysLeft < 0
      ? 'bg-red-500/10 text-red-700 dark:text-red-300'
      : daysLeft <= 45
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'

  return (
    <div className='rounded-lg bg-muted/20 p-3 shadow-xs'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-start gap-2'>
          <ShieldCheck className='mt-0.5 size-4 text-primary' />
          <div>
            <p className='text-sm font-medium'>{label}</p>
            <p className='text-xs text-muted-foreground'>
              Expire le {formatDate(value)}
            </p>
          </div>
        </div>
        <Badge variant='outline' className={cn('border-transparent', className)}>
          {status}
        </Badge>
      </div>
    </div>
  )
}

function MiniSignal({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className='rounded-lg bg-muted/20 p-3 shadow-xs'>
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        {icon}
        {label}
      </div>
      <p className='mt-2 text-sm font-semibold'>{value}</p>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
