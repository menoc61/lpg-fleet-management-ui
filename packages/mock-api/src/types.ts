import type {
  Role,
  OrgType,
  SiteClassification,
  TruckStatus,
} from '@lpg/types'

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

export type EntityName =
  | 'organizations'
  | 'users'
  | 'sites'
  | 'trucks'
  | 'tours'
  | 'declarations'
  | 'anomalies'
  | 'reports'
  | 'pda'
  | 'infra'

export type EntityMap = {
  organizations: Organization
  users: AppUser
  sites: Site
  trucks: Truck
  tours: Tour
  declarations: Declaration
  anomalies: Anomaly
  reports: Report
  pda: PdaDevice
  infra: InfraMetric
}
