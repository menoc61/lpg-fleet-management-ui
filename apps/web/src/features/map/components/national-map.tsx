import { useEffect, useMemo, useRef, useState } from 'react'
import Graphic from '@arcgis/core/Graphic.js'
import ArcGISMap from '@arcgis/core/Map.js'
import '@arcgis/core/assets/esri/themes/light/main.css'
import '@arcgis/core/assets/esri/themes/dark/main.css'
import esriConfig from '@arcgis/core/config.js'
import Point from '@arcgis/core/geometry/Point.js'
import Polyline from '@arcgis/core/geometry/Polyline.js'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js'
import MapView from '@arcgis/core/views/MapView.js'
import type { ClickEvent } from '@arcgis/core/views/input/types.js'
import { AlertTriangle, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { NationalMapView } from '@/features/map/data/national-map'
import {
  getArcgisBasemap,
  getArcgisViewTheme,
  getMarkerOutlineColor,
  rgbaFromTuple,
} from '@/features/map/utils/map-theme'
import type { MapTheme } from '@/features/map/utils/map-theme'
import { LegendSiteIcon } from '@/features/map/utils/legend'
import { formatTm } from '@/features/map/utils/format'
import {
  getInitialLayers,
  LAYER_LABELS,
  type MapLayerKey,
} from '@/features/map/lib/layers'
import {
  buildClientSitePopupContent,
  buildRegionPopupContent,
  buildZonePopupContent,
  buildVracPopupContent,
  buildAnomalyPopupContent,
} from '@/features/map/utils/popup'
import { createSiteGraphics } from '@/features/sites/utils/site-graphics'
import type { SiteStatus, SiteType } from '@/features/sites/data/sites'
import { siteStatusLabels, siteTypeLabels } from '@/features/sites/data/sites'
import {
  getTruckTelemetry,
  statusLabels,
  type Truck,
  type TruckStatus,
} from '@/features/trucks/data/trucks'
import { quantityInfo } from '@/features/trucks/lib/quantity'
import type { RouteTripView } from '@/features/tours/data/tour-activity'
import type { UserScope } from '@/features/scope/scope'
import { getNationalMapView } from '@/features/map/data/national-map'
import lpgImageUrl from '@/assets/lpg.png'

const arcgisApiKey = String(import.meta.env.VITE_ARCGIS_API_KEY ?? '').trim()

if (arcgisApiKey) {
  esriConfig.apiKey = arcgisApiKey
}

const CAMEROON_CENTER: [number, number] = [8.7, 12.3]

const truckStatusColors: Record<TruckStatus, [number, number, number, number]> = {
  DRAFT: [100, 116, 139, 0.9],
  PLANNED: [14, 165, 233, 0.95],
  PENDINGTRANSPORTERACK: [245, 158, 11, 0.95],
  ACKNOWLEDGED: [16, 185, 129, 0.95],
  INPROGRESS: [14, 165, 233, 0.95],
  CHECKPOINTACTIVE: [168, 85, 247, 0.95],
  CLOSED: [100, 116, 139, 0.9],
  CANCELLED: [239, 68, 68, 0.95],
}

const activeRouteStatuses = ['planned', 'in-progress', 'incident'] as const

export type BasemapMode = 'vector' | 'satellite'

export type MapEntitySelection =
  | { kind: 'site'; id: string; title: string; type: SiteType; status: SiteStatus }
  | { kind: 'client-site'; id: string; title: string }
  | { kind: 'truck'; id: string; title: string; plate: string; status: TruckStatus }
  | { kind: 'anomaly'; id: string; title: string; severity: string }
  | { kind: 'region'; id: string; title: string }
  | { kind: 'zone'; id: string; title: string }
  | { kind: 'vrac'; id: string; title: string }

export type NationalMapProps = {
  mapTheme?: MapTheme
  className?: string
  focusZone?: string
  focusSite?: string
  layers?: Record<MapLayerKey, boolean>
  basemap?: BasemapMode
  scope?: UserScope
  /** Bumped to force a data refresh + full re-render of the graphics. */
  refreshToken?: number
  onEntitySelect?: (entity: MapEntitySelection) => void
  onViewReady?: (view: MapView) => void
}

export function NationalMap({
  mapTheme = 'light',
  className,
  focusZone,
  focusSite,
  layers = getInitialLayers(),
  basemap = 'vector',
  scope,
  refreshToken = 0,
  onEntitySelect,
  onViewReady,
}: NationalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<ArcGISMap | null>(null)
  const viewRef = useRef<MapView | null>(null)
  const layersRef = useRef<Record<string, GraphicsLayer>>({})
  const focusLayerRef = useRef<GraphicsLayer | null>(null)
  const initialMapThemeRef = useRef(mapTheme)
  const onEntitySelectRef = useRef(onEntitySelect)
  const onViewReadyRef = useRef(onViewReady)
  const [isReady, setIsReady] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const data = useMemo(() => getNationalMapView(scope), [scope, refreshToken])
  const dataRef = useRef(data)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    onEntitySelectRef.current = onEntitySelect
  }, [onEntitySelect])

  useEffect(() => {
    onViewReadyRef.current = onViewReady
  }, [onViewReady])

  useEffect(() => {
    if (!arcgisApiKey || !mapContainerRef.current) return

    const perLayer: Record<string, GraphicsLayer> = {}
    const initialToggles = getInitialLayers()
    for (const key of Object.keys(initialToggles) as MapLayerKey[]) {
      perLayer[key] = new GraphicsLayer({ title: LAYER_LABELS[key] })
    }
    layersRef.current = perLayer

    const map = new ArcGISMap({
      basemap: getArcgisBasemap(initialMapThemeRef.current),
      layers: Object.values(perLayer),
    })
    const focusLayer = new GraphicsLayer({ title: 'Zone sélectionnée' })
    map.add(focusLayer)
    focusLayerRef.current = focusLayer

    const view = new MapView({
      container: mapContainerRef.current,
      map,
      center: CAMEROON_CENTER,
      constraints: { minZoom: 4 },
      popup: { dockEnabled: false },
      theme: getArcgisViewTheme(initialMapThemeRef.current),
      zoom: 7,
    })

    const handle = view.on('click', async (event: ClickEvent) => {
      const response = await view.hitTest(event)
      const result = response.results?.[0] as
        | { graphic?: (typeof Graphic)['prototype'] }
        | undefined
      const graphic = result?.graphic as Graphic | undefined
      if (!graphic) return

      const entity = selectionFromGraphic(graphic, dataRef.current)
      if (entity) onEntitySelectRef.current?.(entity)

      if (graphic.popupTemplate?.content && graphic.geometry) {
        await view.openPopup({
          features: [graphic],
          location: graphic.geometry as Point,
        })
      }
    })

    view
      .when()
      .then(() => {
        setLoadFailed(false)
        setIsReady(true)
        onViewReadyRef.current?.(view)
      })
      .catch((err: unknown) => {
        if (err && (err as { name?: string }).name === 'AbortError') return
        setLoadFailed(true)
      })

    mapRef.current = map
    viewRef.current = view

    return () => {
      handle.remove()
      view.destroy()
      focusLayer.removeAll()
      map.remove(focusLayer)
      focusLayerRef.current = null
      mapRef.current = null
      viewRef.current = null
      setIsReady(false)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const view = viewRef.current
    if (!isReady || !map || !view) return
    map.basemap =
      basemap === 'satellite'
        ? 'satellite'
        : getArcgisBasemap(mapTheme)
  }, [isReady, mapTheme, basemap])

  useEffect(() => {
    const view = viewRef.current
    if (!isReady || !view) return
    view.theme = getArcgisViewTheme(mapTheme)
  }, [isReady, mapTheme])

  useEffect(() => {
    const layers = layersRef.current
    if (!isReady || !data) return

    const siteGraphics = data.sites.flatMap((s) => createSiteGraphics(s, mapTheme))
    const clientGraphics = data.clientSites.map((cs) => {
      const pt = new Point({
        longitude: cs.longitude,
        latitude: cs.latitude,
        spatialReference: { wkid: 4326 },
      })
      return new Graphic({
        geometry: pt,
        symbol: {
          type: 'picture-marker',
          url: lpgImageUrl,
          width: 22,
          height: 22,
        },
        attributes: { kind: 'client-site', clientSiteId: cs.id },
        popupTemplate: {
          title: cs.name,
          content: buildClientSitePopupContent(cs, mapTheme),
        },
      })
    })
    const regionGraphics = data.regions.map((r) =>
      new Graphic({
        geometry: new Point({
          longitude: r.longitude,
          latitude: r.latitude,
          spatialReference: { wkid: 4326 },
        }),
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          color: rgbaFromTuple([60, 90, 200, 0.55]),
          size: 24,
          outline: {
            color: getMarkerOutlineColor(mapTheme, false),
            width: 1.5,
          },
        },
        attributes: { kind: 'region', regionCode: r.code },
        popupTemplate: {
          title: r.name,
          content: buildRegionPopupContent(r, mapTheme),
        },
      }),
    )
    const anomalyGraphics = data.anomalies.map((a) =>
      new Graphic({
        geometry: new Point({
          longitude: a.longitude,
          latitude: a.latitude,
          spatialReference: { wkid: 4326 },
        }),
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          color: [239, 68, 68],
          size: 18,
          outline: {
            color: [239, 68, 68, 0.9],
            width: 2,
          },
        },
        attributes: { kind: 'anomaly', anomalyId: a.id },
        popupTemplate: {
          title: a.type,
          content: buildAnomalyPopupContent(a, mapTheme),
        },
      }),
    )
    const zoneGraphics = data.zones.flatMap((zone) => {
      const region = data.regions.find((candidate) => candidate.code === zone.code)
      if (!region) return []
      return [
        new Graphic({
          geometry: new Point({
            longitude: region.longitude,
            latitude: region.latitude,
            spatialReference: { wkid: 4326 },
          }),
          symbol: {
            type: 'simple-marker',
            style: 'circle',
            color: rgbaFromTuple([99, 102, 241, 0.35]),
            size: 14,
            outline: {
              color: rgbaFromTuple([99, 102, 241, 0.9]),
              width: 1.5,
            },
          },
          attributes: { kind: 'zone', zoneCode: zone.code },
          popupTemplate: {
            title: zone.name,
            content: buildZonePopupContent(zone, mapTheme),
          },
        }),
      ]
    })
    const vracCentroid = (() => {
      const points = data.sites.filter((s) => s.longitude && s.latitude)
      if (points.length === 0) return CAMEROON_CENTER
      return [
        points.reduce((sum, s) => sum + s.longitude, 0) / points.length,
        points.reduce((sum, s) => sum + s.latitude, 0) / points.length,
      ] as [number, number]
    })()
    const vracGraphics = [
      new Graphic({
        geometry: new Point({
          longitude: vracCentroid[0],
          latitude: vracCentroid[1],
          spatialReference: { wkid: 4326 },
        }),
        symbol: {
          type: 'simple-marker',
          style: 'diamond',
          color: rgbaFromTuple([245, 158, 11, 0.75]),
          size: 22,
          outline: {
            color: rgbaFromTuple([245, 158, 11, 1]),
            width: 2,
          },
        },
        attributes: { kind: 'vrac' },
        popupTemplate: {
          title: LAYER_LABELS.vrac,
          content: buildVracPopupContent(data.vrac, mapTheme),
        },
      }),
    ]

    const truckGraphics = data.trucks.map((truck) =>
      createTruckGraphic(truck, mapTheme)
    )
    const routeGraphics = data.routes
      .filter((trip) =>
        activeRouteStatuses.includes(
          trip.status as (typeof activeRouteStatuses)[number]
        )
      )
      .flatMap((trip) => createRouteGraphics(trip, mapTheme))

    layers.sites?.removeAll()
    layers.clientSites?.removeAll()
    layers.regions?.removeAll()
    layers.zones?.removeAll()
    layers.anomalies?.removeAll()
    layers.vrac?.removeAll()
    layers.trucks?.removeAll()

    layers.sites?.addMany(siteGraphics)
    layers.clientSites?.addMany(clientGraphics)
    layers.regions?.addMany(regionGraphics)
    layers.zones?.addMany(zoneGraphics)
    layers.anomalies?.addMany(anomalyGraphics)
    layers.vrac?.addMany(vracGraphics)
    layers.trucks?.addMany([...routeGraphics, ...truckGraphics])
  }, [isReady, mapTheme, data])

  useEffect(() => {
    const perLayer = layersRef.current
    if (!isReady) return
    for (const key of Object.keys(layers) as MapLayerKey[]) {
      const layer = perLayer[key]
      if (layer) layer.visible = layers[key]
    }
  }, [isReady, layers])

  useEffect(() => {
    const view = viewRef.current
    const focusLayer = focusLayerRef.current
    if (!isReady || !data || !view || !focusLayer) return

    let active = true
    focusLayer.removeAll()

    const region = data.regions.find((candidate) => candidate.code === focusZone)
    const site = focusSite
      ? data.sites.find((candidate) => candidate.id === focusSite)
      : undefined
    const clientSite = focusSite && !site
      ? data.clientSites.find((candidate) => candidate.id === focusSite)
      : undefined
    const focused = site ?? clientSite

    const focusPoint =
      focused && focused.latitude && focused.longitude
        ? { lng: focused.longitude, lat: focused.latitude }
        : region
          ? { lng: region.longitude, lat: region.latitude }
          : null

    if (!focusPoint) {
      return () => {
        active = false
        focusLayer.removeAll()
      }
    }

    const focusGraphic = new Graphic({
      geometry: new Point({
        longitude: focusPoint.lng,
        latitude: focusPoint.lat,
        spatialReference: { wkid: 4326 },
      }),
      symbol: {
        type: 'simple-marker',
        style: 'circle',
        color: [245, 158, 11, 0.3],
        size: 42,
        outline: {
          color: [245, 158, 11, 1],
          width: 3,
        },
      },
      attributes: {
        kind: site ? 'focused-site' : clientSite ? 'focused-client-site' : 'focused-region',
        ...(focused ? { siteId: focused.id } : { regionCode: region?.code }),
      },
      popupTemplate: site
        ? {
            title: site.name,
            content: buildSitePopupContent(site, mapTheme),
          }
        : clientSite
          ? {
              title: clientSite.name,
              content: buildClientSitePopupContent(clientSite, mapTheme),
            }
          : region
            ? {
                title: region.name,
                content: buildRegionPopupContent(region, mapTheme),
              }
            : undefined,
    })
    if (!active) return
    focusLayer.add(focusGraphic)

    const navigation = view.goTo({
      center: [focusPoint.lng, focusPoint.lat],
      zoom: focused ? 12 : 8,
    }) as Promise<void> & { cancel?: () => void }
    void navigation.catch(() => undefined)

    return () => {
      active = false
      navigation.cancel?.()
      focusLayer.remove(focusGraphic)
    }
  }, [data, focusSite, focusZone, isReady, mapTheme])

  if (!arcgisApiKey) {
    return (
      <div
        className={cn(
          'flex min-h-[560px] items-center justify-center bg-muted/30 p-6 text-center md:min-h-[620px]',
          className,
        )}
      >
        <div className="max-w-sm space-y-2">
          <AlertTriangle className="mx-auto size-8 text-amber-500" />
          <p className="text-sm font-medium">ArcGIS</p>
          <p className="text-sm text-muted-foreground">
            Renseigne VITE_ARCGIS_API_KEY dans le fichier .env pour charger la
            carte.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'national-arcgis-map relative min-h-[560px] overflow-hidden bg-muted md:min-h-[620px]',
        mapTheme === 'dark' ? 'calcite-mode-dark' : 'calcite-mode-light',
        className,
      )}
      data-map-theme={mapTheme}
      role='img'
      aria-label='Carte nationale du réseau GPL'
    >
      <div
        ref={mapContainerRef}
        className="absolute inset-0 h-full min-h-[560px] w-full md:min-h-[620px]"
      />

      <div className="pointer-events-none absolute top-4 right-16 flex flex-wrap items-center justify-end gap-2">
        <Badge className="gap-1 border-transparent bg-background/90 text-foreground shadow-sm backdrop-blur">
          <Wifi className="size-3 text-emerald-500" />
          ArcGIS
        </Badge>
        {data?.sites.length ? (
          <Badge
            variant="outline"
            className="border-transparent bg-background/90 shadow-sm backdrop-blur"
          >
            {data.sites.length} sites
          </Badge>
        ) : null}
        {data?.clientSites.length ? (
          <Badge
            variant="outline"
            className="border-transparent bg-background/90 shadow-sm backdrop-blur"
          >
            {data.clientSites.length} clients
          </Badge>
        ) : null}
        {data?.trucks.length ? (
          <Badge
            variant="outline"
            className="border-transparent bg-background/90 shadow-sm backdrop-blur"
          >
            {data.trucks.length} véhicules
          </Badge>
        ) : null}
        {data?.anomalies.length ? (
          <Badge
            variant="outline"
            className="border-transparent bg-background/90 shadow-sm backdrop-blur"
          >
            {data.anomalies.length} anomalies
          </Badge>
        ) : null}
        {data ? (
          <Badge
            variant="outline"
            className="border-transparent bg-background/90 shadow-sm backdrop-blur"
          >
            {formatTm(data.vrac.totalTM)}
          </Badge>
        ) : null}
      </div>

      {!isReady && !loadFailed ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/40 text-sm text-muted-foreground backdrop-blur-[1px]">
          Chargement de la carte ArcGIS...
        </div>
      ) : null}

      {data && data.sites.length > 0 ? (
        <div className="pointer-events-none absolute right-4 bottom-20 max-w-[240px] rounded-2xl bg-background/70 p-3 text-xs shadow-sm backdrop-blur-md">
          <p className="font-medium text-foreground/90">Réseau logistique</p>
          <div className="mt-2 space-y-2">
            {Object.entries(
              data.sites.reduce(
                (acc, s) => {
                  acc[s.type] = (acc[s.type] ?? 0) + 1
                  return acc
                },
                {} as Record<string, number>,
              ),
            )
              .filter(([, count]) => count > 0)
              .map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span className="shrink-0">
                      <LegendSiteIcon type={type as SiteType} mapTheme={mapTheme} />
                    </span>
                    {type}
                  </span>
                  <span className="font-medium text-foreground">{count}</span>
                </div>
              ))}
          </div>
        </div>
      ) : null}

      {loadFailed ? (
        <div className="absolute inset-x-4 top-16 rounded-lg bg-background/95 px-3 py-2 text-sm text-amber-700 shadow-sm backdrop-blur dark:text-amber-300">
          La carte ArcGIS n'a pas pu charger. Vérifie la clé API et les
          restrictions de domaine.
        </div>
      ) : null}
    </div>
  )
}

