import { describe, expect, it, beforeEach } from 'vitest'
import { useToursStore } from './tours-store'
import { curated } from '@lpg/mock-data'
import type { DeliveryTour } from '@lpg/types'
import { tourStatusLabels, getTourCargo, getTourVolume } from '@/features/tours/data/tour-activity'

const MARKETEUR_ORG = 'org-0002-sctm-0000-000000000001'
const TRANSPORTEUR_ORG = 'org-0011-expressgpl--000000000001'
const VEHICLE_ID = 'veh-0001-lt1123ub'
const DRIVER_ID = 'driver-0003-youssouf-hamadou'
const LIVREUR_ID = 'user-0010-sctm-livreur1'

function freshSeed() {
  return {
    tours: curated.delivery_tours.map((t) => ({ ...t })),
    checkpoints: curated.checkpoints.map((c) => ({ ...c })),
  }
}

function freshCuratedWithActiveCerts() {
  const oneYearFromNow = new Date(
    Date.now() + 365 * 24 * 3600 * 1000,
  ).toISOString()
  return {
    ...curated,
    vehicles: curated.vehicles.map((v) =>
      v.type === 'VRAC'
        ? {
            ...v,
            certificate_number: v.certificate_number ?? 'CERT-VRAC-TEST-001',
            certificate_url:
              v.certificate_url ?? 'https://certifs.test/cert.pdf',
            certificate_issued_at:
              v.certificate_issued_at ?? new Date().toISOString(),
            certificate_expiry_at: oneYearFromNow,
          }
        : v,
    ),
  }
}

function inject(tour: Partial<DeliveryTour> & Pick<DeliveryTour, 'id'>) {
  useToursStore.setState((s) => ({ tours: [...s.tours, { ...tour } as DeliveryTour] }))
}

