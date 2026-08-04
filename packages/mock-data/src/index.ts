/**
 * @lpg/mock-data — single source of truth for the entire system.
 *
 * Data lives in `seed/curated/*.json` (snake_case, mirrors the production
 * Postgres schema). This package exposes only that curated data plus pure
 * analytics selectors. There is no second source of mock data.
 */

export { curated } from './curated.ts'
export type {
  Region,
  Organization,
  SystemRole,
  Permission,
  User,
  Site,
  Client,
  ClientSite,
  Vehicle,
  Driver,
  Device,
  TransporterContract,
  PickupRequest,
  DeliveryTour,
  Checkpoint,
  ScanEvent,
  Declaration,
  Reconciliation,
  Redressement,
  RiskScore,
  Anomaly,
  AnomalyAssignment,
  NotificationGroup,
  NotificationGroupMember,
  NotificationRule,
  Notification,
  CuratedFixtures,
} from './curated.ts'

export * from './analytics.ts'

import { curated } from './curated.ts'

export interface AuthFixture {
  id: string
  email: string
  first_name: string
  last_name: string
  system_role: string
  password: string
}

export const AUTH_FIXTURES: AuthFixture[] = curated.users.map((u) => ({
  id: u.id,
  email: u.email,
  first_name: u.first_name,
  last_name: u.last_name,
  system_role: u.system_role,
  password: 'password',
}))

export interface FakeProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  system_role: string
}

export const fakeProfiles: FakeProfile[] = AUTH_FIXTURES.map((f) => ({
  id: f.id,
  email: f.email,
  first_name: f.first_name,
  last_name: f.last_name,
  system_role: f.system_role,
}))