function createTruckGraphic(truck: Truck, mapTheme: MapTheme) {
  const telemetry = getTruckTelemetry(truck.id)
  const color = truckStatusColors[truck.tournee_status]
  const outlineColor = getMarkerOutlineColor(mapTheme, false)

  return new Graphic({
    geometry: new Point({
      longitude: truck.lng,
      latitude: truck.lat,
      spatialReference: { wkid: 4326 },
    }),
    symbol: {
      type: 'simple-marker',
      style: 'circle',
      color,
      size: 11,
      outline: {
        color: outlineColor,
        width: 1.5,
      },
    },
    attributes: {
      kind: 'truck',
      truckId: truck.id,
      status: truck.tournee_status,
    },
    popupTemplate: {
      title: `${truck.license_plate} - ${truck.tenant_name}`,
      content: buildTruckPopupContent(truck, telemetry, mapTheme),
    },
  })
}

function createRouteGraphics(trip: RouteTripView, _mapTheme: MapTheme) {
  const origin = trip.originSite
  const destination = trip.destinationSite
  if (
    !origin.latitude ||
    !origin.longitude ||
    !destination.latitude ||
    !destination.longitude
  ) {
    return []
  }

  const path: [number, number][] = [
    [origin.longitude, origin.latitude],
    [destination.longitude, destination.latitude],
  ]

  return [
    new Graphic({
      geometry: new Polyline({
        paths: [path],
        spatialReference: { wkid: 4326 },
      }),
      symbol: {
        type: 'simple-line',
        color:
          trip.status === 'incident' ? [239, 68, 68, 0.9] : [14, 165, 233, 0.85],
        width: 3,
        style: trip.status === 'incident' ? 'short-dash' : 'solid',
      },
      attributes: { kind: 'route', tourId: trip.id, status: trip.status },
      popupTemplate: {
        title: trip.reference,
        content: buildRoutePopupContent(trip),
      },
    }),
  ]
}

