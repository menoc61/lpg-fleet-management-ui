import { sites, type Site } from '@/features/sites/data/sites'
import { trucks, type Truck } from '@/features/trucks/trucks'
import {
  anomalies,
  checkpoints,
  delivery_tours,
  drivers,
  scan_events,
  vehicles,
} from '@lpg/mock-data'
import type {
  Anomaly,
  Checkpoint,
  DeliveryTour,
  TourneeStatus,
} from '@lpg/types'

export type RouteTripStatus =
  | 'planned'
  | 'in-progress'
  | 'completed'
  | 'incident'

export type RouteStopRole = 'loading' | 'checkpoint' | 'delivery'

export type RouteEventSeverity = 'low' | 'medium' | 'high'

export type RouteTrip = {
  id: string
  reference: string
  truckId: string
  customerName: string
  missionLead: string
  originSiteId: string
  destinationSiteId: string
  startedAt: string
  expectedArrivalAt: string
  lastUpdatedAt: string
  loadedQuantityKg: number
  deliveredQuantityKg: number
  remainingQuantityKg: number
  progressPercent: number
  routeDistanceKm: number
  onTime: boolean
  status: RouteTripStatus
}

export type RouteTripStop = {
  id: string
  siteId: string
  role: RouteStopRole
  title: string
  completed: boolean
  windowLabel: string
  deliveredQuantityKg?: number
  note: string
}

export type RouteTelemetryPoint = {
  id: string
  routeTripId: string
  recordedAt: string
  latitude: number
  longitude: number
  lpgLevelPercent: number
  pressureBar: number
  estimatedVolumeKg: number
}

export type RouteEvent = {
  id: string
  routeTripId: string
  occurredAt: string
  severity: RouteEventSeverity
  title: string
  description: string
}

export type RouteTripViewStop = RouteTripStop & {
  site: Site
}

export type RouteTripView = RouteTrip & {
  truck: Truck
  originSite: Site
  destinationSite: Site
  stops: RouteTripViewStop[]
  telemetry: RouteTelemetryPoint[]
  events: RouteEvent[]
  latestTelemetry: RouteTelemetryPoint
  nextStop: RouteTripViewStop
  deliveredPercent: number
  remainingPercent: number
  lpgDropPercent: number
  pressureDeltaBar: number
  unaccountedKg: number
  attentionLevel: RouteEventSeverity
}

export type RouteSummary = {
  totalTrips: number
  activeTrips: number
  plannedTrips: number
  completedTrips: number
  incidentTrips: number
  activeVolumeKg: number
  deliveredVolumeKg: number
  onTimeRate: number
  attentionCount: number
}

export const routeStatusLabels: Record<RouteTripStatus, string> = {
  planned: 'Planifiee',
  'in-progress': 'En cours',
  completed: 'Terminee',
  incident: 'Incident',
}

export const routeStatusClasses: Record<RouteTripStatus, string> = {
  planned: 'bg-slate-500/10 text-slate-700',
  'in-progress': 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  incident: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
}

export const routeSeverityLabels: Record<RouteEventSeverity, string> = {
  low: 'Normal',
  medium: 'Attention',
  high: 'Critique',
}

export const routeSeverityClasses: Record<RouteEventSeverity, string> = {
  low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  high: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
}

export const routeStatusOptions = [
  { label: 'En cours', value: 'in-progress' },
  { label: 'Incident', value: 'incident' },
  { label: 'Planifiee', value: 'planned' },
  { label: 'Terminee', value: 'completed' },
] as const satisfies ReadonlyArray<{
  label: string
  value: RouteTripStatus
}>

export const routeAttentionOptions = [
  { label: 'Normal', value: 'low' },
  { label: 'Attention', value: 'medium' },
  { label: 'Critique', value: 'high' },
] as const satisfies ReadonlyArray<{
  label: string
  value: RouteEventSeverity
}>

