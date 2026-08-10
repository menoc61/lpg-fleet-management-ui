import {
  curated,
  organizations,
  sites,
  client_sites,
  vehicles,
  drivers,
  users,
} from '@lpg/mock-data'
import type { Anomaly, DeliveryTour, ExecutionMode, Setting, TourneeStatus, TourneeType } from '@lpg/types'
import {
  resolveSlaThresholds,
  tourSlaFlags,
} from './tour-machine'

export type { ExecutionMode, TourneeStatus, TourneeType }

export type TourSlice = 'ALL' | 'INTERNAL' | 'EXTERNAL' | 'PENDING' | 'ACTIVE' | 'HISTORY'

export interface TourView {
  id: string
  reference: string
  type: TourneeType
  execution_mode: ExecutionMode
  status: TourneeStatus
  status_label: string
  marketeur_name: string
  transporter_name: string | null
  vehicle_plate: string | null
  driver_name: string | null
  livreur_name: string | null
  requested_quantity: number
  loaded_quantity: number | null
  delivered_quantity: number | null
  checkpoint_count: number
  completed_checkpoints: number
  created_at: string
  started_at: string | null
  closed_at: string | null
  transport_assigned_at: string | null
  cargo_label: string
  quantity_label: string
  sla_transporter_no_ack: boolean
  sla_unassigned_too_long: boolean
  anomaly_ids: string[]
}

export const tourneeTypeLabels: Record<TourneeType, string> = {
  VRAC: 'Vrac (TM)',
  BOUTEILLES50KG: 'Bouteilles 50 kg',
}

export const tourStatusLabels: Record<TourneeStatus, string> = {
  DRAFT: 'Brouillon',
  PLANNED: 'Planifiée',
  PENDINGTRANSPORTERACK: 'En attente transporteur',
  ACKNOWLEDGED: 'Accusée',
  INPROGRESS: 'En transit',
  CHECKPOINTACTIVE: 'En livraison',
  CLOSED: 'Livrée',
  CANCELLED: 'Annulée',
}

export const executionModeLabels: Record<ExecutionMode, string> = {
  INTERNAL: 'Interne',
  EXTERNAL: 'Externalisée',
}

export const tourStatusOptions: readonly { label: string; value: TourneeStatus }[] = (
  Object.keys(tourStatusLabels) as TourneeStatus[]
).map((value) => ({ label: tourStatusLabels[value], value }))

export const executionModeOptions: readonly { label: string; value: ExecutionMode }[] = (
  Object.keys(executionModeLabels) as ExecutionMode[]
).map((value) => ({ label: executionModeLabels[value], value }))

function orgName(id: string | null | undefined): string | null {
  if (!id) return null
  return organizations.find((o) => o.id === id)?.name ?? id
}

function personName(id: string | null | undefined): string | null {
  if (!id) return null
  const user = users.find((u) => u.id === id)
  if (user) return `${user.first_name} ${user.last_name}`.trim()
  const driver = drivers.find((d) => d.id === id)
  if (driver) return `${driver.first_name} ${driver.last_name}`.trim()
  return id
}

function vehiclePlate(id: string | null | undefined): string | null {
  if (!id) return null
  return vehicles.find((v) => v.id === id)?.license_plate ?? id
}

function siteName(id: string | null | undefined): string | null {
  if (!id) return null
  return [...sites, ...client_sites].find((s) => s.id === id)?.name ?? id
}

export interface TourEnrichOptions {
  checkpoints?: typeof curated.checkpoints
  anomalies?: Anomaly[]
  settings?: Setting[]
  now?: Date
}