function buildTruckPopupContent(
  truck: Truck,
  telemetry: ReturnType<typeof getTruckTelemetry>,
  mapTheme: MapTheme,
) {
  const info = quantityInfo(truck)
  const etaText = telemetry.expected_arrival
    ? new Date(telemetry.expected_arrival).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  return `
    <div class="fleet-truck-popup" data-popup-theme="${mapTheme}">
      ${popupLine('Type', truck.type)}
      ${popupLine('Plaque', truck.license_plate)}
      ${popupLine('Entreprise', truck.tenant_name)}
      ${popupLine('Chauffeur', truck.assigned_driver)}
      ${popupLine('Statut', statusLabels[truck.tournee_status])}
      ${popupLine('Position', truck.current_location)}
      ${popupLine('Niveau GPL', info.amount)}
      ${popupLine('Remplissage', `${info.percent}%`)}
      ${popupLine('ETA', etaText)}
    </div>
  `
}

function buildRoutePopupContent(trip: RouteTripView) {
  const origin = trip.originSite.name
  const destination = trip.destinationSite.name
  return `
    <div class="fleet-truck-popup" data-popup-theme="light">
      ${popupLine('Référence', trip.reference)}
      ${popupLine('Itinéraire', `${origin} -> ${destination}`)}
      ${popupLine('Chargé', `${trip.loadedQuantity} kg`)}
      ${popupLine('Livré', `${trip.deliveredQuantity} kg`)}
      ${popupLine('Restant', `${trip.remainingQuantity} kg`)}
    </div>
  `
}

