import { describe, expect, it } from 'vitest'
import {
  canTransition,
  nextStatuses,
  tourActions,
  validateTour,
  resolveSlaThresholds,
  tourSlaFlags,
  TOUR_ACTION_LABELS,
} from './tour-machine'
import type { DeliveryTour, Setting } from '@lpg/types'

const THRESHOLDS = { transporterAckTimeoutHours: 4, unassignedAlertHours: 12 }

function baseExternal(over: Partial<DeliveryTour> = {}): DeliveryTour {
  return {
    id: 't-1',
    marketeur_org_id: 'org-m1',
    execution_mode: 'EXTERNAL',
    transporter_org_id: 'org-t1',
    vehicle_id: null,
    driver_id: null,
    livreur_user_id: null,
    assigned_by_transporter_user_id: null,
    transporter_assigned_at: null,
    type: 'VRAC',
    status: 'DRAFT',
    requested_quantity: 10,
    loaded_quantity: null,
    delivered_quantity: null,
    started_at: null,
    closed_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    deleted_at: null,
    created_by: null,
    updated_by: null,
    ...over,
  }
}

describe('tour-machine transitions', () => {
  describe('canTransition', () => {
    it('allows INTERNAL forward chain DRAFT→PLANNED→INPROGRESS→CHECKPOINTACTIVE→CLOSED', () => {
      expect(canTransition('DRAFT', 'PLANNED', 'INTERNAL')).toBe(true)
      expect(canTransition('PLANNED', 'INPROGRESS', 'INTERNAL')).toBe(true)
      expect(canTransition('INPROGRESS', 'CHECKPOINTACTIVE', 'INTERNAL')).toBe(true)
      expect(canTransition('CHECKPOINTACTIVE', 'CLOSED', 'INTERNAL')).toBe(true)
    })

    it('allows EXTERNAL forward chain DRAFT→PENDINGTRANSPORTERACK→ACKNOWLEDGED→INPROGRESS→CHECKPOINTACTIVE→CLOSED', () => {
      expect(canTransition('DRAFT', 'PENDINGTRANSPORTERACK', 'EXTERNAL')).toBe(true)
      expect(canTransition('PENDINGTRANSPORTERACK', 'ACKNOWLEDGED', 'EXTERNAL')).toBe(true)
      expect(canTransition('ACKNOWLEDGED', 'INPROGRESS', 'EXTERNAL')).toBe(true)
      expect(canTransition('INPROGRESS', 'CHECKPOINTACTIVE', 'EXTERNAL')).toBe(true)
      expect(canTransition('CHECKPOINTACTIVE', 'CLOSED', 'EXTERNAL')).toBe(true)
    })

    it('disallows skip-ahead on either chain', () => {
      expect(canTransition('DRAFT', 'CLOSED', 'EXTERNAL')).toBe(false)
      expect(canTransition('PLANNED', 'CLOSED', 'EXTERNAL')).toBe(false)
    })

    it('disallows backward transitions', () => {
      expect(canTransition('CLOSED', 'CHECKPOINTACTIVE', 'EXTERNAL')).toBe(false)
      expect(canTransition('CHECKPOINTACTIVE', 'INPROGRESS', 'EXTERNAL')).toBe(false)
      expect(canTransition('ACKNOWLEDGED', 'PENDINGTRANSPORTERACK', 'EXTERNAL')).toBe(false)
    })

    it('disallows EXTERNAL from skipping acknowledgement', () => {
      expect(canTransition('PENDINGTRANSPORTERACK', 'INPROGRESS', 'EXTERNAL')).toBe(false)
    })

    it('allows cancel from any non-terminal state', () => {
      for (const from of ['DRAFT', 'PLANNED', 'INPROGRESS', 'CHECKPOINTACTIVE', 'PENDINGTRANSPORTERACK', 'ACKNOWLEDGED'] as const) {
        expect(canTransition(from, 'CANCELLED', 'EXTERNAL')).toBe(true)
      }
      for (const from of ['DRAFT', 'PLANNED', 'INPROGRESS', 'CHECKPOINTACTIVE'] as const) {
        expect(canTransition(from, 'CANCELLED', 'INTERNAL')).toBe(true)
      }
    })

    it('disallows transitions out of terminal states (closed/cancelled)', () => {
      expect(canTransition('CLOSED', 'CANCELLED', 'EXTERNAL')).toBe(false)
      expect(canTransition('CANCELLED', 'PLANNED', 'EXTERNAL')).toBe(false)
    })
  })

  describe('nextStatuses', () => {
    it('lists legal next statuses for an EXTERNAL DRAFT', () => {
      expect(nextStatuses('DRAFT', 'EXTERNAL')).toEqual(
        expect.arrayContaining(['PENDINGTRANSPORTERACK', 'CANCELLED']),
      )
      expect(nextStatuses('DRAFT', 'EXTERNAL')).not.toContain('CLOSED')
    })

    it('lists PLANNED next statuses for INTERNAL', () => {
      expect(nextStatuses('PLANNED', 'INTERNAL')).toEqual(
        expect.arrayContaining(['INPROGRESS', 'CANCELLED']),
      )
    })

    it('exposes only close+cancel from CHECKPOINTACTIVE', () => {
      expect(nextStatuses('CHECKPOINTACTIVE', 'EXTERNAL').sort()).toEqual(['CANCELLED', 'CLOSED'])
    })
  })

  describe('tourActions', () => {
    it('offers send-to-transporter + cancel on an EXTERNAL DRAFT', () => {
      const actions = tourActions(baseExternal({ status: 'DRAFT' }))
      expect(actions).toEqual(['cancel', 'send-to-transporter'])
    })

    it('offers acknowledge + cancel on PENDINGTRANSPORTERACK', () => {
      const actions = tourActions(baseExternal({ status: 'PENDINGTRANSPORTERACK' }))
      expect(actions).toEqual(['acknowledge', 'cancel'])
    })

    it('offers start + cancel on ACKNOWLEDGED', () => {
      const actions = tourActions(baseExternal({ status: 'ACKNOWLEDGED' }))
      expect(actions).toEqual(['cancel', 'start'])
    })

    it('exposes no actions on terminal CLOSED', () => {
      expect(tourActions(baseExternal({ status: 'CLOSED' }))).toEqual([])
    })

    it('has French labels for every action', () => {
      for (const key of Object.keys(TOUR_ACTION_LABELS)) {
        expect(TOUR_ACTION_LABELS[key as keyof typeof TOUR_ACTION_LABELS]).toBeTruthy()
      }
    })
  })
})

