import type {
  Role,
  OrgType,
  SiteType,
  SiteStatus,
  TruckStatus,
  ContractTier,
  TruckRiskLevel,
  TransporterStatus,
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

export interface Transporter {
  id: string
  name: string
  status: TransporterStatus
  region: string
  contactEmail: string
  contactPhone: string
  fleetSize: number
}

export interface Site {
  id: string
  name: string
  type: SiteType
  city: string
  region: string
  operator: string
  lat: number
  lng: number
  status: SiteStatus
  description: string
  isKeySite?: boolean
  organizationId?: string
}

export interface Truck {
  id: string
  plateNumber: string
  tenantName: string
  marketer: string
  status: TruckStatus
  tankCapacityLiters: number
  compartments: number
  fuelType: 'GPL'
  makeModel: string
  year: number
  gpsImei: string
  assignedDriver: string
  driverPhone: string
  fleetManager: string
  operatingRegion: string
  homeDepot: string
  currentLocation: string
  latitude: number
  longitude: number
  destination: string
  destinationLatitude: number
  destinationLongitude: number
  assignedRoute: string
  odometerKm: number
  nextServiceKm: number
  lastServiceDate: string
  insuranceExpiry: string
  technicalVisitExpiry: string
  permitExpiry: string
  lastPing: string
  contractTier: ContractTier
  riskLevel: TruckRiskLevel
  organizationId?: string
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
  | 'transporters'

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
  transporters: Transporter
}
