import type { ClientSiteView } from '../data/client-sites'
import type { GeoAnomalyView } from '../data/geo-anomalies'
import type { ZoneView } from '../../zones/data/zones'
import type { RegionSummary } from '../lib/regions'
import type { VracSummary } from '../lib/vrac-volume'
import type { MapTheme } from './map-theme'
import {
  popupLine,
  escapePopupValue,
  createSitePopupContent,
} from '../../sites/utils/site-graphics'
import { formatTm } from './format'

export type PopupContent = string

export function buildClientSitePopupContent(
  cs: ClientSiteView,
  _theme: MapTheme,
): PopupContent {
  return [
    popupLine('Région', escapePopupValue(cs.region)),
    popupLine('Client', escapePopupValue(cs.clientName)),
    popupLine(
      'Voir la fiche',
      `<a href="/clients/${escapePopupValue(cs.client_org_id)}">Ouvrir →</a>`,
    ),
  ].join('')
}

export function buildZonePopupContent(zone: ZoneView, _theme: MapTheme): PopupContent {
  return [
    popupLine('Région', escapePopupValue(zone.region)),
    popupLine('Sites', String(zone.siteCount)),
    popupLine('Sites clients', String(zone.clientSiteCount)),
  ].join('')
}

export function buildRegionPopupContent(
  region: RegionSummary,
  _theme: MapTheme,
): PopupContent {
  return [
    popupLine('Sites', String(region.siteCount)),
    popupLine('Sites clients', String(region.clientSiteCount)),
    popupLine('Anomalies', String(region.anomalyCount)),
  ].join('')
}

export function buildVracPopupContent(vrac: VracSummary, _theme: MapTheme): PopupContent {
  return [
    popupLine('Total', formatTm(vrac.totalTM)),
    popupLine('Camions actifs', String(vrac.activeTruckCount)),
  ].join('')
}

export function buildAnomalyPopupContent(
  anomaly: GeoAnomalyView,
  _theme: MapTheme,
): PopupContent {
  const lines: string[] = [
    popupLine('Catégorie', escapePopupValue(anomaly.category)),
    popupLine('Gravité', escapePopupValue(anomaly.severity)),
    popupLine('Statut', escapePopupValue(anomaly.status)),
  ]
  if (anomaly.entity_label) {
    lines.push(popupLine('Entité', escapePopupValue(anomaly.entity_label)))
  }
  return lines.join('')
}

export { createSitePopupContent as buildSitePopupContent }