function buildSitePopupContent(site: {
  name: string
  type: SiteType
  operator: string
  city: string
  region: string
  status: SiteStatus
}, mapTheme: MapTheme) {
  return `
    <div class="fleet-truck-popup" data-popup-theme="${mapTheme}">
      ${popupLine('Type', siteTypeLabels[site.type])}
      ${popupLine('Opérateur', site.operator)}
      ${popupLine('Ville', site.city)}
      ${popupLine('Région', site.region)}
      ${popupLine('Statut', siteStatusLabels[site.status])}
    </div>
  `
}

function popupLine(label: string, value: string | number | undefined) {
  return `
    <p class="fleet-truck-popup__row">
      <strong>${label}</strong>
      <span>${escapePopupValue(String(value ?? '—'))}</span>
    </p>
  `
}

function escapePopupValue(value: string | undefined) {
  return (value ?? '—').replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[character] ?? character
  })
}

function selectionFromGraphic(
  graphic: Graphic,
  data: NationalMapView,
): MapEntitySelection | null {
  const attributes = graphic.attributes ?? {}
  const kind = attributes.kind as string

  switch (kind) {
    case 'site': {
      const site = data.sites.find((s) => s.id === attributes.siteId)
      return {
        kind: 'site',
        id: attributes.siteId as string,
        title: site?.name ?? (graphic.popupTemplate?.title as string) ?? 'Site',
        type: (attributes.siteType as SiteType) ?? site?.type ?? 'depot',
        status: site?.status ?? 'active',
      }
    }
    case 'client-site': {
      const client = data.clientSites.find((c) => c.id === attributes.clientSiteId)
      return {
        kind: 'client-site',
        id: attributes.clientSiteId as string,
        title: client?.name ?? (graphic.popupTemplate?.title as string) ?? 'Site client',
      }
    }
    case 'truck': {
      const truck = data.trucks.find((t) => t.id === attributes.truckId)
      return {
        kind: 'truck',
        id: attributes.truckId as string,
        title:
          truck
            ? `${truck.license_plate} - ${truck.tenant_name}`
            : (graphic.popupTemplate?.title as string) ?? 'Véhicule',
        plate: truck?.license_plate ?? '',
        status: (attributes.status as TruckStatus) ?? truck?.tournee_status ?? 'PLANNED',
      }
    }
    case 'anomaly': {
      const anomaly = data.anomalies.find((a) => a.id === attributes.anomalyId)
      return {
        kind: 'anomaly',
        id: attributes.anomalyId as string,
        title: anomaly?.type ?? (graphic.popupTemplate?.title as string) ?? 'Anomalie',
        severity: anomaly?.severity ?? '',
      }
    }
    case 'region': {
      const region = data.regions.find((r) => r.code === attributes.regionCode)
      return {
        kind: 'region',
        id: attributes.regionCode as string,
        title: region?.name ?? (graphic.popupTemplate?.title as string) ?? 'Région',
      }
    }
    case 'zone': {
      const zone = data.zones.find((z) => z.code === attributes.zoneCode)
      return {
        kind: 'zone',
        id: attributes.zoneCode as string,
        title: zone?.name ?? (graphic.popupTemplate?.title as string) ?? 'Zone',
      }
    }
    case 'vrac':
      return { kind: 'vrac', id: 'vrac', title: LAYER_LABELS.vrac }
    default:
      return null
  }
}