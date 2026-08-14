import { create } from 'zustand'
import { curated } from '@lpg/mock-data'
import type { PickupRequest, PickupStatus } from '@lpg/types'

/**
 * Payload for creating a Flux-1 pickup request. Mirrors the schema's
 * `pickup_requests` constraints: `requested_quantity > 0` and
 * `chk_pickup_sites_different` (source != destination). A new request is
 * created with status DRAFT; ADMIN confirmation later sets `approved_quantity`
 * and moves it to VALIDATED.
 */
export interface PickupDraft {
  marketeur_org_id: string
  source_site_id: string
  destination_site_id: string
  requested_quantity: number
}

export interface PickupValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePickup(input: PickupDraft): PickupValidationResult {
  const errors: string[] = []

  if (input.source_site_id && input.destination_site_id && input.source_site_id === input.destination_site_id) {
    errors.push(
      'chk_pickup_sites_different: source and destination sites must differ',
    )
  }
  if (input.requested_quantity <= 0) {
    errors.push('chk_pickup_quantity: requested_quantity must be greater than 0')
  }
  if (!input.marketeur_org_id) {
    errors.push('pickup_requests.marketeur_org_id is mandatory')
  }
  if (!input.source_site_id || !input.destination_site_id) {
    errors.push('pickup_requests requires source_site_id and destination_site_id')
  }

  return { valid: errors.length === 0, errors }
}

interface PickupsState {
  pickups: PickupRequest[]
  createPickup: (draft: PickupDraft) => PickupRequest
  all: () => PickupRequest[]
  viewById: (id: string) => PickupRequest | undefined
}

export const usePickupsStore = create<PickupsState>()((set, get) => ({
  pickups: curated.pickup_requests.map((p) => ({ ...p })),

  createPickup(draft: PickupDraft) {
    const validation = validatePickup(draft)
    if (!validation.valid) {
      throw new Error(validation.errors[0])
    }
    const now = new Date().toISOString()
    const pickup: PickupRequest = {
      id: newPickupId(),
      marketeur_org_id: draft.marketeur_org_id,
      source_site_id: draft.source_site_id,
      destination_site_id: draft.destination_site_id,
      requested_quantity: draft.requested_quantity,
      approved_quantity: null,
      status: 'DRAFT',
      created_at: now,
      updated_at: now,
      deleted_at: null,
      created_by: null,
      updated_by: null,
    }
    set({ pickups: [pickup, ...get().pickups] })
    return pickup
  },

  all() {
    return [...get().pickups].sort((a, b) =>
      (b.created_at ?? '').localeCompare(a.created_at ?? ''),
    )
  },

  viewById(id: string) {
    return get().pickups.find((p) => p.id === id)
  },
}))

export function newPickupId(): string {
  return `pickup-${Date.now()}`
}

export const pickupStatusLabels: Record<PickupStatus, string> = {
  DRAFT: 'Brouillon',
  VALIDATED: 'Validée',
  INPROGRESS: 'En cours',
  COMPLETED: 'Complétée',
  CANCELLED: 'Annulée',
}