export type PickupStatus = 'DRAFT' | 'VALIDATED' | 'INPROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Pickup {
  id: string
  reference: string
  source_name: string
  destination_name: string
  marketeur_name: string
  requested_quantity: number
  approved_quantity: number | null
  pickup_status: PickupStatus
  requested_at: string
  validated_at: string | null
  started_at: string | null
  completed_at: string | null
  proof_url: string | null
}

export const pickupStatusLabels: Record<PickupStatus, string> = {
  DRAFT: 'Brouillon',
  VALIDATED: 'Validée',
  INPROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
}

export const pickupStatusOptions = (
  Object.keys(pickupStatusLabels) as PickupStatus[]
).map((v) => ({ label: pickupStatusLabels[v], value: v }))

export function getPickups(): Pickup[] {
  return [
    {
      id: 'pickup-1', reference: 'PU-1001',
      source_name: 'SCDP Douala', destination_name: 'Centre emplisseur Yaoundé',
      marketeur_name: 'Tradex Cameroun', requested_quantity: 36000,
      approved_quantity: 36000, pickup_status: 'VALIDATED',
      requested_at: '2026-07-01T08:00:00Z', validated_at: '2026-07-02T10:00:00Z',
      started_at: null, completed_at: null, proof_url: null,
    },
    {
      id: 'pickup-2', reference: 'PU-1002',
      source_name: 'SNH Bipaga', destination_name: 'Dépôt Bafoussam',
      marketeur_name: 'Total Cameroun', requested_quantity: 18000,
      approved_quantity: null, pickup_status: 'DRAFT',
      requested_at: '2026-07-10T08:00:00Z', validated_at: null,
      started_at: null, completed_at: null, proof_url: null,
    },
    {
      id: 'pickup-3', reference: 'PU-1003',
      source_name: 'SCDP Yaoundé', destination_name: 'Dépôt Garoua',
      marketeur_name: 'AZA Afrigaz', requested_quantity: 54000,
      approved_quantity: 54000, pickup_status: 'INPROGRESS',
      requested_at: '2026-07-05T08:00:00Z', validated_at: '2026-07-06T09:00:00Z',
      started_at: '2026-07-07T06:00:00Z', completed_at: null, proof_url: null,
    },
    {
      id: 'pickup-4', reference: 'PU-1004',
      source_name: 'Centre emplisseur Bonaberi', destination_name: 'Tradex Akwa',
      marketeur_name: 'Shell Cameroon', requested_quantity: 27000,
      approved_quantity: 27000, pickup_status: 'COMPLETED',
      requested_at: '2026-06-20T08:00:00Z', validated_at: '2026-06-21T10:00:00Z',
      started_at: '2026-06-22T06:00:00Z', completed_at: '2026-06-22T14:00:00Z',
      proof_url: null,
    },
    {
      id: 'pickup-5', reference: 'PU-1005',
      source_name: 'SCDP Douala', destination_name: 'Total Bonamoussadi',
      marketeur_name: 'ENEO', requested_quantity: 9000,
      approved_quantity: null, pickup_status: 'CANCELLED',
      requested_at: '2026-07-15T08:00:00Z', validated_at: null,
      started_at: null, completed_at: null, proof_url: null,
    },
  ]
}

export function getPickupSummary(rows: Pickup[]) {
  return {
    total: rows.length,
    draft: rows.filter((r) => r.pickup_status === 'DRAFT').length,
    validated: rows.filter((r) => r.pickup_status === 'VALIDATED').length,
    inProgress: rows.filter((r) => r.pickup_status === 'INPROGRESS').length,
    completed: rows.filter((r) => r.pickup_status === 'COMPLETED').length,
    cancelled: rows.filter((r) => r.pickup_status === 'CANCELLED').length,
  }
}