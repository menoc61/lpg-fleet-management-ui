import type { DeliveryTour, Setting, TourneeStatus, ExecutionMode } from '@lpg/types'

export type TourAction = 'send-to-transporter' | 'acknowledge' | 'start' | 'close' | 'cancel'

export const TOUR_ACTION_LABELS: Record<TourAction, string> = {
  'send-to-transporter': 'Envoyer au transporteur',
  acknowledge: 'Accuser réception',
  start: 'Démarrer',
  close: 'Clôturer',
  cancel: 'Annuler',
}

const TERMINAL_STATUSES: ReadonlySet<TourneeStatus> = new Set(['CLOSED', 'CANCELLED'])

const EXTERNAL_CHAIN: ReadonlyArray<TourneeStatus> = [
  'DRAFT',
  'PENDINGTRANSPORTERACK',
  'ACKNOWLEDGED',
  'INPROGRESS',
  'CHECKPOINTACTIVE',
  'CLOSED',
]

const INTERNAL_CHAIN: ReadonlyArray<TourneeStatus> = [
  'DRAFT',
  'PLANNED',
  'INPROGRESS',
  'CHECKPOINTACTIVE',
  'CLOSED',
]

const CHAINS: Record<ExecutionMode, ReadonlyArray<TourneeStatus>> = {
  INTERNAL: INTERNAL_CHAIN,
  EXTERNAL: EXTERNAL_CHAIN,
}

const ALL_ACTIONS: TourAction[] = ['send-to-transporter', 'acknowledge', 'start', 'close', 'cancel']

interface ActionSpec {
  target: TourneeStatus
  modes: ExecutionMode[]
}

const ACTION_TARGET: Record<TourAction, ActionSpec> = {
  'send-to-transporter': { target: 'PENDINGTRANSPORTERACK', modes: ['EXTERNAL'] },
  acknowledge: { target: 'ACKNOWLEDGED', modes: ['EXTERNAL'] },
  start: { target: 'INPROGRESS', modes: ['INTERNAL', 'EXTERNAL'] },
  close: { target: 'CLOSED', modes: ['INTERNAL', 'EXTERNAL'] },
  cancel: { target: 'CANCELLED', modes: ['INTERNAL', 'EXTERNAL'] },
}

function immediateNext(from: TourneeStatus, mode: ExecutionMode): TourneeStatus | undefined {
  const chain = CHAINS[mode]
  const idx = chain.indexOf(from)
  return idx === -1 || idx === chain.length - 1 ? undefined : chain[idx + 1]
}

export function canTransition(from: TourneeStatus, to: TourneeStatus, mode: ExecutionMode): boolean {
  if (TERMINAL_STATUSES.has(from)) return false
  if (to === 'CANCELLED') return !TERMINAL_STATUSES.has(from)
  return immediateNext(from, mode) === to
}

export function nextStatuses(from: TourneeStatus, mode: ExecutionMode): TourneeStatus[] {
  if (TERMINAL_STATUSES.has(from)) return []
  const next = immediateNext(from, mode)
  return next ? [next, 'CANCELLED'] : ['CANCELLED']
}

export function tourActions(tour: Pick<DeliveryTour, 'status' | 'execution_mode'>): TourAction[] {
  const { status, execution_mode } = tour
  return ALL_ACTIONS.filter((action) => {
    const spec = ACTION_TARGET[action]
    if (!spec.modes.includes(execution_mode)) return false
    return canTransition(status, spec.target, execution_mode)
  }).sort()
}

export interface TourValidationResult {
  valid: boolean
  errors: string[]
}

export function validateTour(tour: DeliveryTour): TourValidationResult {
  const errors: string[] = []
  const { execution_mode, vehicle_id, driver_id, livreur_user_id, assigned_by_transporter_user_id,
    transporter_org_id, started_at, closed_at } = tour

  if (
    execution_mode === 'INTERNAL' &&
    (!vehicle_id || !driver_id || !livreur_user_id)
  ) {
    errors.push(
      `chk_tournee_internal: an INTERNAL tournee must have vehicle_id, driver_id and livreur_user_id`,
    )
  }

  if (execution_mode === 'EXTERNAL' && !transporter_org_id) {
    errors.push(`chk_tournee_external: an EXTERNAL tournee must be assigned to a transporter_org_id`)
  }

  if (execution_mode === 'INTERNAL' && assigned_by_transporter_user_id) {
    errors.push(
      `chk_tournee_no_double_assign: an INTERNAL tournee must not be assigned by a transporter user`,
    )
  }

  if (started_at && closed_at && new Date(started_at) > new Date(closed_at)) {
    errors.push(`chk_tournee_dates: closed_at must not precede started_at`)
  }

  return { valid: errors.length === 0, errors }
}

export interface SlaThresholds {
  transporterAckTimeoutHours: number
  unassignedAlertHours: number
}

export const TOURNE_SLA_KEYS = {
  ackTimeout: 'tournee.transporter_ack_timeout_hours',
  unassigned: 'tournee.unassigned_alert_hours',
} as const

export function resolveSlaThresholds(settings: Setting[]): SlaThresholds {
  const byKey = Object.fromEntries(settings.map((s) => [s.setting_key, s.setting_value]))
  return {
    transporterAckTimeoutHours: Number(byKey[TOURNE_SLA_KEYS.ackTimeout] ?? 0),
    unassignedAlertHours: Number(byKey[TOURNE_SLA_KEYS.unassigned] ?? 0),
  }
}

export interface TourSlaFlags {
  transporterNoAck: boolean
  unassignedTooLong: boolean
}

export function tourSlaFlags(
  tour: Pick<DeliveryTour, 'execution_mode' | 'status' | 'created_at' | 'transporter_assigned_at' | 'transporter_org_id'>,
  thresholds: SlaThresholds,
  now: Date = new Date(),
): TourSlaFlags {
  const { transporterAckTimeoutHours, unassignedAlertHours } = thresholds

  let transporterNoAck = false
  if (
    tour.execution_mode === 'EXTERNAL' &&
    tour.status === 'PENDINGTRANSPORTERACK' &&
    transporterAckTimeoutHours > 0
  ) {
    const ref = tour.transporter_assigned_at ?? tour.created_at
    if (ref && now.getTime() - new Date(ref).getTime() > transporterAckTimeoutHours * 3_600_000) {
      transporterNoAck = true
    }
  }

  let unassignedTooLong = false
  if (
    tour.status === 'PLANNED' &&
    !tour.transporter_org_id &&
    unassignedAlertHours > 0
  ) {
    if (tour.created_at && now.getTime() - new Date(tour.created_at).getTime() > unassignedAlertHours * 3_600_000) {
      unassignedTooLong = true
    }
  }

  return { transporterNoAck, unassignedTooLong }
}

export function applyAction(
  tour: DeliveryTour,
  action: TourAction,
  now: Date = new Date(),
): Pick<DeliveryTour, 'status' | 'started_at' | 'closed_at' | 'transporter_assigned_at'> {
  const target = ACTION_TARGET[action].target
  const next: Partial<DeliveryTour> = { status: target }
  if (action === 'start') {
    next.started_at = tour.started_at ?? now.toISOString()
  }
  if (action === 'close') {
    next.closed_at = now.toISOString()
    if (!next.started_at) {
      next.started_at = tour.started_at ?? now.toISOString()
    }
  }
  if (action === 'acknowledge') {
    next.transporter_assigned_at = tour.transporter_assigned_at ?? now.toISOString()
  }
  return next as DeliveryTour
}
