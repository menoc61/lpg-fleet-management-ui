import {
  ROLES as ALL_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  type Role as AllRole,
} from '@lpg/permissions'

/**
 * Web-facing roles.
 *
 * LIVREUR (PDA mobile app) is a data-layer role with grants in the permission
 * matrix, but has no web interface — so it is deliberately excluded here. This
 * keeps every web `Record<Role, …>` exhaustive over the 7 web roles with zero
 * LIVREUR UI (login picker, sidebar, dashboard, manifest, role switcher).
 */
export type Role = Exclude<AllRole, 'LIVREUR'>

export const ROLES = ALL_ROLES.filter((r): r is Role => r !== 'LIVREUR')

export { ROLE_LABELS, ROLE_DESCRIPTIONS }