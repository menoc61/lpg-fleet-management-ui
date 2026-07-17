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

// ---- Domain entities (shared contract between mock + real backend + UI) ----

export interface Organization {
  id: string
  name: string
  type: OrgType
  code: string
  region: string
  active: boolean
}

export interface AppUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  organizationId: string
  active: boolean
}

export interface Site {
  id: string
  name: string
  classification: SiteClassification
  organizationId: string
  city: string
  lat: number
  lng: number
}

export interface Truck {
  id: string
  plate: string
  status: TruckStatus
  organizationId: string
  capacityKg: number
  lastSeen: string
}

export interface Tour {
  id: string
  reference: string
  truckId: string
  driverId: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  plannedDate: string
  stops: number
}

export interface Declaration {
  id: string
  reference: string
  marketeurId: string
  siteId: string
  status: 'draft' | 'submitted' | 'validated' | 'rejected'
  bottlesIn: number
  bottlesOut: number
  declaredAt: string
}

export interface Anomaly {
  id: string
  type: 'gps' | 'rfid' | 'weight' | 'iot'
  severity: 'low' | 'medium' | 'high'
  resourceId: string
  message: string
  detectedAt: string
  resolved: boolean
}

export interface Report {
  id: string
  title: string
  category: 'operations' | 'finance' | 'compliance'
  generatedAt: string
  author: string
}

export interface PdaDevice {
  id: string
  serial: string
  status: 'online' | 'offline' | 'maintenance'
  assignedTo: string | null
  lastSync: string
}

export interface InfraMetric {
  id: string
  service: string
  cpu: number
  memory: number
  status: 'healthy' | 'degraded' | 'down'
  measuredAt: string
}

/** Standardised backend API response envelope (see CdCF §5.4). */
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  donnees: T
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
