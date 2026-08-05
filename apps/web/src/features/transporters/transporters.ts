import { curated } from '@lpg/mock-data'
import type { Organization } from '@lpg/types'

export const transporterStatusOptions = [
  { label: 'Actif', value: 'active' },
  { label: 'Inactif', value: 'inactive' },
] as const

export function getTransporters(): Organization[] {
  const orgs = curated.organizations as Organization[]
  return orgs.filter((o) => o.type === 'TRANSPORTEUR')
}

export const transporters: Organization[] = getTransporters()

export function getTransporterById(id: string): Organization | undefined {
  return transporters.find((t) => t.id === id)
}