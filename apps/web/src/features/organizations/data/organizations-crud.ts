/**
 * CRUD configuration for the `organizations` entity.
 *
 * Drives `<EntityForm>` and the create/edit mapping. `region`/`city`/`sites`
 * shown in the table are derived (from sites) and are NOT part of the
 * writable schema, so they are excluded from the form.
 */

import type { OrgType, Organization } from '@lpg/types'
import { field, type FieldConfig, type FormValues } from '@/components/entity-crud'

const ORG_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Régulateur', value: 'REGULATEUR' },
  { label: 'Dépôt', value: 'DEPOT' },
  { label: 'Marketeur', value: 'MARKETEUR' },
  { label: 'Transporteur', value: 'TRANSPORTEUR' },
  { label: 'Client', value: 'CLIENT' },
]

export const organizationFields: FieldConfig[] = [
  field.text('name', 'Nom', { required: true }),
  field.select('type', 'Type', ORG_TYPE_OPTIONS, { required: true }),
  field.text('registration_number', 'N° d’enregistrement'),
  field.text('tax_id', 'N° fiscal'),
  field.switchField('is_active', 'Organisation active'),
]

export function organizationToForm(o: Organization): FormValues {
  return {
    id: o.id,
    name: o.name,
    type: o.type,
    registration_number: (o as { registration_number?: string }).registration_number ?? '',
    tax_id: (o as { tax_id?: string }).tax_id ?? '',
    is_active: o.is_active,
  }
}

export function organizationFromForm(v: FormValues): Partial<Organization> {
  return {
    name: String(v.name),
    type: v.type as OrgType,
    registration_number: v.registration_number ? String(v.registration_number) : undefined,
    tax_id: v.tax_id ? String(v.tax_id) : undefined,
    is_active: Boolean(v.is_active),
  }
}
