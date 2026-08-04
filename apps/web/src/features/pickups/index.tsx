import { useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@lpg/ui'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell, SectionCard } from '@/components/layout/page'
import { PickupsTable } from './components/pickups-table'
import { PickupsValidateDialog } from './components/pickups-validate-dialog'
import { getPickups, getPickupSummary, type Pickup, type PickupStatus } from './data/pickups'

export function PickupsPage({ role }: { role: 'MARKETEUR' | 'ADMIN' | 'SUPERADMIN' }) {
  const [rows, setRows] = useState<Pickup[]>(() => getPickups())
  const [validateOpen, setValidateOpen] = useState<Pickup | null>(null)
  const [detailOpen, setDetailOpen] = useState<Pickup | null>(null)

  const summary = getPickupSummary(rows)

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

  return (
    <PageShell>
      <PageHeader
        title='Approvisionnements (Flux 1)'
        description={`${summary.total} requêtes — ${summary.draft} brouillon(s), ${summary.validated} validée(s), ${summary.inProgress} en cours, ${summary.completed} terminée(s).`}
        actions={
          role === 'MARKETEUR' ? (
            <Button asChild className='gap-2'>
              <a href='/marketeur/supply'>
                <Plus className='size-4' /> Nouvelle requête
              </a>
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