describe('tour-machine validation', () => {
  it('passes a fully-populated INTERNAL tour', () => {
    const tour = {
      execution_mode: 'INTERNAL',
      vehicle_id: 'v-1',
      driver_id: 'd-1',
      livreur_user_id: 'u-1',
      assigned_by_transporter_user_id: null,
      started_at: '2026-01-01T01:00:00.000Z',
      closed_at: '2026-01-01T02:00:00.000Z',
    }
    expect(validateTour(tour as DeliveryTour).valid).toBe(true)
  })

  it('flags chk_tournee_internal when INTERNAL lacks vehicle/driver/livreur', () => {
    const tour = baseExternal({
      execution_mode: 'INTERNAL',
      vehicle_id: null,
      driver_id: null,
      livreur_user_id: null,
      assigned_by_transporter_user_id: null,
    })
    const res = validateTour(tour)
    expect(res.valid).toBe(false)
    expect(res.errors.some((e) => e.includes('chk_tournee_internal'))).toBe(true)
  })

  it('flags chk_tournee_external when EXTERNAL has no transporter', () => {
    const tour = baseExternal({ transporter_org_id: null })
    const res = validateTour(tour)
    expect(res.valid).toBe(false)
    expect(res.errors.some((e) => e.includes('chk_tournee_external'))).toBe(true)
  })

  it('flags chk_tournee_no_double_assign when INTERNAL has assigned_by_transporter_user_id', () => {
    const tour = baseExternal({
      execution_mode: 'INTERNAL',
      vehicle_id: 'v-1',
      driver_id: 'd-1',
      livreur_user_id: 'u-1',
      assigned_by_transporter_user_id: 'u-assign',
    })
    const res = validateTour(tour)
    expect(res.valid).toBe(false)
    expect(res.errors.some((e) => e.includes('chk_tournee_no_double_assign'))).toBe(true)
  })

  it('flags chk_tournee_dates when closed before started', () => {
    const tour = baseExternal({
      started_at: '2026-01-01T02:00:00.000Z',
      closed_at: '2026-01-01T01:00:00.000Z',
    })
    const res = validateTour(tour)
    expect(res.valid).toBe(false)
    expect(res.errors.some((e) => e.includes('chk_tournee_dates'))).toBe(true)
  })
})

describe('tour-machine SLA', () => {
  const settings: Setting[] = [
    { id: 's1', setting_key: 'tournee.transporter_ack_timeout_hours', setting_value: '4', value_type: 'INTEGER', category: 'TOURNEE', description: '', is_encrypted: false },
    { id: 's2', setting_key: 'tournee.unassigned_alert_hours', setting_value: '12', value_type: 'INTEGER', category: 'TOURNEE', description: '', is_encrypted: false },
  ]

  it('resolveSlaThresholds reads by key from settings', () => {
    const t = resolveSlaThresholds(settings)
    expect(t.transporterAckTimeoutHours).toBe(4)
    expect(t.unassignedAlertHours).toBe(12)
  })

  it('flags TRANSPORTERNOACK when PENDINGTRANSPORTERACK older than timeout', () => {
    const tooOld = '2026-01-01T00:00:00.000Z'
    const tour = baseExternal({
      status: 'PENDINGTRANSPORTERACK',
      created_at: tooOld,
      transporter_assigned_at: tooOld,
    })
    const now = new Date('2026-01-01T05:00:00.000Z')
    expect(tourSlaFlags(tour, THRESHOLDS, now).transporterNoAck).toBe(true)
  })

  it('does not flag TRANSPORTERNOACK within the window', () => {
    const recent = '2026-01-01T00:00:00.000Z'
    const tour = baseExternal({
      status: 'PENDINGTRANSPORTERACK',
      created_at: recent,
      transporter_assigned_at: recent,
    })
    const now = new Date('2026-01-01T02:00:00.000Z')
    expect(tourSlaFlags(tour, THRESHOLDS, now).transporterNoAck).toBe(false)
  })

  it('flags TOURNEEUNASSIGNEDTOOLONG for PLANNED without assignment older than threshold', () => {
    const tooOld = '2026-01-01T00:00:00.000Z'
    const tour = baseExternal({
      execution_mode: 'EXTERNAL',
      status: 'PLANNED',
      transporter_org_id: null,
      created_at: tooOld,
    })
    const now = new Date('2026-01-02T02:00:00.000Z')
    expect(tourSlaFlags(tour, THRESHOLDS, now).unassignedTooLong).toBe(true)
  })

  it('does not flag unassigned when already assigned', () => {
    const recent = '2026-01-01T00:00:00.000Z'
    const tour = baseExternal({
      status: 'PLANNED',
      created_at: recent,
    })
    const now = new Date('2026-01-02T02:00:00.000Z')
    expect(tourSlaFlags(tour, THRESHOLDS, now).unassignedTooLong).toBe(false)
  })
})
