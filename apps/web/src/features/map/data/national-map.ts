import { getZones, type ZoneView } from '../../zones/data/zones'
import { getGeoAnomalies, type GeoAnomalyView } from './geo-anomalies'
import { clientSites, type ClientSiteView } from './client-sites'
import { sites, type Site } from '../../sites/data/sites'
import { regionsForMap, type RegionSummary } from '../lib/regions'
import { aggregateVracVolume, type VracSummary } from '../lib/vrac-volume'
import { getTrucks, type Truck } from '@/features/trucks/data/trucks'
import {
  getRouteTripsView,
  type RouteTripView,
} from '@/features/tours/data/tour-activity'
import type { UserScope } from '@/features/scope/scope'
import { scopeFilter } from '@/features/scope/scope'

export interface NationalMapView {
  sites: readonly Site[]
  clientSites: readonly ClientSiteView[]
  zones: readonly ZoneView[]
  regions: readonly RegionSummary[]
  anomalies: readonly GeoAnomalyView[]
  vrac: VracSummary
  trucks: readonly Truck[]
  routes: readonly RouteTripView[]
}

/**
 * Aggregates every map layer. The optional scope restricts sites, client
 * sites and anomalies to the authenticated user's scope (AGENTS.md §4);
 * trucks and tour routes are already scope-aware via their own builders.
 */
export function getNationalMapView(scope?: UserScope): NationalMapView {
  const resolvedScope: UserScope = scope ?? { view: 'org', siteIds: [] }
  return {
    sites: scopeFilter([...sites], resolvedScope, (s) => s.id),
    clientSites: scopeFilter([...clientSites], resolvedScope, (c) => c.id),
    zones: getZones(),
    regions: regionsForMap(),
    anomalies: scopeFilter(
      [...getGeoAnomalies()],
      resolvedScope,
      (a) => a.entity_id ?? a.id,
    ),
    vrac: aggregateVracVolume(),
    trucks: getTrucks(scope),
    routes: getRouteTripsView('ALL', scope),
  }
}