import { describe, expect, it } from 'vitest'
import { organizationFields, organizationFromForm } from './organizations-crud'

describe('organizations-crud config', () => {
  it('requires name and type', () => {
    expect(organizationFields.find((f) => f.name === 'name')?.required).toBe(true)
    expect(organizationFields.find((f) => f.name === 'type')?.required).toBe(true)
  })
  it('locks org type from the form', () => {
    const out = organizationFromForm({ name: 'X', type: 'DEPOT', is_active: true })
    expect(out.type).toBe('DEPOT')
  })
})
