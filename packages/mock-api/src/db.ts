import organizations from './seed/organizations.json'
import usersSeed from './seed/users.json'
import sites from './seed/sites.json'
import trucks from './seed/trucks.json'
import tours from './seed/tours.json'
import declarations from './seed/declarations.json'
import anomalies from './seed/anomalies.json'
import reports from './seed/reports.json'
import pda from './seed/pda.json'
import infra from './seed/infra.json'
import { AUTH_FIXTURES } from './fixtures/auth.ts'
import type { EntityMap, EntityName } from './types.ts'

type Collections = { [K in EntityName]: EntityMap[K][] }

const users = usersSeed.map((u) => {
  const fixture = AUTH_FIXTURES.find((f) => f.id === u.id)!
  return { ...u, password: fixture.password }
})

export const collections: Collections = {
  organizations: organizations as EntityMap['organizations'][],
  users: users as EntityMap['users'][],
  sites: sites as EntityMap['sites'][],
  trucks: trucks as EntityMap['trucks'][],
  tours: tours as EntityMap['tours'][],
  declarations: declarations as EntityMap['declarations'][],
  anomalies: anomalies as EntityMap['anomalies'][],
  reports: reports as EntityMap['reports'][],
  pda: pda as EntityMap['pda'][],
  infra: infra as EntityMap['infra'][],
}

export interface ListResult<T> {
  data: T[]
  pagination: { page: number; limite: number; total: number }
}

export function listEntities<T>(name: EntityName, opts: { page?: number; limite?: number } = {}): ListResult<T> {
  const items = collections[name] as unknown as T[]
  const page = Math.max(1, opts.page ?? 1)
  const limite = Math.min(100, Math.max(1, opts.limite ?? 20))
  const start = (page - 1) * limite
  const data = items.slice(start, start + limite)
  return { data, pagination: { page, limite, total: items.length } }
}

export function getEntity<T>(name: EntityName, id: string): T | undefined {
  return (collections[name] as unknown as T[]).find((x: any) => x.id === id)
}

export function createEntity<T extends { id: string }>(name: EntityName, body: Omit<T, 'id'>): T {
  const item = { ...(body as object), id: `${name.slice(0, 3)}-${Date.now()}` } as unknown as T
  ;(collections[name] as unknown as T[]).push(item)
  return item
}

export function updateEntity<T extends { id: string }>(name: EntityName, id: string, body: Partial<T>): T | undefined {
  const arr = collections[name] as unknown as T[]
  const idx = arr.findIndex((x) => x.id === id)
  if (idx === -1) return undefined
  arr[idx] = { ...arr[idx], ...body }
  return arr[idx]
}

export function deleteEntity(name: EntityName, id: string): boolean {
  const arr = collections[name] as unknown as any[]
  const idx = arr.findIndex((x) => x.id === id)
  if (idx === -1) return false
  arr.splice(idx, 1)
  return true
}
