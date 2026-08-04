import { curated, delivery_tours, checkpoints, vehicles, regions } from '@lpg/mock-data'
import type { DeliveryTour, Checkpoint, Vehicle, Region } from '@lpg/types'

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

const REGION_CITY: Record<Region, string> = {
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

const TRIP_STATUS_FALLBACK: TripStatus = 'Planifié'

function tripStatusFor(status: DeliveryTour['status']): TripStatus {
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
      return TRIP_STATUS_FALLBACK
  }
}

function tripProgressFor(status: DeliveryTour['status']): number {
  switch (status) {
    case 'INPROGRESS':
      return 50
    case 'CHECKPOINTACTIVE':
      return 80
    case 'CLOSED':
      return 100
    case 'ACKNOWLEDGED':
      return 20
    default:
      return 0
  }
}

const regionCodes = regions.map((r) => r.code as Region)

function cityFor(idx: number): string {
  const code = regionCodes[idx % regionCodes.length] ?? 'CENTRE' as Region
  return REGION_CITY[code] ?? '—'
}

function buildTrip(tour: DeliveryTour, checkpoint: Checkpoint | undefined, vehicle: Vehicle | undefined, idx: number): Trip {
  const start = tour.started_at ? new Date(tour.started_at) : null
  const eta = start
    ? new Date(start.getTime() + 4 * 3600 * 1000).toISOString().slice(11, 16)
    : '—'
  return {
    id: tour.id,
    status: tripStatusFor(tour.status),
    progress: tripProgressFor(tour.status),
    origin: { city: REGION_CITY.CENTRE, name: 'Centre emplisseur', lat: null, lng: null },
    destination: {
      city: cityFor(idx),
      name: checkpoint?.site_id ? 'Client site' : 'Marketeur',
      lat: null,
      lng: null,
    },
    cargo: tour.type === 'VRAC' ? 'GPL vrac' : 'Bouteilles 50 kg',
    volume: `${tour.requested_quantity ?? 0} ${tour.type === 'VRAC' ? 't' : 'btl'}`,
    eta,
    etaMeta: 'ETA',
    driver_name: '—',
    license_plate: vehicle?.license_plate ?? '—',
    tour_id: tour.id,
  }
}

const SAMPLE_SIZE = 12
const FALLBACK_TRIP: Trip = {
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
}

export const trips: readonly Trip[] = (() => {
  if (delivery_tours.length === 0) return [FALLBACK_TRIP]
  return delivery_tours.slice(0, SAMPLE_SIZE).map((tour, idx) => {
    const tourCheckpoints = checkpoints.filter((cp) => cp.tournee_id === tour.id)
    const firstCheckpoint = tourCheckpoints[0]
    const vehicle = vehicles[idx % Math.max(vehicles.length, 1)]
    return buildTrip(tour, firstCheckpoint, vehicle, idx)
  })
})()

export { curated }