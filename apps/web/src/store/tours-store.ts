import { create } from 'zustand'
import { curated } from '@lpg/mock-data'
import type { DeliveryTour, Checkpoint, ExecutionMode, TourneeType } from '@lpg/types'
import { toTourActivities, type TourActivity, type TourSlice } from '@/features/tours/data/tour-activity'
import {
  applyAction,
  tourActions,
  validateTour,
  type TourAction,
} from '@/features/tours/data/tour-machine'

/**
 * Payload for creating a tour. Mirrors the schema's `chk_tournee_internal` /
 * `chk_tournee_external` constraints: INTERNAL requires the marketeur's own
 * crew+vehicle, EXTERNAL requires a transporter_org_id and leaves the crew
 * NULL for the transporter to assign at acknowledgement time.
 */
export interface TourDraft {
  marketeur_org_id: string
  execution_mode: ExecutionMode
  type: TourneeType
  requested_quantity: number
  transporter_org_id?: string | null
  vehicle_id?: string | null
  driver_id?: string | null
  livreur_user_id?: string | null
}

interface ToursState {
  tours: DeliveryTour[]
  checkpoints: Checkpoint[]
  createTour: (draft: TourDraft) => TourActivity
  performAction: (id: string, action: TourAction) => TourActivity
  views: (slice: TourSlice) => TourActivity[]
  viewById: (id: string) => TourActivity | undefined
}

export const useToursStore = create<ToursState>()((set, get) => ({
  tours: curated.delivery_tours.map((t) => ({ ...t })),
  checkpoints: curated.checkpoints.map((c) => ({ ...c })),

  createTour(draft: TourDraft) {
    const now = new Date().toISOString()
    // Initial status follows the schema §3.1 entry point per mode:
    //   INTERNAL → DRAFT (marketeur assigns crew → PLANNED)
    //   EXTERNAL → DRAFT (marketeur sends → PENDINGTRANSPORTERACK)
    const tour: DeliveryTour = {
      id: newTourId(),
      marketeur_org_id: draft.marketeur_org_id,
      execution_mode: draft.execution_mode,
      transporter_org_id: draft.transporter_org_id ?? null,
      vehicle_id: draft.vehicle_id ?? null,
      driver_id: draft.driver_id ?? null,
      livreur_user_id: draft.livreur_user_id ?? null,
      assigned_by_transporter_user_id: null,
      transporter_assigned_at: null,
      sent_to_transporter_at: null,
      type: draft.type,
      status: 'DRAFT',
      requested_quantity: draft.requested_quantity,
      loaded_quantity: null,
      delivered_quantity: null,
      started_at: null,
      closed_at: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      created_by: null,
      updated_by: null,
    }
    const validation = validateTour(tour, { vehicles: curated.vehicles })
    if (!validation.valid) {
      throw new Error(validation.errors[0])
    }
    set({ tours: [tour, ...get().tours] })
    return toTourActivities([tour], { checkpoints: get().checkpoints })[0]!
  },

  performAction(id: string, action: TourAction) {
    const tours = get().tours
    const index = tours.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error(`Tournée introuvable : ${id}`)
    }
    const current = tours[index]!
    const allowed = tourActions(current)
    if (!allowed.includes(action)) {
      throw new Error(`Transition interdite à l'état ${current.status}`)
    }
    const validation = validateTour(current, { vehicles: curated.vehicles })
    if (!validation.valid && action !== 'cancel') {
      throw new Error(validation.errors[0])
    }

    const result = applyAction(current, action, new Date())
    const next: DeliveryTour = { ...current, ...result }
    tours[index] = next
    set({ tours: [...tours] })
    return toTourActivities([next], { checkpoints: get().checkpoints })[0]!
  },

  views(slice: TourSlice) {
    const tours = get().tours
    const filtered =
      slice === 'ALL'
        ? tours
        : tours.filter((t) => {
            switch (slice) {
              case 'INTERNAL':
                return t.execution_mode === 'INTERNAL'
              case 'EXTERNAL':
                return t.execution_mode === 'EXTERNAL'
              case 'PENDING':
                return t.status === 'PENDINGTRANSPORTERACK'
              case 'ACTIVE':
                return t.status === 'INPROGRESS' || t.status === 'CHECKPOINTACTIVE'
              case 'HISTORY':
                return t.status === 'CLOSED' || t.status === 'CANCELLED'
              default:
                return true
            }
          })
    return toTourActivities(
      [...filtered].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')),
      { checkpoints: get().checkpoints },
    )
  },

  viewById(id: string) {
    const index = get().tours.findIndex((t) => t.id === id)
    if (index === -1) return undefined
    return toTourActivities([get().tours[index]!], { checkpoints: get().checkpoints })[0]
  },
}))

export function newTourId(): string {
  return `tournee-${Date.now()}`
}