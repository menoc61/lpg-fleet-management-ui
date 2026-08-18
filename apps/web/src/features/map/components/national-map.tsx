import { useEffect, useRef, useState } from 'react'
import Graphic from '@arcgis/core/Graphic.js'
import ArcGISMap from '@arcgis/core/Map.js'
import '@arcgis/core/assets/esri/themes/light/main.css'
import '@arcgis/core/assets/esri/themes/dark/main.css'
import esriConfig from '@arcgis/core/config.js'
import Point from '@arcgis/core/geometry/Point.js'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js'
import MapView from '@arcgis/core/views/MapView.js'
import type { ClickEvent } from '@arcgis/core/views/input/types.js'
import { AlertTriangle, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@lpg/ui'
import { getNationalMapView, type NationalMapView } from '@/features/map/data/national-map'
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
import type { SiteType } from '@/features/sites/data/sites'
import lpgImageUrl from '@/assets/lpg.png'

const arcgisApiKey = String(import.meta.env.VITE_ARCGIS_API_KEY ?? '').trim()

if (arcgisApiKey) {
  esriConfig.apiKey = arcgisApiKey
}

const CAMEROON_CENTER: [number, number] = [8.7, 12.3]

export type NationalMapProps = {
  mapTheme?: MapTheme
  className?: string
  focusZone?: string
  layers?: Record<MapLayerKey, boolean>
}

export function NationalMap({
  mapTheme = 'light',
  className,
  focusZone,
  layers = getInitialLayers(),
}: NationalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<ArcGISMap | null>(null)
  const viewRef = useRef<MapView | null>(null)
  const layersRef = useRef<Record<string, GraphicsLayer>>({})
  const focusLayerRef = useRef<GraphicsLayer | null>(null)
  const initialMapThemeRef = useRef(mapTheme)
  const [isReady, setIsReady] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [data] = useState<NationalMapView | null>(() => getNationalMapView())

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
      if (graphic?.popupTemplate?.content && graphic.geometry) {
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
    map.basemap = getArcgisBasemap(mapTheme)
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

    layers.sites?.removeAll()
    layers.clientSites?.removeAll()
    layers.regions?.removeAll()
    layers.zones?.removeAll()
    layers.anomalies?.removeAll()
    layers.vrac?.removeAll()

    layers.sites?.addMany(siteGraphics)
    layers.clientSites?.addMany(clientGraphics)
    layers.regions?.addMany(regionGraphics)
    layers.zones?.addMany(zoneGraphics)
    layers.anomalies?.addMany(anomalyGraphics)
    layers.vrac?.addMany(vracGraphics)
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
    if (!region) {
      return () => {
        active = false
        focusLayer.removeAll()
      }
    }

    const focusGraphic = new Graphic({
      geometry: new Point({
        longitude: region.longitude,
        latitude: region.latitude,
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
      attributes: { kind: 'focused-region', regionCode: region.code },
      popupTemplate: {
        title: region.name,
        content: buildRegionPopupContent(region, mapTheme),
      },
    })
    if (!active) return
    focusLayer.add(focusGraphic)

    const navigation = view.goTo({
      center: [region.longitude, region.latitude],
      zoom: 8,
    }) as Promise<void> & { cancel?: () => void }
    void navigation.catch(() => undefined)

    return () => {
      active = false
      navigation.cancel?.()
      focusLayer.remove(focusGraphic)
    }
  }, [data, focusZone, isReady, mapTheme])

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
