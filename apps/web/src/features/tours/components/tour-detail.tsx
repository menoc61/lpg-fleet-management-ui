import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@lpg/ui'
import { cn } from '@/lib/utils'
import {
  type TourView,
  type TourneeStatus,
  type ExecutionMode,
  tourStatusLabels,
  executionModeLabels,
  getTourProgress,
  getTourStops,
} from '../data/tours'

const STATUS_CLASS: Record<TourneeStatus, string> = {
  DRAFT: 'bg-slate-200 text-slate-800',
  PLANNED: 'bg-sky-100 text-sky-800',
  PENDINGTRANSPORTERACK: 'bg-amber-100 text-amber-900',
  ACKNOWLEDGED: 'bg-violet-100 text-violet-900',
  INPROGRESS: 'bg-blue-500 text-white',
  CHECKPOINTACTIVE: 'bg-orange-500 text-white',
  CLOSED: 'bg-emerald-600 text-white',
  CANCELLED: 'bg-rose-100 text-rose-900',
}

const MODE_CLASS: Record<ExecutionMode, string> = {
  INTERNAL: 'bg-slate-100 text-slate-700',
  EXTERNAL: 'bg-indigo-100 text-indigo-800',
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-4 py-1.5 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right font-medium'>{value}</span>
    </div>
  )
}

function fmt(quantity: number | null, type: TourView['type']): string {
  if (quantity == null) return '—'
  return `${quantity} ${type === 'VRAC' ? 't' : 'btl'}`
}

export function TourDetail({
  tour,
  onClose,
}: {
  tour: TourView | null
  onClose: () => void
}) {
  const progress = tour ? getTourProgress(tour) : 0
  const stops = tour ? getTourStops(tour.id) : []

  return (
    <Dialog open={tour !== null} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle className='flex items-center justify-between gap-3'>
          <span>{tour?.reference ?? '—'}</span>
          {tour && <Badge className={STATUS_CLASS[tour.status]}>{tourStatusLabels[tour.status]}</Badge>}
        </DialogTitle>
      </DialogHeader>

      {tour && (
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Badge className={MODE_CLASS[tour.execution_mode]}>
              {executionModeLabels[tour.execution_mode]}
            </Badge>
            <span className='text-sm text-muted-foreground'>{tour.cargo_label}</span>
          </div>

          <div className='space-y-1'>
            <Row label='Marketeur' value={tour.marketeur_name} />
            <Row label='Transporteur' value={tour.transporter_name ?? '—'} />
            <Row label='Véhicule' value={tour.vehicle_plate ?? '—'} />
            <Row label='Conducteur' value={tour.driver_name ?? '—'} />
            <Row label='Livreur' value={tour.livreur_name ?? '—'} />
            <Row label='Quantité demandée' value={fmt(tour.requested_quantity, tour.type)} />
            <Row label='Quantité chargée' value={fmt(tour.loaded_quantity, tour.type)} />
            <Row label='Quantité livrée' value={fmt(tour.delivered_quantity, tour.type)} />
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