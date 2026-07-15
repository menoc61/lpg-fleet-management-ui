// Shared domain types for the LPG Fleet Management platform.
// Consumed by every workspace app (web console, driver PDA, etc.).

export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SUPERVISOR'
  | 'INTEGRATEUR'
  | 'AGENT'
  | 'MARKETEUR'
  | 'LIVREUR'

export type OrgType = 'csph' | 'scdp' | 'snh' | 'marketeur' | 'transporteur'

export type SiteClassification =
  | 'centre_emplisseur'
  | 'depot'
  | 'point_approvisionnement'
  | 'client'

export type BottleStatus = 'in_empty' | 'out_full'

export type TruckStatus =
  | 'available'
  | 'in_transit'
  | 'maintenance'
  | 'inactive'

export type TransporterStatus = 'active' | 'pending' | 'suspended'

/** Standardised backend API response envelope (see CdCF §5.4). */
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  données: T
  pagination?: Pagination
  filtres?: ApiFilters
}

export interface Pagination {
  page: number
  limite: number
  total: number
}

export interface ApiFilters {
  dateDebut?: string
  dateFin?: string
  tri?: string
  groupement?: string
}