export function buildTourView(
  tour: DeliveryTour,
  index: number,
  opts: TourEnrichOptions = {},
): TourView {
  const checkpoints = (opts.checkpoints ?? curated.checkpoints)
    .filter((cp) => cp.tournee_id === tour.id)
    .sort((a, b) => a.sequence - b.sequence)
  const completed = checkpoints.filter((cp) => cp.status === 'COMPLETED').length
  const type = tour.type === 'VRAC' ? 'TM' : 'btl'

  const sla = tourSlaFlags(
    tour,
    resolveSlaThresholds(opts.settings ?? curated.settings),
    opts.now,
  )
  const slaAnomalyTypes = ['TRANSPORTERNOACK', 'TOURNEEUNASSIGNEDTOOLONG'] as const
  const anomaly_ids = (opts.anomalies ?? curated.anomalies)
    .filter(
      (a) =>
        a.entity_type === 'TOURNEE' &&
        a.entity_id === tour.id &&
        (slaAnomalyTypes as readonly string[]).includes(a.type),
    )
    .map((a) => a.id)

  return {
    id: tour.id,
    reference: `TR-${String(index + 1).padStart(4, '0')}`,
    type: tour.type,
    execution_mode: tour.execution_mode,
    status: tour.status,
    status_label: tourStatusLabels[tour.status],
    marketeur_name: orgName(tour.marketeur_org_id) ?? '—',
    transporter_name: orgName(tour.transporter_org_id),
    vehicle_plate: vehiclePlate(tour.vehicle_id),
    driver_name: personName(tour.driver_id),
    livreur_name: personName(tour.livreur_user_id),
    requested_quantity: tour.requested_quantity,
    loaded_quantity: tour.loaded_quantity ?? null,
    delivered_quantity: tour.delivered_quantity ?? null,
    checkpoint_count: checkpoints.length,
    completed_checkpoints: completed,
    created_at: tour.created_at ?? '',
    started_at: tour.started_at ?? null,
    closed_at: tour.closed_at ?? null,
    transport_assigned_at: tour.transporter_assigned_at ?? null,
    cargo_label: tour.type === 'VRAC' ? 'GPL vrac' : 'Bouteilles 50 kg',
    quantity_label: `${tour.requested_quantity} ${type}`,
    sla_transporter_no_ack: sla.transporterNoAck,
    sla_unassigned_too_long: sla.unassignedTooLong,
    anomaly_ids,
  }
}

export function toTourViews(
  tours: DeliveryTour[],
  opts: TourEnrichOptions = {},
): TourView[] {
  return tours.map((tour, i) => buildTourView(tour, i, opts))
}

function slicePredicate(slice: TourSlice): (t: DeliveryTour) => boolean {
  switch (slice) {
    case 'INTERNAL':
      return (t) => t.execution_mode === 'INTERNAL'
    case 'EXTERNAL':
      return (t) => t.execution_mode === 'EXTERNAL'
    case 'PENDING':
      return (t) => t.status === 'PENDINGTRANSPORTERACK'
    case 'ACTIVE':
      return (t) => t.status === 'INPROGRESS' || t.status === 'CHECKPOINTACTIVE'
    case 'HISTORY':
      return (t) => t.status === 'CLOSED' || t.status === 'CANCELLED'
    default:
      return () => true
  }
}

export function getTours(slice: TourSlice = 'ALL'): TourView[] {
  return curated.delivery_tours
    .filter(slicePredicate(slice))
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    .map((tour, i) => buildTourView(tour, i))
}

export function getTourById(id: string): TourView | undefined {
  const index = curated.delivery_tours.findIndex((t) => t.id === id)
  if (index === -1) return undefined
  return buildTourView(curated.delivery_tours[index]!, index)
}

export function getTourSummary(rows: TourView[]) {
  return {
    total: rows.length,
    internal: rows.filter((r) => r.execution_mode === 'INTERNAL').length,
    external: rows.filter((r) => r.execution_mode === 'EXTERNAL').length,
    pending: rows.filter((r) => r.status === 'PENDINGTRANSPORTERACK').length,
    active: rows.filter((r) => r.status === 'INPROGRESS' || r.status === 'CHECKPOINTACTIVE').length,
    closed: rows.filter((r) => r.status === 'CLOSED').length,
    cancelled: rows.filter((r) => r.status === 'CANCELLED').length,
  }
}

export function getTourProgress(row: TourView): number {
  if (row.checkpoint_count === 0) return row.status === 'CLOSED' ? 100 : 0
  return Math.round((row.completed_checkpoints / row.checkpoint_count) * 100)
}

export function getTourStops(id: string): string[] {
  const tour = curated.delivery_tours.find((t) => t.id === id)
  if (!tour) return []
  return curated.checkpoints
    .filter((cp) => cp.tournee_id === tour.id)
    .sort((a, b) => a.sequence - b.sequence)
    .map((cp) => siteName(cp.site_id ?? cp.client_site_id))
    .filter((n): n is string => Boolean(n))
}
