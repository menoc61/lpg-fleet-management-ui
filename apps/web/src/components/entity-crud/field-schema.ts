import { z } from 'zod'
import type { FieldConfig } from './field-config'

/** A zod object rule per field `name`, used by react-hook-form resolvers. */
export type FieldValuesSchema = z.ZodObject<Record<string, z.ZodTypeAny>>

/**
 * Build a zod object schema from a declarative `FieldConfig[]` (see
 * `field-config.ts`). Each field maps to a rule: required string fields are
 * `min(1)`, email/url validate format, numbers are coerced from strings,
 * switches are booleans and checklists are arrays of strings. Optional
 * string fields accept an empty string (untouched form inputs).
 */
export function zodSchemaFromFields(fields: FieldConfig[]): FieldValuesSchema {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const f of fields) {
    let rule: z.ZodTypeAny
    switch (f.type) {
      case 'email':
        rule = z.string().email('Email invalide')
        break
      case 'url':
        rule = z.string().url('URL invalide')
        break
      case 'number':
        // Coerce strings from inputs, but keep an untouched/empty input as
        // `undefined` (instead of coercing '' to 0) so the field's `transform`
        // can map it back to null and required numbers actually fail.
        rule = z.preprocess(
          (v) => (v === '' || v == null ? undefined : v),
          z.coerce.number({ message: 'Valeur numérique requise' }),
        )
        break
      case 'switch':
        rule = z.boolean()
        break
      case 'checklist':
        rule = z.array(z.string())
        break
      case 'date':
        rule = z.string()
        break
      default:
        rule = z.string()
    }

    const isStringish = f.type !== 'number' && f.type !== 'switch'
    if (f.required && isStringish) {
      rule = (rule as z.ZodString | z.ZodArray<z.ZodString>).min(1, 'Champ requis')
    } else if (!f.required && isStringish) {
      rule = rule.optional()
      if (f.type === 'email' || f.type === 'url') {
        rule = z.union([rule, z.literal('')])
      }
    } else if (f.type === 'number' && !f.required) {
      rule = rule.optional()
    }

    shape[f.name] = rule
  }
  return z.object(shape)
}
