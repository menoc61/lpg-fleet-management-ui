/**
 * Generic, config-driven entity form. Renders fields from a `FieldConfig[]`
 * and reports a validated value map on submit. No per-entity sheet duplication.
 *
 * Convention (matches `features/users/components/user-edit-sheet.tsx`):
 * `useState` form state, `@lpg/ui` primitives, `sonner` toasts, `Sheet`.
 */

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Button,
  Checkbox,
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
  Switch,
  Textarea,
} from '@lpg/ui'
import { isHttpUrl } from '@/lib/save-link'
import type { FieldConfig } from './field-config'

export type FormValues = Record<string, unknown>

export interface EntityFormProps {
  fields: FieldConfig[]
  /** Existing entity for edit mode; null/undefined for create. */
  initial?: FormValues | null
  onSubmit: (values: FormValues) => void | Promise<void>
  onCancel: () => void
  title: string
  description?: string
  submitting?: boolean
  submitLabel?: string
}

function buildInitial(fields: FieldConfig[], initial?: FormValues | null): FormValues {
  const out: FormValues = {}
  for (const f of fields) {
    const v = initial?.[f.name]
    out[f.name] = v !== undefined ? v : (f.defaultValue ?? (f.type === 'switch' ? false : ''))
  }
  return out
}

function validate(fields: FieldConfig[], values: FormValues): string | null {
  for (const f of fields) {
    const raw = values[f.name]
    if (f.required) {
      const empty =
        raw === '' || raw === null || raw === undefined || (f.type === 'switch' && raw === false)
      if (empty) return `${f.label} est obligatoire.`
    }
    if (f.type === 'email' && raw && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(raw))) {
      return `${f.label} doit être une adresse e-mail valide.`
    }
    if (f.type === 'url' && raw && !isHttpUrl(String(raw))) {
      return `${f.label} doit être une URL valide (http/https).`
    }
  }
  return null
}

export function EntityForm({
  fields,
  initial,
  onSubmit,
  onCancel,
  title,
  description,
  submitting,
  submitLabel = 'Enregistrer',
}: EntityFormProps) {
  const [values, setValues] = useState<FormValues>(() => buildInitial(fields, initial))
  const isEdit = Boolean(initial && initial.id)

  function set(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  async function handleSubmit() {
    const error = validate(fields, values)
    if (error) {
      toast.error(error)
      return
    }
    const out: FormValues = {}
    for (const f of fields) {
      const raw = values[f.name]
      out[f.name] = f.transform ? f.transform(raw) : raw
    }
    if (isEdit && initial?.id) out.id = initial.id
    await onSubmit(out)
  }

  return (
    <SheetContent className='flex w-full flex-col sm:max-w-xl'>
      <SheetHeader className='pb-2'>
        <SheetTitle>{title}</SheetTitle>
        {description ? <SheetDescription>{description}</SheetDescription> : null}
      </SheetHeader>

      <div className='flex-1 space-y-4 overflow-y-auto px-4 pb-2'>
        {fields.map((f) => (
          <Field key={f.name} config={f} value={values[f.name]} onChange={(v) => set(f.name, v)} />
        ))}
      </div>

      <SheetFooter className='gap-2 border-t pt-4'>
        <Button variant='outline' onClick={onCancel} disabled={submitting}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Enregistrement…' : submitLabel}
        </Button>
      </SheetFooter>
    </SheetContent>
  )
}

function Field({
  config,
  value,
  onChange,
}: {
  config: FieldConfig
  value: unknown
  onChange: (v: unknown) => void
}) {
  const id = `field-${config.name}`

  if (config.type === 'switch') {
    return (
      <div className='flex items-center justify-between rounded-md border p-3'>
        <div>
          <Label htmlFor={id} className='cursor-pointer'>
            {config.label}
          </Label>
          {config.help ? (
            <p className='text-xs text-muted-foreground'>{config.help}</p>
          ) : null}
        </div>
        <Switch
          id={id}
          checked={Boolean(value)}
          onCheckedChange={(v) => onChange(v)}
        />
      </div>
    )
  }

  if (config.type === 'select') {
    return (
      <div className='space-y-1.5'>
        <Label htmlFor={id}>{config.label}</Label>
        <Select value={value ? String(value) : undefined} onValueChange={(v) => onChange(v)}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={config.placeholder ?? 'Choisir…'} />
          </SelectTrigger>
          <SelectContent>
            {(config.options ?? []).map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {config.help ? <p className='text-xs text-muted-foreground'>{config.help}</p> : null}
      </div>
    )
  }

  if (config.type === 'checklist') {
    const selected = Array.isArray(value) ? (value as string[]) : []
    return (
      <div className='space-y-1.5'>
        <Label>{config.label}</Label>
        <div className='max-h-64 space-y-1 overflow-y-auto rounded-md border p-2'>
          {(config.options ?? []).map((o) => (
            <div key={o.value} className='flex items-center gap-2 rounded px-1 py-0.5 hover:bg-muted/50'>
              <Checkbox
                id={`${id}-${o.value}`}
                checked={selected.includes(o.value)}
                onCheckedChange={(checked) => {
                  if (checked) onChange([...selected, o.value])
                  else onChange(selected.filter((c) => c !== o.value))
                }}
              />
              <Label htmlFor={`${id}-${o.value}`} className='cursor-pointer font-mono text-xs'>
                {o.value}
              </Label>
            </div>
          ))}
        </div>
        {config.help ? <p className='text-xs text-muted-foreground'>{config.help}</p> : null}
      </div>
    )
  }

  return (
    <div className='space-y-1.5'>
      <Label htmlFor={id}>{config.label}</Label>
      {config.type === 'textarea' ? (
        <Textarea
          id={id}
          value={value ? String(value) : ''}
          placeholder={config.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          id={id}
          type={config.type === 'number' ? 'number' : config.type === 'date' ? 'date' : 'text'}
          value={value === null || value === undefined ? '' : String(value)}
          placeholder={config.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {config.help ? <p className='text-xs text-muted-foreground'>{config.help}</p> : null}
    </div>
  )
}

export function EntityFormSheet(props: EntityFormProps & { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { open, onOpenChange, ...rest } = props
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <EntityForm {...rest} />
    </Sheet>
  )
}
