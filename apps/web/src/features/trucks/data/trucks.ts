export type TruckStatus =
  | 'available'
  | 'in_transit'
  | 'maintenance'
  | 'inactive'

export type contract_tier = 'Starter' | 'Growth' | 'Enterprise'

export type Truckrisk_level = 'low' | 'medium' | 'high'

export type Truck = {
  id: string
  plate_number: string
  tenant_name: string
  marketer: string
  status: TruckStatus
  tank_capacity_liters: number
  compartments: number
  fuelType: 'GPL'
  make_model: string
  year: number
  gpsImei: string
  assigned_driver: string
  driver_phone: string
  fleet_manager: string
  operating_region: string
  home_depot: string
  current_location: string
  latitude: number
  longitude: number
  destination: string
  destination_latitude: number
  destination_longitude: number
  assigned_route: string
  odometerKm: number
  nextServiceKm: number
  last_service_date: string
  insurance_expiry: string
  technical_visit_expiry: string
  permit_expiry: string
  last_ping: string
  contract_tier: contract_tier
  risk_level: Truckrisk_level
}

export type TruckTelemetry = {
  speed_kmh: number
  lpg_level_percent: number
  eta_text: string
  distance_km: number
  route_progress: number
  pressureBar: number
  temperature_celsius: number
}

export const statusLabels: Record<TruckStatus, string> = {
  available: 'Disponible',
  in_transit: 'En livraison',
  maintenance: 'Maintenance',
  inactive: 'Inactif',
}

export const statusClasses: Record<TruckStatus, string> = {
  available:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  in_transit:
    'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  maintenance:
    'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  inactive: 'bg-muted text-muted-foreground',
}

export const riskLabels: Record<Truckrisk_level, string> = {
  low: 'Normal',
  medium: 'A surveiller',
  high: 'Critique',
}

export const riskClasses: Record<Truckrisk_level, string> = {
  low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  medium:
    'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  high: 'bg-red-500/10 text-red-700 dark:text-red-300',
}

