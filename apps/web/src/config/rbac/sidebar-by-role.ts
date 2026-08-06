/**
 * Role → sidebar routing.
 *
 * The actual sidebar content is now permission-driven: see
 * `./nav-items.ts`. This file only:
 *
 *   • maps a `Role` to a URL slug (single source for routing),
 *   • exposes `getSidebarData(role)` that delegates to
 *     `buildSidebarFor(role, roleSlug)`.
 *
 * No link labels, no icons, no permission codes are declared here — they
 * all live in `nav-items.ts`. Adding a nav item is a one-line change in one
 * file; the sidebar picks it up automatically once the role holds the
 * permission.
 */

import { ROLES, type Role } from '@lpg/permissions'
import type { SidebarData } from '@/components/layout/types'
import { buildSidebarFor, isWebRole } from './nav-items'

/**
 * URL slug per role. Live alongside the system roles in
 * `@lpg/permissions` so the same source of truth governs both routing and
 * permission grants.
 */
const SLUG_BY_ROLE: Record<Role, string> = {
  SUPERADMIN: 'super-admin',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  INTEGRATEUR: 'integrateur',
  AGENT: 'agent',
  MARKETEUR: 'marketers',
  TRANSPORTEUR: 'transporters',
  LIVREUR: 'livreur',
}

export const ROLE_SLUGS = SLUG_BY_ROLE

export function roleSlug(role: Role): string {
  return SLUG_BY_ROLE[role]
}

export function roleFromSlug(slug: string): Role | undefined {
  return (Object.keys(SLUG_BY_ROLE) as Role[]).find((r) => SLUG_BY_ROLE[r] === slug)
}

/**
 * Roles that should appear in the web UI's role switcher / sidebar.
 * (LIVREUR is PDA-only — no web sidebar.)
 */
export const WEB_ROLE_SLUGS: ReadonlyArray<{ role: Role; slug: string }> = ROLES.filter(isWebRole).map((role) => ({
  role,
  slug: SLUG_BY_ROLE[role],
}))

/** Delegates entirely to the permission-driven projection. */
export function getSidebarData(role: Role): SidebarData {
  return buildSidebarFor(role, SLUG_BY_ROLE[role])
}