const siteById = new Map(sites.map((site) => [site.id, site]))
const truckById = new Map(trucks.map((truck) => [truck.id, truck]))
const driverById = new Map(drivers.map((driver) => [driver.id, driver]))

function requireSite(siteId: string) {
  const site = siteById.get(siteId)

  if (!site) {
    throw new Error(`Unknown site "${siteId}"`)
  }

  return site
}

function requireTruck(truckId: string) {
  const truck = truckById.get(truckId)

  if (!truck) {
    throw new Error(`Unknown truck "${truckId}"`)
  }

  return truck
}

function routeStatusFromTournee(status: TourneeStatus): RouteTripStatus {
  switch (status) {
    case 'CLOSED':
      return 'completed'
    case 'INPROGRESS':
    case 'CHECKPOINTACTIVE':
      return 'in-progress'
    case 'CANCELLED':
      return 'incident'
    default:
      return 'planned'
  }
}

function driverName(driverId: string | null | undefined): string {
  if (!driverId) return '—'
  const driver = driverById.get(driverId)
  if (!driver) return '—'
  return `${driver.first_name} ${driver.last_name}`.trim()
}

function tourReference(index: number): string {
  return `TRP-${2401 + index}`
}

function windowLabel(dateIso: string | null | undefined): string {
  if (!dateIso) return 'Fenêtre non définie'
  const date = new Date(dateIso)
  const from = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const to = new Date(date.getTime() + 20 * 60 * 1000)
  const toLabel = to.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${from} - ${toLabel}`
}

function stopNote(checkpoint: Checkpoint): string {
  switch (checkpoint.status) {
    case 'COMPLETED':
      return 'Point validé et documents confirmés.'
    case 'REACHED':
      return 'Livreur arrivé sur site, en cours de chargement ou de déchargement.'
    case 'SKIPPED':
      return 'Point sauté — motif saisi par le livreur.'
    default:
      return 'Point planifié, en attente de passage.'
  }
}

function stopTitle(role: RouteStopRole, checkpoint: Checkpoint): string {
  const base = role === 'loading' ? 'Chargement' : role === 'delivery' ? 'Livraison finale' : 'Contrôle intermédiaire'
  const label = checkpoint.status === 'COMPLETED' ? 'confirmé' : checkpoint.status === 'REACHED' ? 'arrivé' : 'planifié'
  return `${base} ${label}`
}

function buildStops(
  tourId: string,
  tourCheckpoints: Checkpoint[],
  tour: DeliveryTour,
): RouteTripStop[] {
  return tourCheckpoints.map((checkpoint, index) => {
    const isFirst = index === 0
    const isLast = index === tourCheckpoints.length - 1
    const role: RouteStopRole = isFirst
      ? 'loading'
      : isLast
        ? 'delivery'
        : 'checkpoint'
    const completed = checkpoint.status !== 'PENDING'

    return {
      id: checkpoint.id,
      siteId: stopFromId(checkpoint),
      role,
      title: stopTitle(role, checkpoint),
      completed,
      windowLabel: windowLabel(checkpoint.expected_arrival),
      deliveredQuantityKg: isLast ? (tour.delivered_quantity ?? 0) : undefined,
      note: stopNote(checkpoint),
    }
  })
}

function stopFromId(checkpoint: Checkpoint): string {
  return checkpoint.site_id ?? checkpoint.client_site_id ?? ''
}

function buildTelemetry(
  tourId: string,
  tour: DeliveryTour,
  tourCheckpoints: Checkpoint[],
  origin: Site,
  destination: Site,
): RouteTelemetryPoint[] {
  const scans = scan_events.filter((scan) =>
    tourCheckpoints.some(
      (checkpoint) => checkpoint.id === scan.checkpoint_id,
    ),
  )

  if (scans.length > 0) {
    return scans.map((scan, index) => {
      const [lng, lat] = scan.geo_point ?? [0, 0]
      const total = scans.length
      const loaded = tour.loaded_quantity ?? tour.requested_quantity ?? 0
      const delivered = tour.delivered_quantity ?? 0
      const level = Math.max(
        Math.round(100 - (delivered / (loaded || 1)) * (index / (total - 1)) * 100),
        0,
      )

      return {
        id: `tel-${scan.id}`,
        routeTripId: tourId,
        recordedAt: scan.timestamp,
        latitude: Number(lat ?? 0),
        longitude: Number(lng ?? 0),
        lpgLevelPercent: level,
        pressureBar: round1(12.4 - (100 - level) * 0.03),
        estimatedVolumeKg: Math.round((loaded * level) / 100),
      }
    })
  }

  const loaded = tour.loaded_quantity ?? tour.requested_quantity ?? 0
  const points = 3
  const legLat = (destination.latitude - origin.latitude) / (points - 1)
  const legLng = (destination.longitude - origin.longitude) / (points - 1)

  return Array.from({ length: points }, (_, index) => {
    const level =
      tour.status === 'CLOSED'
        ? index === points - 1
          ? 1
          : 100 - index * 33
        : 100
    return {
      id: `tel-${tourId}-${index}`,
      routeTripId: tourId,
      recordedAt:
        tour.started_at ??
        new Date(
          new Date(tour.created_at ?? Date.now()).getTime() + index * 3600_000,
        ).toISOString(),
      latitude: origin.latitude + legLat * index,
      longitude: origin.longitude + legLng * index,
      lpgLevelPercent: level,
      pressureBar: round1(12.4 - (100 - level) * 0.03),
      estimatedVolumeKg: Math.round((loaded * level) / 100),
    }
  })
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function fallbackTruckId(marketeurOrgId: string | null | undefined, tourType: string): string {
  const candidates = vehicles.filter(
    (v) => v.org_id === marketeurOrgId && v.type === tourType && v.is_active,
  )
  if (candidates.length > 0) return candidates[0].id
  const any = vehicles.find((v) => v.type === tourType && v.is_active)
  return any?.id ?? trucks[0]?.id ?? ''
}

function buildEvents(
  tourId: string,
  tour: DeliveryTour,
  tourCheckpoints: Checkpoint[],
  status: RouteTripStatus,
): RouteEvent[] {
  const seeded = anomalies.filter(
    (anomaly) =>
      anomaly.entity_type === 'TOURNEE' && anomaly.entity_id === tourId,
  )

  const mapped = seeded.map((anomaly) =>
    anomalyToEvent(tourId, anomaly),
  )

  if (mapped.length > 0) return mapped

  if (status === 'completed') {
    return [
      {
        id: `${tourId}-event-final`,
        routeTripId: tourId,
        occurredAt: tour.closed_at ?? tour.updated_at ?? '',
        severity: 'low',
        title: 'Livraison signée',
        description:
          'Le bon de livraison est signé et le retour dépôt peut être engagé.',
      },
    ]
  }

  if (status === 'in-progress') {
    return tourCheckpoints.map((checkpoint, index) => ({
      id: `${tourId}-event-${index}`,
      routeTripId: tourId,
      occurredAt: checkpoint.actual_arrival ?? checkpoint.expected_arrival ?? '',
      severity: (index === 0 ? 'low' : 'medium') as RouteEventSeverity,
      title:
        index === 0
          ? 'Chargement confirmé'
          : `Point de contrôle ${index + 1} atteint`,
      description:
        index === 0
          ? 'Le chargement initial est validé et le convoyeur est sur la route.'
          : 'En provenance du point précédent, progression nominale.',
    }))
  }

  return [
    {
      id: `${tourId}-event-order`,
      routeTripId: tourId,
      occurredAt: tour.updated_at ?? tour.created_at ?? '',
      severity: 'low',
      title: 'Ordre de mission confirmé',
      description:
        'La tournee est planifiée et prête à être affectée à un véhicule.',
    },
  ]
}

function mapToEventSeverity(anomaly: Anomaly): RouteEventSeverity {
  switch (anomaly.severity) {
    case 'FAIBLE':
      return 'low'
    case 'MODERE':
      return 'medium'
    case 'ELEVE':
    case 'CRITIQUE':
    case 'CRITIQUEEXTREME':
      return 'high'
    default:
      return 'low'
  }
}

function anomalyToEvent(tourId: string, anomaly: Anomaly): RouteEvent {
  const labels: Record<string, string> = {
    DEVIATIONROUTE: 'Déviation de route',
    CHECKPOINTMISSED: 'Point de contrôle manqué',
    SCANOUTOFSEQUENCE: 'Scan hors séquence',
    TOURNEEUNASSIGNEDTOOLONG: 'Tournée non affectée',
    TRANSPORTERNOACK: 'Transporteur sans confirmation',
  }
  return {
    id: anomaly.id,
    routeTripId: tourId,
    occurredAt: anomaly.created_at ?? '',
    severity: mapToEventSeverity(anomaly),
    title: labels[anomaly.type] ?? anomaly.type,
    description:
      anomaly.resolution_notes ??
      `Anomalie ${anomaly.category ?? anomaly.type} signalée pour cette tournée.`,
  }
}

function haversineKm(
  origin: Pick<Site, 'latitude' | 'longitude'>,
  destination: Pick<Site, 'latitude' | 'longitude'>,
): number {
  const earthRadiusKm = 6371
  const toRad = (degree: number) => (degree * Math.PI) / 180
  const dLat = toRad(destination.latitude - origin.latitude)
  const dLng = toRad(destination.longitude - origin.longitude)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(origin.latitude)) *
      Math.cos(toRad(destination.latitude)) *
      Math.sin(dLng / 2) ** 2
  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function getHighestSeverity(events: readonly RouteEvent[]): RouteEventSeverity {
  if (events.some((event) => event.severity === 'high')) return 'high'
  if (events.some((event) => event.severity === 'medium')) return 'medium'
  return 'low'
}

function buildView(tour: DeliveryTour, index: number): RouteTripView {
  const tourCheckpoints = (checkpoints ?? []).filter(
    (checkpoint) => checkpoint.tournee_id === tour.id,
  )
  const stops = buildStops(tour.id, tourCheckpoints, tour)
  const originSiteId = stops[0]?.siteId ?? ''
  const destinationSiteId = stops[stops.length - 1]?.siteId ?? ''
  const originSite = requireSite(originSiteId)
  const destinationSite = requireSite(destinationSiteId)
  const status = routeStatusFromTournee(tour.status)
  const loaded = tour.loaded_quantity ?? tour.requested_quantity ?? 0
  const delivered = tour.delivered_quantity ?? (status === 'completed' ? loaded : 0)
  const remaining = Math.max(loaded - delivered, 0)
  const truckId = tour.vehicle_id ?? fallbackTruckId(tour.marketeur_org_id, tour.type)
  const truck = requireTruck(truckId)
  const expectedArrivalAt =
    stops[stops.length - 1]?.windowLabel ??
    tour.closed_at ??
    tour.updated_at ??
    ''

  const telemetry = buildTelemetry(tour.id, tour, tourCheckpoints, originSite, destinationSite)
  const latestTelemetry = telemetry[telemetry.length - 1] ?? {
    id: `${tour.id}-fallback`,
    routeTripId: tour.id,
    recordedAt: tour.updated_at ?? '',
    latitude: truck.lat,
    longitude: truck.lng,
    lpgLevelPercent: Math.round((remaining / (loaded || 1)) * 100),
    pressureBar: 0,
    estimatedVolumeKg: remaining,
  }
  const firstTelemetry = telemetry[0] ?? latestTelemetry
  const events = buildEvents(tour.id, tour, tourCheckpoints, status)
  const nextStop = stops.find((stop) => !stop.completed) ?? stops[stops.length - 1]!
  const deliveredPercent = Math.round((delivered / (loaded || 1)) * 100)
  const remainingPercent = Math.round((remaining / (loaded || 1)) * 100)
  const unaccountedKg = Math.max(loaded - delivered - remaining, 0)

  const stopViews = stops.map((stop) => ({ ...stop, site: requireSite(stop.siteId) }))

  return {
    id: tour.id,
    reference: tourReference(index),
    truckId,
    customerName: destinationSite.name,
    missionLead: driverName(tour.driver_id),
    originSiteId,
    destinationSiteId,
    startedAt: tour.started_at ?? tour.created_at ?? '',
    expectedArrivalAt,
    lastUpdatedAt: tour.updated_at ?? '',
    loadedQuantityKg: loaded,
    deliveredQuantityKg: delivered,
    remainingQuantityKg: remaining,
    progressPercent:
      status === 'completed'
        ? 100
        : status === 'planned'
          ? 0
          : deliveredPercent,
    routeDistanceKm: haversineKm(originSite, destinationSite),
    onTime: isOnTime(tourCheckpoints),
    status,
    truck,
    originSite,
    destinationSite,
    stops: stopViews,
    telemetry,
    events,
    latestTelemetry,
    nextStop,
    deliveredPercent,
    remainingPercent,
    lpgDropPercent: Math.max(
      firstTelemetry.lpgLevelPercent - latestTelemetry.lpgLevelPercent,
      0,
    ),
    pressureDeltaBar: Number(
      Math.max(firstTelemetry.pressureBar - latestTelemetry.pressureBar, 0).toFixed(1),
    ),
    unaccountedKg,
    attentionLevel: getHighestSeverity(events),
  }
}

function isOnTime(checkpoints: Checkpoint[]): boolean {
  const reached = checkpoints.filter(
    (checkpoint) => checkpoint.actual_arrival != null,
  )
  if (reached.length === 0) return true
  return reached.every(
    (checkpoint) =>
      new Date(checkpoint.actual_arrival!) <= new Date(checkpoint.expected_arrival!),
  )
}

export function getRouteTripsView(): RouteTripView[] {
  return delivery_tours.map((tour, index) => buildView(tour, index))
}

export function buildRouteSummary(
  trips: readonly RouteTripView[],
): RouteSummary {
  const completedAndActiveTrips = trips.filter(
    (trip) => trip.status !== 'planned',
  )
  const onTimeTrips = completedAndActiveTrips.filter((trip) => trip.onTime)

  return {
    totalTrips: trips.length,
    activeTrips: trips.filter((trip) =>
      ['in-progress', 'incident'].includes(trip.status),
    ).length,
    plannedTrips: trips.filter((trip) => trip.status === 'planned').length,
    completedTrips: trips.filter((trip) => trip.status === 'completed').length,
    incidentTrips: trips.filter((trip) => trip.status === 'incident').length,
    activeVolumeKg: trips
      .filter((trip) => ['in-progress', 'incident'].includes(trip.status))
      .reduce((total, trip) => total + trip.loadedQuantityKg, 0),
    deliveredVolumeKg: trips.reduce(
      (total, trip) => total + trip.deliveredQuantityKg,
      0,
    ),
    onTimeRate:
      completedAndActiveTrips.length === 0
        ? 0
        : Math.round(
            (onTimeTrips.length / completedAndActiveTrips.length) * 100,
          ),
    attentionCount: trips.filter((trip) => trip.attentionLevel !== 'low')
      .length,
  }
}

export function getRouteCustomerOptions(trips: readonly RouteTripView[]) {
  return Array.from(new Set(trips.map((trip) => trip.customerName))).map(
    (customerName) => ({
      label: customerName,
      value: customerName,
    })
  )
}