export const truckStatusOptions = [
  { label: 'Disponible', value: 'available' },
  { label: 'En livraison', value: 'in_transit' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Inactif', value: 'inactive' },
]

export const contract_tierOptions = [
  { label: 'Starter', value: 'Starter' },
  { label: 'Growth', value: 'Growth' },
  { label: 'Enterprise', value: 'Enterprise' },
]

export const trucks: Truck[] = [
  {
    id: 'TRX-CM-001',
    plate_number: 'CE 2145 AB',
    tenant_name: 'Tradex',
    marketer: 'Tradex Douala',
    status: 'available',
    tank_capacity_liters: 22000,
    compartments: 3,
    fuelType: 'GPL',
    make_model: 'HOWO Sinotruk 6x4',
    year: 2022,
    gpsImei: '356938035643809',
    assigned_driver: 'Nji Gilbert',
    driver_phone: '+237 6 72 14 09 31',
    fleet_manager: 'Diane Fotso',
    operating_region: 'Littoral',
    home_depot: 'Dépôt Bonaberi',
    current_location: 'Dépôt Bonaberi, Douala',
    latitude: 4.0751,
    longitude: 9.6814,
    destination: 'Station Tradex Akwa',
    destination_latitude: 4.0498,
    destination_longitude: 9.7679,
    assigned_route: 'Bonaberi - Akwa',
    odometerKm: 58240,
    nextServiceKm: 61750,
    last_service_date: '2026-03-18',
    insurance_expiry: '2026-11-08',
    technical_visit_expiry: '2026-09-22',
    permit_expiry: '2026-10-14',
    last_ping: '2026-04-23T10:42:00+01:00',
    contract_tier: 'Enterprise',
    risk_level: 'low',
  },
  {
    id: 'TTC-CM-002',
    plate_number: 'LT 8870 AD',
    tenant_name: 'Total Cameroun',
    marketer: 'Total Yaounde',
    status: 'in_transit',
    tank_capacity_liters: 18000,
    compartments: 2,
    fuelType: 'GPL',
    make_model: 'Mercedes Actros 1845',
    year: 2021,
    gpsImei: '356938035643810',
    assigned_driver: 'Mbah Armel',
    driver_phone: '+237 6 90 44 18 26',
    fleet_manager: 'Patrick Ngono',
    operating_region: 'Centre',
    home_depot: 'Dépôt Mvan',
    current_location: 'Axe Yaounde - Mbalmayo',
    latitude: 3.6828,
    longitude: 11.5156,
    destination: 'Station Total Ebolowa',
    destination_latitude: 2.9167,
    destination_longitude: 11.15,
    assigned_route: 'Yaounde - Ebolowa',
    odometerKm: 74315,
    nextServiceKm: 78000,
    last_service_date: '2026-02-25',
    insurance_expiry: '2026-08-19',
    technical_visit_expiry: '2026-06-30',
    permit_expiry: '2026-07-01',
    last_ping: '2026-04-23T10:39:00+01:00',
    contract_tier: 'Growth',
    risk_level: 'medium',
  },
  {
    id: 'CEX-CM-003',
    plate_number: 'CE 5312 BA',
    tenant_name: 'Centre Emplisseur Bonaberi',
    marketer: 'Hub Littoral',
    status: 'maintenance',
    tank_capacity_liters: 16000,
    compartments: 2,
    fuelType: 'GPL',
    make_model: 'Iveco Trakker 410',
    year: 2019,
    gpsImei: '356938035643811',
    assigned_driver: 'Tchana Boris',
    driver_phone: '+237 6 77 01 85 42',
    fleet_manager: 'Helene Kamga',
    operating_region: 'Littoral',
    home_depot: 'Atelier Bonaberi',
    current_location: 'Atelier Bonaberi',
    latitude: 4.079,
    longitude: 9.6827,
    destination: 'Controle technique',
    destination_latitude: 4.079,
    destination_longitude: 9.6827,
    assigned_route: 'Maintenance atelier',
    odometerKm: 121904,
    nextServiceKm: 122000,
    last_service_date: '2026-04-21',
    insurance_expiry: '2026-05-28',
    technical_visit_expiry: '2026-05-02',
    permit_expiry: '2026-05-18',
    last_ping: '2026-04-23T09:58:00+01:00',
    contract_tier: 'Starter',
    risk_level: 'high',
  },
  {
    id: 'MKT-CM-004',
    plate_number: 'NW 4042 AC',
    tenant_name: 'Marketer Y',
    marketer: 'Marketer Y Bafoussam',
    status: 'inactive',
    tank_capacity_liters: 12000,
    compartments: 1,
    fuelType: 'GPL',
    make_model: 'MAN TGS 18.440',
    year: 2018,
    gpsImei: '356938035643812',
    assigned_driver: 'Fongang Junior',
    driver_phone: '+237 6 99 64 74 11',
    fleet_manager: 'Nadine Talla',
    operating_region: 'Ouest',
    home_depot: 'Dépôt Bafoussam',
    current_location: 'Dépôt Bafoussam',
    latitude: 5.4781,
    longitude: 10.4178,
    destination: 'Non affecte',
    destination_latitude: 5.4781,
    destination_longitude: 10.4178,
    assigned_route: 'Standby',
    odometerKm: 134680,
    nextServiceKm: 138500,
    last_service_date: '2026-01-17',
    insurance_expiry: '2026-12-03',
    technical_visit_expiry: '2026-10-16',
    permit_expiry: '2026-12-03',
    last_ping: '2026-04-22T17:15:00+01:00',
    contract_tier: 'Starter',
    risk_level: 'medium',
  },
  {
    id: 'TRX-CM-005',
    plate_number: 'CE 7753 AE',
    tenant_name: 'Tradex',
    marketer: 'Tradex Kribi',
    status: 'in_transit',
    tank_capacity_liters: 20000,
    compartments: 3,
    fuelType: 'GPL',
    make_model: 'Renault Trucks C460',
    year: 2023,
    gpsImei: '356938035643813',
    assigned_driver: 'Ekane Samuel',
    driver_phone: '+237 6 96 28 45 33',
    fleet_manager: 'Diane Fotso',
    operating_region: 'Sud',
    home_depot: 'Dépôt Kribi',
    current_location: 'Axe Kribi - Edea',
    latitude: 3.6312,
    longitude: 10.0454,
    destination: 'Dépôt Bonaberi',
    destination_latitude: 4.0751,
    destination_longitude: 9.6814,
    assigned_route: 'Kribi - Douala',
    odometerKm: 31420,
    nextServiceKm: 36000,
    last_service_date: '2026-03-29',
    insurance_expiry: '2027-02-14',
    technical_visit_expiry: '2026-12-18',
    permit_expiry: '2027-01-09',
    last_ping: '2026-04-23T10:41:00+01:00',
    contract_tier: 'Enterprise',
    risk_level: 'low',
  },
  {
    id: 'TTC-CM-006',
    plate_number: 'CE 1207 AF',
    tenant_name: 'Total Cameroun',
    marketer: 'Total Douala',
    status: 'available',
    tank_capacity_liters: 24000,
    compartments: 4,
    fuelType: 'GPL',
    make_model: 'Volvo FMX 420',
    year: 2020,
    gpsImei: '356938035643814',
    assigned_driver: 'Ndombe Patrice',
    driver_phone: '+237 6 75 82 18 09',
    fleet_manager: 'Patrick Ngono',
    operating_region: 'Littoral',
    home_depot: 'Dépôt Bassa',
    current_location: 'Dépôt Bassa, Douala',
    latitude: 4.0589,
    longitude: 9.7592,
    destination: 'Station Total Bonamoussadi',
    destination_latitude: 4.0912,
    destination_longitude: 9.7411,
    assigned_route: 'Bassa - Bonamoussadi',
    odometerKm: 90135,
    nextServiceKm: 93500,
    last_service_date: '2026-02-11',
    insurance_expiry: '2026-09-09',
    technical_visit_expiry: '2026-08-10',
    permit_expiry: '2026-08-21',
    last_ping: '2026-04-23T10:32:00+01:00',
    contract_tier: 'Growth',
    risk_level: 'low',
  },
]

export const trucksTelemetryById: Record<string, TruckTelemetry> = {
  'TRX-CM-001': {
    speed_kmh: 100,
    lpg_level_percent: 72,
    eta_text: '1h 08m',
    distance_km: 72.9,
    route_progress: 74,
    pressureBar: 11.7,
    temperature_celsius: 29,
  },
  'TTC-CM-002': {
    speed_kmh: 82,
    lpg_level_percent: 66,
    eta_text: '54m',
    distance_km: 49.4,
    route_progress: 79,
    pressureBar: 10.8,
    temperature_celsius: 31,
  },
  'CEX-CM-003': {
    speed_kmh: 0,
    lpg_level_percent: 34,
    eta_text: '--',
    distance_km: 0,
    route_progress: 0,
    pressureBar: 6.4,
    temperature_celsius: 26,
  },
  'MKT-CM-004': {
    speed_kmh: 0,
    lpg_level_percent: 19,
    eta_text: '--',
    distance_km: 0,
    route_progress: 0,
    pressureBar: 5.1,
    temperature_celsius: 25,
  },
  'TRX-CM-005': {
    speed_kmh: 94,
    lpg_level_percent: 78,
    eta_text: '1h 46m',
    distance_km: 131.2,
    route_progress: 53,
    pressureBar: 12.1,
    temperature_celsius: 30,
  },
  'TTC-CM-006': {
    speed_kmh: 67,
    lpg_level_percent: 62,
    eta_text: '2h 03m',
    distance_km: 170.9,
    route_progress: 35,
    pressureBar: 9.9,
    temperature_celsius: 28,
  },
}

export const truckTenantOptions = Array.from(
  new Set(trucks.map((truck) => truck.tenant_name))
).map((tenant_name) => ({ label: tenant_name, value: tenant_name }))

export const truckMarketerOptions = Array.from(
  new Set(trucks.map((truck) => truck.marketer))
).map((marketer) => ({ label: marketer, value: marketer }))

export function getTruckTelemetry(truckId: string) {
  return (
    trucksTelemetryById[truckId] ?? {
      speed_kmh: 0,
      lpg_level_percent: 0,
      eta_text: '--',
      distance_km: 0,
      route_progress: 0,
      pressureBar: 0,
      temperature_celsius: 0,
    }
  )
}
