import { describe, expect, it } from 'vitest'
import { field, type FieldConfig } from './field-config'
import { zodSchemaFromFields } from './field-schema'

const contactFields: FieldConfig[] = [
  field.text('name', 'Nom', { required: true }),
  field.email('email', 'Email'),
  field.url('website', 'Site web'),
  field.number('count', 'Quantité'),
  field.select(
    'status',
    'Statut',
    [
      { label: 'Actif', value: 'ACTIVE' },
      { label: 'Inactif', value: 'INACTIVE' },
    ],
    { required: true },
  ),
  field.switchField('enabled', 'Activé'),
  field.checklist(
    'tags',
    'Étiquettes',
    [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ],
    { required: true },
  ),
]

describe('zodSchemaFromFields', () => {
  it('builds a schema that validates a valid payload and coerces numbers', () => {
    const schema = zodSchemaFromFields(contactFields)
    const result = schema.safeParse({
      name: 'Acme',
      email: 'a@b.co',
      website: 'https://acme.example',
      count: '3',
      status: 'ACTIVE',
      enabled: true,
      tags: ['a'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.count).toBe(3)
      expect(result.data.tags).toEqual(['a'])
    }
  })

  it('rejects an invalid payload', () => {
    const schema = zodSchemaFromFields(contactFields)
    const result = schema.safeParse({
      name: '',
      email: 'nope',
      website: 'not-a-url',
      count: 'abc',
      status: '',
      enabled: true,
      tags: [],
    })
    expect(result.success).toBe(false)
  })

  it('requires a non-empty string for required text', () => {
    const schema = zodSchemaFromFields([field.text('name', 'Nom', { required: true })])
    expect(schema.safeParse({ name: '' }).success).toBe(false)
    expect(schema.safeParse({ name: 'A' }).success).toBe(true)
  })

  it('requires a selection for required select', () => {
    const schema = zodSchemaFromFields([
      field.select('status', 'Statut', [{ label: 'Actif', value: 'ACTIVE' }], { required: true }),
    ])
    expect(schema.safeParse({ status: '' }).success).toBe(false)
    expect(schema.safeParse({ status: 'ACTIVE' }).success).toBe(true)
  })

  it('validates checklist as an array of strings', () => {
    const schema = zodSchemaFromFields([
      field.checklist('tags', 'Tags', [{ label: 'A', value: 'a' }], { required: true }),
    ])
    expect(schema.safeParse({ tags: [] }).success).toBe(false)
    expect(schema.safeParse({ tags: ['a'] }).success).toBe(true)
  })

  it('validates switch as a boolean', () => {
    const schema = zodSchemaFromFields([field.switchField('enabled', 'Activé', { required: true })])
    expect(schema.safeParse({ enabled: true }).success).toBe(true)
    expect(schema.safeParse({ enabled: 'yes' }).success).toBe(false)
  })

  it('coerces numbers from strings but rejects non-numeric values', () => {
    const schema = zodSchemaFromFields([field.number('count', 'Quantité', { required: true })])
    expect(schema.safeParse({ count: '3' }).success).toBe(true)
    expect(schema.safeParse({ count: 'abc' }).success).toBe(false)
  })

  it('accepts an empty string for an optional email but rejects malformed addresses', () => {
    const schema = zodSchemaFromFields([field.email('email', 'Email')])
    expect(schema.safeParse({ email: '' }).success).toBe(true)
    expect(schema.safeParse({ email: 'nope' }).success).toBe(false)
    expect(schema.safeParse({ email: 'a@b.co' }).success).toBe(true)
  })

  it('accepts an empty string for an optional url but rejects malformed urls', () => {
    const schema = zodSchemaFromFields([field.url('website', 'Site web')])
    expect(schema.safeParse({ website: '' }).success).toBe(true)
    expect(schema.safeParse({ website: 'nope' }).success).toBe(false)
    expect(schema.safeParse({ website: 'https://acme.example' }).success).toBe(true)
  })
})
