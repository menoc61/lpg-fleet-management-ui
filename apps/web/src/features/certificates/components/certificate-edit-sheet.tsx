import { useState } from 'react'
import { toast } from 'sonner'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@lpg/ui'
import { api } from '@lpg/api-client'
import { VEHICLE_OPTIONS, certificateFromForm } from '../data/certificates-crud'
import type { CertificateView } from '../data/certificates'

interface CertificateFormState {
  vehicle_id: string
  certificate_number: string
  issued_at: string
  expiry_at: string
  url: string
}

type CertificateEditSheetProps = {
  certificate: CertificateView | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

function certToForm(c: CertificateView): CertificateFormState {
  return {
    vehicle_id: c.vehicleId,
    certificate_number: c.certificateNumber === '—' ? '' : c.certificateNumber,
    issued_at: c.issuedAt === '—' ? '' : c.issuedAt,
    expiry_at: c.expiryAt === '—' ? '' : c.expiryAt,
    url: c.url ?? '',
  }
}

export function CertificateEditSheet({
  certificate,
  open,
  onOpenChange,
  onSaved,
}: CertificateEditSheetProps) {
  const [submitting, setSubmitting] = useState(false)
  const isCreate = certificate === null

  const [form, setForm] = useState<CertificateFormState>(() =>
    certificate ? certToForm(certificate) : { vehicle_id: '', certificate_number: '', issued_at: '', expiry_at: '', url: '' },
  )

  function update<K extends keyof CertificateFormState>(key: K, value: CertificateFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.vehicle_id) {
      toast.error('Un véhicule est obligatoire.')
      return
    }
    if (!form.certificate_number.trim()) {
      toast.error('Le numéro de certificat est obligatoire.')
      return
    }
    setSubmitting(true)
    try {
      const patch = await certificateFromForm(form)
      await api.vehicles.patch(form.vehicle_id, patch)
      toast.success(isCreate ? 'Certificat créé.' : 'Certificat mis à jour.')
      onSaved?.()
      onOpenChange(false)
    } catch {
      toast.error('Échec de l’enregistrement.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col sm:max-w-xl'>
        <SheetHeader className='pb-2'>
          <SheetTitle>
            {isCreate ? 'Nouveau certificat' : 'Modifier le certificat'}
          </SheetTitle>
          <SheetDescription>
            {isCreate
              ? 'Associez un certificat de jaugeage à un véhicule.'
              : certificate
                ? `${certificate.licensePlate} — ${certificate.certificateNumber}`
                : ''}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 space-y-4 overflow-y-auto px-4 pb-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='vehicle_id'>Véhicule</Label>
            <Select
              value={form.vehicle_id}
              onValueChange={(v) => update('vehicle_id', v)}
            >
              <SelectTrigger id='vehicle_id'>
                <SelectValue placeholder='Choisir un véhicule...' />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='certificate_number'>N° certificat</Label>
            <Input
              id='certificate_number'
              value={form.certificate_number}
              onChange={(e) => update('certificate_number', e.target.value)}
              placeholder='JAUGE-2026-XXXX'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='issued_at'>Émis le</Label>
              <Input
                id='issued_at'
                type='date'
                value={form.issued_at}
                onChange={(e) => update('issued_at', e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='expiry_at'>Expire le</Label>
              <Input
                id='expiry_at'
                type='date'
                value={form.expiry_at}
                onChange={(e) => update('expiry_at', e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='url'>URL du document (MinIO)</Label>
            <Input
              id='url'
              type='url'
              value={form.url}
              onChange={(e) => update('url', e.target.value)}
              placeholder='https://...'
            />
            <p className='text-xs text-muted-foreground'>
              Le lien est enregistré via saveLink (MinIO).
            </p>
          </div>
        </div>

        <SheetFooter className='gap-2 border-t pt-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? 'Enregistrement...' : isCreate ? 'Créer' : 'Enregistrer'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
