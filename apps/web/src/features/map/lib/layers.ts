export type MapLayerKey =
  | 'sites'
  | 'clientSites'
  | 'zones'
  | 'regions'
  | 'anomalies'
  | 'vrac'

export function getInitialLayers(): Record<MapLayerKey, boolean> {
  return {
    sites: true,
    clientSites: true,
    zones: false,
    regions: true,
    anomalies: false,
    vrac: true,
  }
}

export const LAYER_LABELS: Record<MapLayerKey, string> = {
  sites: 'Sites marchands',
  clientSites: 'Sites clients',
  zones: 'Zones géographiques',
  regions: 'Régions',
  anomalies: 'Anomalies',
  vrac: 'Volume VRAC (TM)',
}