describe('tours store', () => {
  beforeEach(() => {
    useToursStore.setState(freshSeed())
    // Validate against a copy of curated with VRAC certs refreshed to one year
    // out — the seeded fixture has expired dates (the demo data simulates
    // renewals due, which would otherwise fail the cert check).
    Object.assign(curated, freshCuratedWithActiveCerts())
  })

  describe('createTour', () => {
    it('creates a valid INTERNAL tour pre-filled with crew', () => {
      const countBefore = useToursStore.getState().tours.length
      const view = useToursStore.getState().createTour({
        marketeur_org_id: MARKETEUR_ORG,
        execution_mode: 'INTERNAL',
        type: 'VRAC',
        requested_quantity: 5000,
        vehicle_id: VEHICLE_ID,
        driver_id: DRIVER_ID,
        livreur_user_id: LIVREUR_ID,
      })

      expect(view.tourneeStatus).toBe('DRAFT')
      expect(view.execution_mode).toBe('INTERNAL')
      expect(tourStatusLabels[view.tourneeStatus]).toBe('Brouillon')
      expect(getTourCargo(view)).toBe('GPL vrac')
      expect(view.reference).toBe('TRP-2401')
      expect(view.originSite.id).toBeDefined()
      expect(typeof view.progressPercent).toBe('number')
      expect(useToursStore.getState().tours.length).toBe(countBefore + 1)
      expect(useToursStore.getState().tours.find((t) => t.id === view.id)).toBeDefined()
    })

    it('creates a valid EXTERNAL tour without crew (transporter assigns later)', () => {
      const view = useToursStore.getState().createTour({
        marketeur_org_id: MARKETEUR_ORG,
        execution_mode: 'EXTERNAL',
        type: 'BOUTEILLES50KG',
        requested_quantity: 200,
        transporter_org_id: TRANSPORTEUR_ORG,
      })

      expect(view.tourneeStatus).toBe('DRAFT')
      expect(view.execution_mode).toBe('EXTERNAL')
      expect(tourStatusLabels[view.tourneeStatus]).toBe('Brouillon')
      expect(getTourCargo(view)).toBe('Bouteilles 50 kg')
      expect(getTourVolume(view)).toBe('200 btl')
    })

    it('throws chk_tournee_internal for an INTERNAL draft without vehicle/driver/livreur', () => {
      expect(() =>
        useToursStore.getState().createTour({
          marketeur_org_id: MARKETEUR_ORG,
          execution_mode: 'INTERNAL',
          type: 'VRAC',
          requested_quantity: 3000,
        }),
      ).toThrow(/chk_tournee_internal/)
    })

    it('throws chk_tournee_external for an EXTERNAL draft without a transporter', () => {
      expect(() =>
        useToursStore.getState().createTour({
          marketeur_org_id: MARKETEUR_ORG,
          execution_mode: 'EXTERNAL',
          type: 'BOUTEILLES50KG',
          requested_quantity: 120,
        }),
      ).toThrow(/chk_tournee_external/)
    })

    it('does not mutate the shared curated fixture', () => {
      const originalLength = curated.delivery_tours.length
      useToursStore.getState().createTour({
        marketeur_org_id: MARKETEUR_ORG,
        execution_mode: 'INTERNAL',
        type: 'VRAC',
        requested_quantity: 1000,
        vehicle_id: VEHICLE_ID,
        driver_id: DRIVER_ID,
        livreur_user_id: LIVREUR_ID,
      })
      expect(curated.delivery_tours.length).toBe(originalLength)
    })
  })

  describe('performAction', () => {
    it('acknowledges an EXTERNAL PENDINGTRANSPORTERACK tour and stamps the assignment time', () => {
      const view = useToursStore.getState().performAction('tour-005', 'acknowledge')
      expect(view.tourneeStatus).toBe('ACKNOWLEDGED')
      expect(tourStatusLabels[view.tourneeStatus]).toBe('Accusée')
      const stored = useToursStore.getState().tours.find((t) => t.id === 'tour-005')!
      expect(stored.status).toBe('ACKNOWLEDGED')
      expect(typeof stored.transporter_assigned_at).toBe('string')
      expect(stored.transporter_assigned_at).toBeTruthy()
    })

    it('starts an ACKNOWLEDGED tour and stamps started_at', () => {
      const view = useToursStore.getState().performAction('tour-009', 'start')
      expect(view.tourneeStatus).toBe('INPROGRESS')
      expect(tourStatusLabels[view.tourneeStatus]).toBe('En transit')
      const stored = useToursStore.getState().tours.find((t) => t.id === 'tour-009')!
      expect(stored.status).toBe('INPROGRESS')
      expect(typeof stored.started_at).toBe('string')
      expect(stored.started_at).toBeTruthy()
    })

    it('throws when the action is not legal from the current status', () => {
      // tour-005 is PENDINGTRANSPORTERACK: `start` targets INPROGRESS, which is not the
      // immediate next on the EXTERNAL chain, so it is disallowed.
      expect(() => useToursStore.getState().performAction('tour-005', 'start')).toThrow(
        /Transition interdite/,
      )
    })

    it('throws when the tour id does not exist', () => {
      expect(() => useToursStore.getState().performAction('does-not-exist', 'cancel')).toThrow(
        /Tournée introuvable/,
      )
    })

    it('blocks a non-cancel action when the tour fails validation', () => {
      // Craft an EXTERNAL INPROGRESS tour whose closed_at precedes started_at.
      // `close` is legal (next on EXTERNAL chain) but validation must guard it.
      const bad: DeliveryTour = {
        id: 'synthetic-bad',
        marketeur_org_id: MARKETEUR_ORG,
        execution_mode: 'EXTERNAL',
        transporter_org_id: TRANSPORTEUR_ORG,
        vehicle_id: null,
        driver_id: null,
        livreur_user_id: null,
        assigned_by_transporter_user_id: null,
        transporter_assigned_at: null,
        type: 'VRAC',
        status: 'CHECKPOINTACTIVE',
        requested_quantity: 1000,
        loaded_quantity: null,
        delivered_quantity: null,
        started_at: '2026-06-01T10:00:00.000Z',
        closed_at: '2026-06-01T09:00:00.000Z',
        created_at: '2026-05-30T00:00:00.000Z',
        updated_at: '2026-06-01T00:00:00.000Z',
      }
      inject(bad)
      expect(() => useToursStore.getState().performAction('synthetic-bad', 'close')).toThrow(
        /chk_tournee_dates/,
      )
    })

    it('still permits cancel on an invalid tour (validation is skipped for cancel)', () => {
      const bad: DeliveryTour = {
        id: 'synthetic-cancel-ok',
        marketeur_org_id: MARKETEUR_ORG,
        execution_mode: 'EXTERNAL',
        transporter_org_id: TRANSPORTEUR_ORG,
        vehicle_id: null,
        driver_id: null,
        livreur_user_id: null,
        assigned_by_transporter_user_id: null,
        transporter_assigned_at: null,
        type: 'VRAC',
        status: 'CHECKPOINTACTIVE',
        requested_quantity: 1000,
        loaded_quantity: null,
        delivered_quantity: null,
        started_at: '2026-06-01T10:00:00.000Z',
        closed_at: '2026-06-01T09:00:00.000Z',
        created_at: '2026-05-30T00:00:00.000Z',
        updated_at: '2026-06-01T00:00:00.000Z',
      }
      inject(bad)
      const view = useToursStore.getState().performAction('synthetic-cancel-ok', 'cancel')
      expect(view.tourneeStatus).toBe('CANCELLED')
      expect(tourStatusLabels[view.tourneeStatus]).toBe('Annulée')
    })
  })

  describe('views (slice filtering)', () => {
    it('returns all tours for the ALL slice', () => {
      expect(useToursStore.getState().views('ALL').length).toBe(curated.delivery_tours.length)
    })

    it('partitions INTERNAL vs EXTERNAL', () => {
      expect(useToursStore.getState().views('INTERNAL').length).toBe(7)
      expect(useToursStore.getState().views('EXTERNAL').length).toBe(3)
    })

    it('surfaces only PENDINGTRANSPORTERACK tours', () => {
      expect(useToursStore.getState().views('PENDING').length).toBe(1)
      expect(useToursStore.getState().views('PENDING')[0]!.tourneeStatus).toBe('PENDINGTRANSPORTERACK')
    })

    it('surfaces in-progress tours (INPROGRESS or CHECKPOINTACTIVE)', () => {
      expect(useToursStore.getState().views('ACTIVE').length).toBe(4)
    })

    it('surfaces history (CLOSED / CANCELLED)', () => {
      expect(useToursStore.getState().views('HISTORY').length).toBe(2)
    })
  })

  describe('viewById', () => {
    it('returns an enriched view for a known id', () => {
      const view = useToursStore.getState().viewById('tour-001')
      expect(view).toBeDefined()
      expect(tourStatusLabels[view!.tourneeStatus]).toBe('Livrée')
      expect(view!.execution_mode).toBe('INTERNAL')
      expect(view!.checkpoint_count).toBeGreaterThanOrEqual(0)
    })

    it('returns undefined for a missing id', () => {
      expect(useToursStore.getState().viewById('no-such-tour')).toBeUndefined()
    })

    it('reflects subsequent store mutations', () => {
      expect(useToursStore.getState().viewById('tour-005')!.tourneeStatus).toBe('PENDINGTRANSPORTERACK')
      useToursStore.getState().performAction('tour-005', 'acknowledge')
      expect(useToursStore.getState().viewById('tour-005')!.tourneeStatus).toBe('ACKNOWLEDGED')
    })
  })
})
