import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@lpg/ui'
import { cn } from '@/lib/utils'
import {
  type TourActivity,
  tourStatusLabels,
  executionModeLabels,
  getTourProgress,
  getTourStops,
  getTourCargo,
} from '../data/tour-activity'
import { STATUS_CLASS, MODE_CLASS, TourActions } from './tour-actions'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-4 py-1.5 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right font-medium'>{value}</span>
    </div>
  )
}

function fmt(quantity: number | null, type: TourActivity['tourneeType']): string {
  if (quantity == null) return '—'
  return `${quantity} ${type === 'VRAC' ? 'TM' : 'btl'}`
}

export function TourDetail({
  tour,
  onClose,
  onAction,
}: {
  tour: TourActivity | null
  onClose: () => void
  onAction: (updated: TourActivity) => void
}) {
  const progress = tour ? getTourProgress(tour) : 0
  const stops = tour ? getTourStops(tour.id) : []

  const hasSlaFlag = Boolean(tour && (tour.sla_transporter_no_ack || tour.sla_unassigned_too_long))

  return (
    <Dialog open={tour !== null} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle className='flex items-center justify-between gap-3'>
          <span>{tour?.reference ?? '—'}</span>
          {tour && <Badge className={STATUS_CLASS[tour.tourneeStatus]}>{tourStatusLabels[tour.tourneeStatus]}</Badge>}
        </DialogTitle>
      </DialogHeader>

      {tour && (
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Badge className={MODE_CLASS[tour.execution_mode]}>
              {executionModeLabels[tour.execution_mode]}
            </Badge>
            <span className='text-sm text-muted-foreground'>{getTourCargo(tour)}</span>
          </div>

          {hasSlaFlag && (
            <div className='space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950'>
              {tour.sla_transporter_no_ack && (
                <p className='flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-200'>
                  Accusé transporteur absent (SLA &gt; 4 h)
                  {tour.anomaly_ids.length > 0 && (
                    <span className='text-xs font-normal text-amber-600'>
                      {tour.anomaly_ids.join(', ')}
                    </span>
                  )}
                </p>
              )}
              {tour.sla_unassigned_too_long && (
                <p className='flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-200'>
                  Tournée non assignée trop longtemps (SLA &gt; 12 h)
                </p>
              )}
            </div>
          )}

          <div className='space-y-1'>
            <Row label='Marketeur' value={tour.marketeur_name} />
            <Row label='Transporteur' value={tour.transporter_name ?? '—'} />
            <Row label='Véhicule' value={tour.vehicle_plate ?? '—'} />
            <Row label='Conducteur' value={tour.driver_name ?? '—'} />
            <Row label='Livreur' value={tour.livreur_name ?? '—'} />
            <Row label='Quantité demandée' value={fmt(tour.requested_quantity, tour.tourneeType)} />
            <Row label='Quantité chargée' value={fmt(tour.loaded_quantity, tour.tourneeType)} />
            <Row label='Quantité livrée' value={fmt(tour.delivered_quantity, tour.tourneeType)} />
            <Row label='Point(s) livré(s)' value={`${tour.completed_checkpoints}/${tour.checkpoint_count}`} />
          </div>

          <div>
            <div className='mb-1 flex items-center justify-between text-sm'>
              <span className='font-medium'>Avancement</span>
              <span className='text-muted-foreground'>{progress}%</span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
              <div className='h-full rounded-full bg-primary transition-all' style={{ width: `${progress}%` }} />
            </div>
          </div>

          {stops.length > 0 && (
            <div>
              <p className='mb-2 text-sm font-medium'>Étapes</p>
              <ol className='space-y-1.5'>
                {stops.map((stop, i) => (
                  <li key={i} className='flex items-center gap-2 text-sm'>
                    <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold'>
                      {i + 1}
                    </span>
                    <span className={cn(i === stops.length - 1 && 'font-medium')}>{stop}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <TourActions tour={tour} onPerformed={onAction} />
          <div className='flex justify-end pt-2'>
            <Button variant='outline' onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      )}
      </DialogContent>
    </Dialog>
  )
}
