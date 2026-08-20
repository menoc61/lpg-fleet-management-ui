import { lazy, Suspense, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import type MapView from '@arcgis/core/views/MapView.js'
import { MapIcon, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/context/theme-provider'
import { useRoleStore } from '@/store/role-store'
import { useAuthStore } from '@/store/auth-store'
import { getScope } from '@/features/scope/scope'
import { ROLE_LABELS } from '@/config/rbac/roles'
import { siteTypeLabels } from '@/features/sites/data/sites'
import { getNationalMapView } from '@/features/map/data/national-map'
import { NationalMapFilters } from './components/national-map-filters'
import { NationalMapToolbar, type MapSearchItem } from './components/national-map-toolbar'
import { NationalMapDetails } from './components/national-map-details'
import { getInitialLayers, type MapLayerKey } from './lib/layers'
import type { BasemapMode, MapEntitySelection } from './components/national-map'

const NationalMap = lazy(() =>
  import('./components/national-map').then((m) => ({ default: m.NationalMap })),
)

const route = getRouteApi('/_authenticated/map/')

export function NationalMapPage() {
  const { zone, site } = route.useSearch()
  const { resolvedTheme } = useTheme()
  const activeRole = useRoleStore((s) => s.activeRole)
  const user = useAuthStore((s) => s.user)
  const scope = useMemo(() => getScope(user), [user])
  const mapTheme = resolvedTheme === 'dark' ? 'dark' : 'light'
  const [layers, setLayers] = useState<Record<MapLayerKey, boolean>>(
    getInitialLayers(),
  )
  const [basemap, setBasemap] = useState<BasemapMode>('vector')
  const [refreshToken, setRefreshToken] = useState(0)
  const [layersOpen, setLayersOpen] = useState(false)
  const [selected, setSelected] = useState<MapEntitySelection | null>(null)
  const [view, setView] = useState<MapView | null>(null)

  const toggleLayer = (key: MapLayerKey, enabled: boolean) => {
    setLayers((prev) => ({ ...prev, [key]: enabled }))
  }

  const searchItems = useMemo<MapSearchItem[]>(() => {
    const view = getNationalMapView(scope)
    return [
      ...view.sites.map((s) => ({
        id: s.id,
        label: s.name,
        sublabel: `${siteTypeLabels[s.type]} · ${s.city}`,
        lat: s.latitude,
        lng: s.longitude,
      })),
      ...view.clientSites.map((cs) => ({
        id: cs.id,
        label: cs.name,
        sublabel: 'Site client',
        lat: cs.latitude,
        lng: cs.longitude,
      })),
    ].filter((item) => item.lat && item.lng)
  }, [scope])

  return (
    <main
      id="main-content"
      className="relative flex-1 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900"
    >
      <section className="rounded-2xl border-transparent bg-background/88 p-3 shadow-sm backdrop-blur-sm sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <MapIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Carte interactive</h1>
          <Badge variant="outline" className="ml-auto">
            {ROLE_LABELS[activeRole] ?? activeRole}
          </Badge>
        </div>
      </section>

      <section className="relative rounded-xl border-transparent bg-background/92 p-4 shadow-sm">
        <Suspense
          fallback={
            <div
              className='flex h-[700px] w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground'
              role='status'
              aria-label='Chargement de la carte'
            >
              Chargement de la carte…
            </div>
          }
        >
          <div className="relative">
            <NationalMap
              className='h-[700px] w-full rounded-lg'
              focusZone={zone}
              focusSite={site}
              layers={layers}
              mapTheme={mapTheme}
              basemap={basemap}
              scope={scope}
              refreshToken={refreshToken}
              onViewReady={(readyView) => {
                setView(readyView)
              }}
              onEntitySelect={(entity) => setSelected(entity)}
            />
            <NationalMapToolbar
              view={view}
              searchItems={searchItems}
              basemap={basemap}
              onBasemapChange={setBasemap}
              onRefresh={() => setRefreshToken((token) => token + 1)}
              onSearchPick={(item) => {
                void view
                  ?.goTo({ center: [item.lng, item.lat], zoom: 10 })
                  .catch(() => undefined)
              }}
              layersOpen={layersOpen}
              onLayersToggle={setLayersOpen}
            />
            {layersOpen ? (
              <NationalMapFilters
                layers={layers}
                mapTheme={mapTheme}
                onChange={toggleLayer}
              />
            ) : null}
            {selected ? (
              <NationalMapDetails
                entity={selected}
                onClose={() => setSelected(null)}
              />
            ) : null}
          </div>
        </Suspense>
      </section>

      <section className="rounded-xl border-transparent bg-background/92 p-3 text-xs text-muted-foreground shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Globe className="h-4 w-4" />
          Les données affichées proviennent du jeu de graine local
          ({'@lpg/mock-data'}). Les volumes VRAC sont exprimés en tonnes métriques
          (TM) — jamais en kg.
        </div>
      </section>
    </main>
  )
}