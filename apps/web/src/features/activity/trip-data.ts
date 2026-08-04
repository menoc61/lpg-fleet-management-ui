import { curated } from '@lpg/mock-data'
import type { DeliveryTour as CuratedDeliveryTour } from '@lpg/types'

export type TripStatus = 'Planifié' | 'En transit' | 'En livraison' | 'Livré' | 'Retardé'

export interface TripLocation {
  city: string
  name: string
  lat: number | null
  lng: number | null
}

export interface Trip {
  id: string
  status: TripStatus
  progress: number
  origin: TripLocation
  destination: TripLocation
  cargo: string
  volume: string
  eta: string
  etaMeta: string | null
  driver_name: string
  license_plate: string
  tour_id: string
}

const REGION_CITY: Record<string, string> = {
  ADAMAOUA: 'Ngaoundéré',
  CENTRE: 'Yaoundé',
  EST: 'Bertoua',
  EXTREMENORD: 'Maroua',
  LITTORAL: 'Douala',
  NORD: 'Garoua',
  NORDOUEST: 'Bamenda',
  OUEST: 'Bafoussam',
  SUD: 'Ebolowa',
  SUDOUEST: 'Buéa',
}

function statusFromTour(status: string): TripStatus {
  switch (status) {
    case 'INPROGRESS':
      return 'En transit'
    case 'CHECKPOINTACTIVE':
      return 'En livraison'
    case 'CLOSED':
      return 'Livré'
    case 'PENDINGTRANSPORTERACK':
    case 'ACKNOWLEDGED':
      return 'Planifié'
    default:
      return 'Planifié'
  }
}

function progressFor(status: string): number {
  switch (status) {
    case 'INPROGRESS': return 50
    case 'CHECKPOINTACTIVE': return 80
    case 'CLOSED': return 100
    case 'ACKNOWLEDGED': return 20
    default: return 0
  }
}

const CHECKPOINTS = curated.checkpoints as any[]
const VEHICLES = curated.vehicles as any[]

export const trips: Trip[] = (curated.delivery_tours as CuratedDeliveryTour[]).slice(0, 12).map((tour, idx) => {
  const cps = CHECKPOINTS.filter((cp) => cp.tournee_id === tour.id)
  const cp = cps[0]
  const region = (tour as any).region || 'CENTRE'
  const vehicle = VEHICLES[idx % VEHICLES.length]
  return {
    id: tour.id,
    status: statusFromTour(tour.status),
    progress: progressFor(tour.status),
    origin: { city: REGION_CITY['CENTRE'] ?? '—', name: 'Centre emplisseur', lat: null, lng: null },
    destination: {
      city: REGION_CITY[region] ?? REGION_CITY.CENTRE ?? '—',
      name: cp?.site_id ? 'Client site' : 'Marketeur',
      lat: null,
      lng: null,
    },
    cargo: tour.type === 'VRAC' ? 'GPL vrac' : 'Bouteilles 50 kg',
    volume: `${tour.requested_quantity ?? 0} ${tour.type === 'VRAC' ? 't' : 'btl'}`,
    eta: tour.started_at ? new Date(new Date(tour.started_at).getTime() + 4 * 3600 * 1000).toISOString().slice(11, 16) : '—',
    etaMeta: 'ETA',
    driver_name: '—',
    license_plate: vehicle?.license_plate ?? '—',
    tour_id: tour.id,
  }
})

if (trips.length === 0) {
  // Fallback so the screen can still mount with an empty list
  trips.push({
    id: 'tour-stub-1',
    status: 'Planifié',
    progress: 0,
    origin: { city: 'Yaoundé', name: 'Centre', lat: null, lng: null },
    destination: { city: 'Douala', name: 'Client', lat: null, lng: null },
    cargo: 'GPL vrac',
    volume: '18 t',
    eta: '—',
    etaMeta: null,
    driver_name: '—',
    license_plate: '—',
    tour_id: 'tour-stub-1',
  })
}