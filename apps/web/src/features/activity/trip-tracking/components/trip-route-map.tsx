import { useEffect, useRef, useState } from 'react'
import '@arcgis/core/assets/esri/themes/light/main.css'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import Graphic from '@arcgis/core/Graphic'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import * as route from '@arcgis/core/rest/route'
import RouteParameters from '@arcgis/core/rest/support/RouteParameters'
import FeatureSet from '@arcgis/core/rest/support/FeatureSet'
import Point from '@arcgis/core/geometry/Point'
import esriConfig from '@arcgis/core/config'
import { Loader2, Navigation } from 'lucide-react'
import type { ClickEvent } from '@arcgis/core/views/input/types'
import { useTheme } from '@/context/theme-provider'

import type { TourWithDetails } from '../../trip-data'
import { sites } from '@/features/sites/data/sites'
import { createSiteGraphics, type MapTheme } from '@/features/sites/utils/site-graphics'
import { cn } from '@/lib/utils'

// Configure API Key (make sure it's defined in .env)
if (import.meta.env.VITE_ARCGIS_API_KEY) {
  esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY
}

const routeUrl = 'https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World'

type TourRouteMapProps = {
  tour: TourWithDetails | null
}

export function TripRouteMap({ tour }: TourRouteMapProps) {
  const mapDiv = useRef<HTMLDivElement>(null)
  const viewRef = useRef<MapView | null>(null)
  const routeLayerRef = useRef<GraphicsLayer | null>(null)
  const sitesLayerRef = useRef<GraphicsLayer | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const mapTheme: MapTheme = resolvedTheme === 'dark' ? 'dark' : 'light'

  // Initialize Map (only once)
  useEffect(() => {
    if (!mapDiv.current) return

    const routeLayer = new GraphicsLayer()
    const sitesLayer = new GraphicsLayer()
    routeLayerRef.current = routeLayer
    sitesLayerRef.current = sitesLayer

    const initialTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'

    const map = new Map({
      basemap: initialTheme === 'dark' ? 'dark-gray-vector' : 'streets-navigation-vector',
      layers: [sitesLayer, routeLayer],
    })

    const view = new MapView({
      container: mapDiv.current,
      map: map,
      center: [11.5167, 3.8667], // Default center (Yaoundé)
      zoom: 6,
      ui: { components: ['zoom'] }, // minimal UI
      popup: {
        dockEnabled: false,
      },
      theme: initialTheme === 'dark'
        ? { accentColor: '#86efac', textColor: '#f8fafc' }
        : { accentColor: '#16a34a', textColor: '#0f172a' },
    })

    // Handle clicks for popups on sites
    const clickHandle = view.on('click', async (event: ClickEvent) => {
      const response = await view.hitTest(event)
      const siteHit = response.results.find((r) => {
        const graphic = (r as { graphic?: Graphic }).graphic
        return graphic?.attributes?.kind === 'site' || graphic?.attributes?.kind === 'trip-marker'
      }) as { graphic?: Graphic } | undefined

      if (siteHit?.graphic) {
        await view.openPopup({
          features: [siteHit.graphic],
          location: siteHit.graphic.geometry as Point,
        })
      }
    })

    viewRef.current = view

    view.when().then(() => {
      // Map is ready
    }).catch(() => {})

    return () => {
      clickHandle.remove()
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
  }, []) // Empty dependency array, run once

  const lastAppliedTheme = useRef<MapTheme>(mapTheme)

  // Update theme dynamically without recreating map
  useEffect(() => {
    const map = viewRef.current?.map
    const view = viewRef.current
    if (!map || !view) return
    if (lastAppliedTheme.current === mapTheme) return
    
    lastAppliedTheme.current = mapTheme
    const basemap = mapTheme === 'dark' ? 'dark-gray-vector' : 'streets-navigation-vector'
    // eslint-disable-next-line react-hooks/immutability -- ArcGIS Map.basemap is a mutable property
    map.basemap = basemap
    view.theme = mapTheme === 'dark'
      ? { accentColor: '#86efac', textColor: '#f8fafc' }
      : { accentColor: '#16a34a', textColor: '#0f172a' }
  }, [mapTheme])

  // Update sites on map
  useEffect(() => {
    const sitesLayer = sitesLayerRef.current
    if (!sitesLayer) return

    const siteGraphics = sites.flatMap((site) => createSiteGraphics(site, mapTheme))
    sitesLayer.removeAll()
    sitesLayer.addMany(siteGraphics)
  }, [mapTheme])

  // Update Route when tour changes - uses checkpoints from schema
  useEffect(() => {
    if (!viewRef.current || !routeLayerRef.current || !tour) return

    const routeLayer = routeLayerRef.current

    routeLayer.removeAll()
    setIsCalculating(true)
    setError(null)

    // Build stops from tour checkpoints (schema-aligned)
    const checkpoints = tour.checkpoints || []
    
    // Get all stop points: origin (start) -> checkpoints -> destination (end)
    const stops: { longitude: number; latitude: number; name: string; sequence: number }[] = []

    // Add origin (first checkpoint site or marketeur depot)
    const firstCheckpoint = checkpoints[0]
    if (firstCheckpoint) {
      const site = firstCheckpoint.site
      const clientSite = firstCheckpoint.client_site
      if (site?.geo_point) {
        stops.push({
          longitude: site.geo_point[0],
          latitude: site.geo_point[1],
          name: `Départ: ${site.name}`,
          sequence: 0,
        })
      } else if (clientSite?.geo_point) {
        stops.push({
          longitude: clientSite.geo_point[0],
          latitude: clientSite.geo_point[1],
          name: `Départ: ${clientSite.name}`,
          sequence: 0,
        })
      }
    }

    // Add all checkpoints in sequence order
    checkpoints.forEach((cp) => {
      const site = cp.site
      const clientSite = cp.client_site
      if (site?.geo_point) {
        stops.push({
          longitude: site.geo_point[0],
          latitude: site.geo_point[1],
          name: `${cp.sequence}. ${site.name}`,
          sequence: cp.sequence,
        })
      } else if (clientSite?.geo_point) {
        stops.push({
          longitude: clientSite.geo_point[0],
          latitude: clientSite.geo_point[1],
          name: `${cp.sequence}. ${clientSite.name}`,
          sequence: cp.sequence,
        })
      }
    })

    // Add final destination if different
    // (In our schema, the last checkpoint is typically the destination)

    if (stops.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- guarded early exit before async route solve
      setError('Pas assez de points géolocalisés pour calculer l\'itinéraire')
      setIsCalculating(false)
      return
    }

    // Define marker styles
    const originSymbol = {
      type: 'simple-marker' as const,
      style: 'circle' as const,
      color: [255, 255, 255],
      size: '14px',
      outline: {
        color: [34, 197, 94], // green for origin
        width: 3,
      },
    }

    const destSymbol = {
      type: 'simple-marker' as const,
      style: 'circle' as const,
      color: [255, 255, 255],
      size: '14px',
      outline: {
        color: [59, 130, 246], // blue for destination
        width: 3,
      },
    }

    const intermediateSymbol = {
      type: 'simple-marker' as const,
      style: 'circle' as const,
      color: [255, 255, 255],
      size: '10px',
      outline: {
        color: [59, 130, 246], // blue for intermediate stops
        width: 2,
      },
    }

    // Create graphics for all stops
    const stopGraphics = stops.map((stop, idx) => {
      const isFirst = idx === 0
      const isLast = idx === stops.length - 1
      
      let symbol = intermediateSymbol
      if (isFirst) symbol = originSymbol
      if (isLast) symbol = destSymbol

      return new Graphic({
        geometry: new Point({
          longitude: stop.longitude,
          latitude: stop.latitude,
        }),
        symbol,
        attributes: { Name: stop.name, sequence: stop.sequence, kind: 'trip-marker' },
        popupTemplate: {
          title: stop.name,
          content: `
            <div class="fleet-truck-popup" data-popup-theme="${mapTheme}">
              <p class="fleet-truck-popup__row">
                <strong>Séquence</strong>
                <span>${stop.sequence}</span>
              </p>
            </div>
          `,
        }
      })
    })

    routeLayer.addMany(stopGraphics)

    // Create route stops for routing (only first and last for direct route, or all for multi-stop)
    // For multi-stop, we use the ArcGIS route solver with all stops
    const routeStops = stops.map((stop) =>
      new Graphic({
        geometry: new Point({
          longitude: stop.longitude,
          latitude: stop.latitude,
        }),
      })
    )

    const routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: routeStops,
      }),
      returnDirections: false,
      returnRoutes: true,
      findBestSequence: false, // We want to preserve the checkpoint sequence
      preserveFirstStop: true,
      preserveLastStop: true,
    })

    route
      .solve(routeUrl, routeParams)
      .then((data) => {
        if (data.routeResults && data.routeResults.length > 0) {
          const routeResult = (data.routeResults[0] as { route?: Graphic }).route
          if (routeResult && routeResult.geometry?.extent) {
            routeResult.symbol = {
              type: 'simple-line',
              color: [59, 130, 246, 0.8], // blue line
              width: 4,
            } as unknown as NonNullable<typeof routeResult.symbol>
            routeLayer.add(routeResult)

            // Zoom to route
            const extent = routeResult.geometry?.extent
            if (extent != null) {
              viewRef.current?.when().then(() => {
                viewRef.current?.goTo({ target: extent.expand(1.2) }).catch(() => {})
              }).catch(() => {})
            }
          }
        }
      })
      .catch((err) => {
        console.error('Routing error:', err)
        setError("Impossible de calculer l'itinéraire exact.")
        // Still zoom to stops even if routing fails
        viewRef.current?.when().then(() => {
          const allPoints = stops.map(s => new Point({ longitude: s.longitude, latitude: s.latitude }))
          viewRef.current?.goTo({ target: allPoints }).catch(() => {})
        }).catch(() => {})
      })
      .finally(() => {
        setIsCalculating(false)
      })
  }, [tour, mapTheme]) // Added mapTheme so popups update with theme!

  if (!tour) {
    return (
      <div className='flex h-full w-full items-center justify-center bg-muted/30'>
        <div className='flex flex-col items-center text-muted-foreground'>
          <Navigation className='mb-2 h-8 w-8 opacity-20' />
          <p className='text-sm'>Sélectionnez une tournée pour voir la carte</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'fleet-arcgis-map relative h-full w-full min-h-[200px] overflow-hidden bg-muted/30',
        mapTheme === 'dark' ? 'calcite-mode-dark' : 'calcite-mode-light'
      )}
      data-map-theme={mapTheme}
    >
      {/* Map Container */}
      <div ref={mapDiv} className='absolute inset-0 outline-none' />

      {/* Loading Overlay */}
      {isCalculating && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-background/20 backdrop-blur-[2px] transition-all duration-300'>
          <div className='flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-md'>
            <Loader2 className='h-4 w-4 animate-spin text-primary' />
            Calcul de l'itinéraire optimal...
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !isCalculating && (
        <div className='absolute bottom-6 left-1/2 z-10 -translate-x-1/2'>
          <div className='rounded-full border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive shadow-md backdrop-blur-sm'>
            {error}
          </div>
        </div>
      )}
      
      {/* Map styling overrides to hide esri widgets if we want it fully clean */}
      <style>{`
        .esri-view .esri-view-surface:focus::after {
          outline: none !important;
        }
      `}</style>
    </div>
  )
}