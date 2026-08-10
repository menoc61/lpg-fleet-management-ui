import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Send } from 'lucide-react'
import { Badge, Button, Label } from '@lpg/ui'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import { sites, client_sites, vehicles, organizations } from '@lpg/mock-data'
import {
  usePickupsStore,
  pickupStatusLabels,
} from '@/store/pickups-store'

interface DraftRequest {
  source_id: string
  destination_id: string
  quantity_kg: number
  marketeur_org_id: string
}

interface Recommendation {
  vehicle: (typeof vehicles)[number]
  trips: number
  utilLabel: string
}

function recTrips(capacityKg: number, quantityKg: number): number {
  if (capacityKg <= 0) return 1
  return Math.max(1, Math.ceil(quantityKg / capacityKg))
}

function capacityKg(vehicle: (typeof vehicles)[number]): number {
  if (vehicle.max_volume) return vehicle.max_volume
  if (vehicle.max_bottle_count) return vehicle.max_bottle_count * 50
  return 20000
}

export function SupplyRequestPage() {
  const [draft, setDraft] = useState<DraftRequest>({
    source_id: '',
    destination_id: '',
    quantity_kg: 18000,
    marketeur_org_id: '',
  })
  const [submitted, setSubmitted] = useState<string | null>(null)

  const marketeurs = useMemo(
    () => organizations.filter((o) => o.type === 'MARKETEUR'),
    [],
  )

  const allSites = useMemo(() => [...sites, ...client_sites], [])

  const recommendations = useMemo<Recommendation[]>(() => {
    if (draft.quantity_kg <= 0) return []
    return vehicles
      .filter((v) => v.is_active !== false)
      .map((vehicle) => {
        const cap = capacityKg(vehicle)
        const trips = recTrips(cap, draft.quantity_kg)
        return { vehicle, trips, utilLabel: `${cap.toLocaleString('fr-FR')} kg` }
      })
      .sort((a, b) => a.trips - b.trips)
      .slice(0, 3)
  }, [draft.quantity_kg])

  const sourceName = allSites.find((s) => s.id === draft.source_id)?.name ?? '—'
  const destinationName = allSites.find((s) => s.id === draft.destination_id)?.name ?? '—'
  const marketerName = marketeurs.find((o) => o.id === draft.marketeur_org_id)?.name ?? '—'

  const canSubmit =
    draft.source_id && draft.destination_id && draft.quantity_kg > 0 && draft.marketeur_org_id

  function handleSubmit() {
    if (!canSubmit) return
    try {
      const created = usePickupsStore.getState().createPickup({
        marketeur_org_id: draft.marketeur_org_id,
        source_site_id: draft.source_id,
        destination_site_id: draft.destination_id,
        requested_quantity: draft.quantity_kg,
      })
      const reference = `PU-${created.id.slice(-4).toUpperCase()}`
      setSubmitted(reference)
      toast.success(`${reference} enregistrée (${pickupStatusLabels[created.status]})`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Requête impossible')
    }
  }

  function handleAddAnother() {
    setSubmitted(null)
    setDraft({ source_id: '', destination_id: '', quantity_kg: 18000, marketeur_org_id: '' })
  }

  return (
    <PageShell>
      <PageHeader
        title="Requête d'enlèvement"
        description="Créer une nouvelle requête d'approvisionnement (Flux 1) : source, destination, quantité et recommandation véhicules."
      />

      {submitted ? (
        <SectionCard title='Requête créée'>
          <div className='space-y-3'>
            <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950'>
              <p className='text-sm font-semibold text-emerald-800 dark:text-emerald-200'>
                Référence {submitted} enregistrée en brouillon.
              </p>
              <p className='mt-1 text-sm text-emerald-700 dark:text-emerald-300'>
                {marketerName} · {sourceName} → {destinationName} · {draft.quantity_kg.toLocaleString('fr-FR')} kg
              </p>
            </div>
            <div className='flex gap-2'>
              <Button onClick={handleAddAnother} className='gap-2'>
                <Plus className='size-4' /> Nouvelle requête
              </Button>
              <Button asChild variant='outline'>
                <a href='/pickups'>Voir les requêtes</a>
              </Button>
            </div>
          </div>
        </SectionCard>
      ) : (
        <div className='grid gap-4 lg:grid-cols-[1fr_360px]'>
          <SectionCard title='Détails de la requête'>
            <div className='space-y-5'>
              <div className='space-y-2'>
                <Label>Marketeur</Label>
                <Select value={draft.marketeur_org_id} onValueChange={(v) => setDraft((d) => ({ ...d, marketeur_org_id: v }))}>
                  <SelectTrigger><SelectValue placeholder='Sélectionner un marketeur' /></SelectTrigger>
                  <SelectContent>
                    {marketeurs.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Site source</Label>
                  <Select value={draft.source_id} onValueChange={(v) => setDraft((d) => ({ ...d, source_id: v }))}>
                    <SelectTrigger><SelectValue placeholder='Point de départ' /></SelectTrigger>
                    <SelectContent>
                      {allSites.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Site destination</Label>
                  <Select value={draft.destination_id} onValueChange={(v) => setDraft((d) => ({ ...d, destination_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Point d'arrivée" /></SelectTrigger>
                    <SelectContent>
                      {allSites.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Quantité demandée (kg)</Label>
                <Input
                  type='number'
                  min={1}
                  step={1000}
                  value={draft.quantity_kg}
                  onChange={(e) => setDraft((d) => ({ ...d, quantity_kg: Number(e.target.value) }))}
                />
                <p className='text-xs text-muted-foreground'>
                  {(draft.quantity_kg / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} tonnes métriques (TM)
                </p>
              </div>

              <div className='flex justify-end'>
                <Button onClick={handleSubmit} disabled={!canSubmit} className='gap-2'>
                  <Send className='size-4' /> Créer la requête
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title='Recommandation véhicules' description='Meilleure utilisation de la flotte selon la capacité.'>
            {recommendations.length === 0 ? (
              <p className='text-sm text-muted-foreground'>Renseignez une quantité pour voir les recommandations.</p>
            ) : (
              <div className='space-y-3'>
                {recommendations.map(({ vehicle, trips, utilLabel }) => (
                  <div key={vehicle.id} className='rounded-lg border p-3 text-sm'>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='font-medium'>{vehicle.license_plate}</span>
                      <Badge variant='secondary'>{trips} aller(s)</Badge>
                    </div>
                    <p className='mt-1 text-xs text-muted-foreground'>Capacité {utilLabel}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </PageShell>
  )
}