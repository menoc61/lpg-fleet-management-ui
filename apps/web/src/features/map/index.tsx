import { lazy, Suspense, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { MapIcon, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/context/theme-provider'
import { useRoleStore } from '@/store/role-store'
import { ROLE_LABELS } from '@/config/rbac/roles'
import { NationalMapFilters } from './components/national-map-filters'
import { getInitialLayers, type MapLayerKey } from './lib/layers'

const NationalMap = lazy(() =>
  import('./components/national-map').then((m) => ({ default: m.NationalMap })),
)

const route = getRouteApi('/_authenticated/map/')

export function NationalMapPage() {
  const { zone } = route.useSearch()
  const { resolvedTheme } = useTheme()
  const activeRole = useRoleStore((s) => s.activeRole)
  const mapTheme = resolvedTheme === 'dark' ? 'dark' : 'light'
  const [layers, setLayers] = useState<Record<MapLayerKey, boolean>>(
    getInitialLayers(),
  )

  const toggleLayer = (key: MapLayerKey, enabled: boolean) => {
    setLayers((prev) => ({ ...prev, [key]: enabled }))
  }

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
        <NationalMapFilters
          layers={layers}
          mapTheme={mapTheme}
          onChange={toggleLayer}
        />
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
          <NationalMap
            className='h-[700px] w-full rounded-lg'
            focusZone={zone}
            layers={layers}
            mapTheme={mapTheme}
          />
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
