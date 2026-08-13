import { useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@lpg/ui'
import { vehicles as vehiclesData } from '@lpg/mock-data'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import { PickupsTable } from './components/pickups-table'
import { PickupsCreateWizard } from './components/pickups-create-wizard'
import { PickupsValidateDialog } from './components/pickups-validate-dialog'
import { getPickups, getPickupSummary, orgName, siteName, type Pickup, type PickupStatus } from './data/pickups'
import type { PickupRequest } from '@lpg/types'

export function PickupsPage({ role }: { role: 'MARKETEUR' | 'ADMIN' | 'SUPERADMIN' }) {
  const [rows, setRows] = useState<Pickup[]>(() => getPickups())
  const [createOpen, setCreateOpen] = useState(false)
  const [assignedVehicles, setAssignedVehicles] = useState<Record<string, string[]>>({})
  const [validateOpen, setValidateOpen] = useState<Pickup | null>(null)
  const [detailOpen, setDetailOpen] = useState<Pickup | null>(null)

  const summary = getPickupSummary(rows)

  const handleCreated = (created: PickupRequest, vehicleIds: string[]) => {
    const reference = `PU-${1001 + rows.length}`
    const row: Pickup = {
      id: created.id,
      reference,
      source_name: siteName(created.source_site_id),
      destination_name: siteName(created.destination_site_id),
      marketeur_name: orgName(created.marketeur_org_id),
      requested_quantity: created.requested_quantity,
      approved_quantity: null,
      pickup_status: 'DRAFT',
      requested_at: created.created_at ?? new Date().toISOString(),
      validated_at: null,
      started_at: null,
      completed_at: null,
      proof_url: null,
    }
    setRows((prev) => [row, ...prev])
    setAssignedVehicles((prev) => ({ ...prev, [created.id]: vehicleIds }))
    if (vehicleIds.length > 0) {
      toast.success(`${reference} créée — ${vehicleIds.length} véhicule(s) assigné(s)`)
    }
  }

  const handleValidate = (row: Pickup, qty: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? { ...r, pickup_status: 'VALIDATED' as PickupStatus, approved_quantity: qty, validated_at: new Date().toISOString() }
          : r
      )
    )
    toast.success(`${row.reference} validée pour ${qty.toLocaleString('fr-FR')} kg`)
  }

  const handleCancel = (row: Pickup) => {
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, pickup_status: 'CANCELLED' as PickupStatus } : r))
    )
    toast.warning(`${row.reference} annulée`)
  }

  const detailVehicleIds = detailOpen ? assignedVehicles[detailOpen.id] ?? [] : []
  const detailVehicles = detailVehicleIds
    .map((vid) => vehiclesData.find((v) => v.id === vid)?.license_plate ?? vid)
    .join(', ')

  return (
    <PageShell>
      <PageHeader
        title='Approvisionnements (Flux 1)'
        description={`${summary.total} requêtes — ${summary.draft} brouillon(s), ${summary.validated} validée(s), ${summary.inProgress} en cours, ${summary.completed} terminée(s).`}
        actions={
          role === 'MARKETEUR' ? (
            <Button className='gap-2' onClick={() => setCreateOpen(true)}>
              <Plus className='size-4' /> Nouvelle requête
            </Button>
          ) : null
        }
      />
      <SectionCard>
        <PickupsTable
          rows={rows}
          onOpenDetails={(row) => {
            if ((role === 'ADMIN' || role === 'SUPERADMIN') && row.pickup_status === 'DRAFT') {
              setValidateOpen(row)
            } else {
              setDetailOpen(row)
            }
          }}
        />
      </SectionCard>

      <PickupsCreateWizard
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />

      <PickupsValidateDialog
        pickup={validateOpen}
        open={validateOpen !== null}
        onOpenChange={(o) => { if (!o) setValidateOpen(null) }}
        onValidate={(qty) => validateOpen && handleValidate(validateOpen, qty)}
      />

      <Dialog open={detailOpen !== null && validateOpen === null} onOpenChange={(o) => { if (!o) setDetailOpen(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailOpen?.reference ?? '—'}</DialogTitle>
          </DialogHeader>
          {detailOpen && (
            <div className='space-y-2 py-2 text-sm'>
              <p>Marketeur: {detailOpen.marketeur_name}</p>
              <p>Source: {detailOpen.source_name}</p>
              <p>Destination: {detailOpen.destination_name}</p>
              <p>Quantité demandée: {detailOpen.requested_quantity.toLocaleString('fr-FR')} kg</p>
              <p>Quantité approuvée: {detailOpen.approved_quantity?.toLocaleString('fr-FR') ?? '—'}</p>
              <p>Statut: {detailOpen.pickup_status}</p>
              {detailVehicleIds.length > 0 && (
                <p>Véhicules: {detailVehicles}</p>
              )}
            </div>
          )}
          {(role === 'MARKETEUR' || role === 'ADMIN' || role === 'SUPERADMIN') && detailOpen?.pickup_status !== 'CANCELLED' && detailOpen?.pickup_status !== 'COMPLETED' ? (
            <DialogFooter>
              <Button variant='destructive' onClick={() => { if (detailOpen) handleCancel(detailOpen); setDetailOpen(null) }}>
                Annuler la requête
              </Button>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}