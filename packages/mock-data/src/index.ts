import sites from './seed/sites.json'
import trucks from './seed/trucks.json'
import tours from './seed/tours.json'
import declarations from './seed/declarations.json'
import anomalies from './seed/anomalies.json'
import reports from './seed/reports.json'
import pda from './seed/pda.json'
import infra from './seed/infra.json'
import organizations from './seed/organizations.json'
import users from './seed/users.json'
import transporters from './seed/transporters.json'
import { AUTH_FIXTURES } from './fixtures-auth.ts'

export type SeedName =
  | 'sites'
  | 'trucks'
  | 'tours'
  | 'declarations'
  | 'anomalies'
  | 'reports'
  | 'pda'
  | 'infra'
  | 'organizations'
  | 'users'
  | 'transporters'

/** Raw seed arrays, keyed by resource name. Shared by the Express mock server
 *  and the in-browser fake adapter so both stay in lock-step with @lpg/types. */
export const seeds: Record<SeedName, unknown[]> = {
  sites,
  trucks,
  tours,
  declarations,
  anomalies,
  reports,
  pda,
  infra,
  organizations,
  users,
  transporters,
}

export { AUTH_FIXTURES }

/** Demo profiles for the in-browser fake login (no password required). */
export interface FakeProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'INTEGRATEUR' | 'AGENT' | 'MARKETEUR' | 'LIVREUR'
}

export const fakeProfiles: FakeProfile[] = AUTH_FIXTURES.map((f) => ({
  id: f.id,
  email: f.email,
  firstName: f.firstName,
  lastName: f.lastName,
  role: f.role,
}))
