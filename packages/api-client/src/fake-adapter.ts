/**
 * In-browser fake backend. No network, no server: data comes from curated
 * fixtures and login just selects a demo profile by email (password ignored).
 * Used on static hosts (Vercel) where the Express mock server cannot run.
 * Swap to real backend by setting VITE_API_MODE.
 */

import { curated, AUTH_FIXTURES } from '@lpg/mock-data'
import type { ApiAdapter, AuthResult, Credentials, ListResult } from './adapter.ts'

function paginate<T>(items: T[], page = 1, limit = 20): ListResult<T> {
  const safePage = Math.max(1, page)
  const safeLimit = Math.min(100, Math.max(1, limit))
  const start = (safePage - 1) * safeLimit
  const total = items.length
  return {
    data: items.slice(start, start + safeLimit),
    pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
  }
}

function delay<T>(value: T, ms = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function fakeToken(profileId: string): string {
  return `fake.${profileId}.${Date.now()}`
}

const COLLECTIONS: Record<string, unknown[]> = {
  regions: curated.regions,
  organizations: curated.organizations,
  system_roles: curated.system_roles,
  permissions: curated.permissions,
  users: curated.users,
  user_mfa: curated.user_mfa,
  integration_auth: curated.integration_auth,
  sites: curated.sites,
  clients: curated.clients,
  client_sites: curated.client_sites,
  vehicles: curated.vehicles,
  drivers: curated.drivers,
  devices: curated.devices,
  transporter_contracts: curated.transporter_contracts,
  pickup_requests: curated.pickup_requests,
  delivery_tours: curated.delivery_tours,
  checkpoints: curated.checkpoints,
  scan_events: curated.scan_events,
  declarations: curated.declarations,
  reconciliations: curated.reconciliations,
  redressements: curated.redressements,
  risk_scores: curated.risk_scores,
  anomalies: curated.anomalies,
  anomaly_assignments: curated.anomaly_assignments,
  notification_groups: curated.notification_groups,
  notification_group_members: curated.notification_group_members,
  notification_rules: curated.notification_rules,
  notifications: curated.notifications,
  rfid_tags: (curated as any).rfid_tags ?? [],
  user_site_assignments: (curated as any).user_site_assignments ?? [],
  custom_roles: (curated as any).custom_roles ?? [],
  user_custom_roles: (curated as any).user_custom_roles ?? [],
  reports: [],
  audit_logs: [],
  settings: [],
}

export function createFakeAdapter(): ApiAdapter {
  return {
    async request<T>(path: string): Promise<T> {
      const match = path.match(/^\/([a-z-]+)(?:\/([^?]+))?/i)
      const name = match?.[1]
      const id = match?.[2]
      if (name && id && COLLECTIONS[name]) {
        const item = (COLLECTIONS[name] as any[]).find((x) => x.id === id)
        if (!item) throw new Error('Introuvable')
        return delay(item) as Promise<T>
      }
      if (name === 'me') return delay(null as unknown as T)
      throw new Error(`Fake adapter: unsupported path ${path}`)
    },

    async requestList<T>(path: string): Promise<ListResult<T>> {
      const match = path.match(/^\/([a-z-]+)/i)
      const name = match?.[1]
      if (!name || !COLLECTIONS[name]) throw new Error(`Fake adapter: unknown resource ${name}`)
      const items = COLLECTIONS[name] as T[]
      const qs = path.includes('?') ? path.slice(path.indexOf('?') + 1) : ''
      const params = new URLSearchParams(qs)
      const page = Number(params.get('page') ?? 1)
      const limit = Number(params.get('limit') ?? 20)
      return delay(paginate(items, page, limit))
    },

    async login(creds: Credentials): Promise<AuthResult> {
      const fixture = AUTH_FIXTURES.find((f) => f.email === creds.email) ?? AUTH_FIXTURES[0]
      return delay({
        access_token: fakeToken(fixture.id),
        refresh_token: fakeToken(fixture.id),
        user: {
          id: fixture.id,
          email: fixture.email,
          first_name: fixture.first_name,
          last_name: fixture.last_name,
          system_role: fixture.system_role as any,
        },
      })
    },

    async refresh(): Promise<AuthResult> {
      throw new Error('Fake adapter: refresh not supported')
    },

    setAccessTokenGetter(): void {},
    setOnUnauthorized(): void {},
  }
}

export const fakeAdapter = createFakeAdapter()