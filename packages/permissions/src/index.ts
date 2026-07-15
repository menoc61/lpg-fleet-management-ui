import { type Role } from '@lpg/types'
import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from '@casl/ability'

/** Actions a role can perform on a resource. */
export type Action = 'read' | 'write' | 'delete' | 'validate' | 'reset'

export type Resource =
  | 'organizations'
  | 'users'
  | 'sites'
  | 'trucks'
  | 'tours'
  | 'declarations'
  | 'anomalies'
  | 'reports'
  | 'pda'
  | 'infra'

export type AppAbility = MongoAbility<[Action, Resource]>

/** Coarse RBAC matrix: role -> allowed (action, resource) pairs. */
export const ROLE_PERMISSIONS: Record<Role, Array<[Action, Resource]>> = {
  SUPER_ADMIN: [
    ['read', 'organizations'],
    ['write', 'organizations'],
    ['read', 'users'],
    ['write', 'users'],
    ['read', 'sites'],
    ['read', 'trucks'],
    ['read', 'tours'],
    ['read', 'declarations'],
    ['read', 'anomalies'],
    ['read', 'reports'],
    ['read', 'infra'],
    ['read', 'pda'],
  ],
  ADMIN: [
    ['read', 'users'],
    ['write', 'users'],
    ['read', 'organizations'],
    ['read', 'declarations'],
    ['validate', 'declarations'],
    ['read', 'reports'],
    ['read', 'anomalies'],
    ['read', 'sites'],
  ],
  SUPERVISOR: [
    ['read', 'infra'],
    ['read', 'pda'],
    ['read', 'trucks'],
    ['read', 'anomalies'],
  ],
  INTEGRATEUR: [
    ['read', 'pda'],
    ['write', 'pda'],
    ['read', 'trucks'],
  ],
  AGENT: [
    ['read', 'declarations'],
    ['validate', 'declarations'],
    ['reset', 'users'],
    ['read', 'users'],
    ['read', 'anomalies'],
  ],
  MARKETEUR: [
    ['read', 'trucks'],
    ['write', 'trucks'],
    ['read', 'tours'],
    ['write', 'tours'],
    ['read', 'reports'],
  ],
  LIVREUR: [
    ['read', 'tours'],
    ['write', 'tours'],
    ['read', 'pda'],
  ],
}

export function defineAbilityFor(role: Role): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)
  for (const [action, resource] of ROLE_PERMISSIONS[role]) {
    can(action, resource)
  }
  return build()
}

/** App-facing alias; `GUEST` yields an empty (no-access) ability. */
export function defineAbilitiesFor(role: Role | 'GUEST'): AppAbility {
  if (role === 'GUEST') return createMongoAbility([])
  return defineAbilityFor(role)
}

export function can(role: Role, action: Action, resource: Resource): boolean {
  return defineAbilityFor(role).can(action, resource)
}

/** Canonical, ordered list of every platform role. */
export const ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'SUPERVISOR',
  'INTEGRATEUR',
  'AGENT',
  'MARKETEUR',
  'LIVREUR',
] as const

/** Human-readable labels (French) shown across the UI. */
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  SUPERVISOR: 'Superviseur',
  INTEGRATEUR: 'Intégrateur',
  AGENT: 'Agent validateur',
  MARKETEUR: 'Marketeur',
  LIVREUR: 'Livreur',
}

/** Short descriptions of each role's mandate. */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN: 'Supervision totale — carte ultra-détaillée, tous modules',
  ADMIN: 'Staff CSPH / RH — gestion utilisateurs, agents, marketeurs, rapports',
  SUPERVISOR: 'DevOps / monitoring — Prometheus, Grafana, alertes, scores de risque',
  INTEGRATEUR:
    'Spécialiste domaine — activation, authentification, maintenance matériel PDA+GPS+RFID',
  AGENT: 'Validateur terrain — suivi marketeurs, reset passwords, validation déclarations',
  MARKETEUR:
    'Société pétrolière — flotte, tournées, quotas, chauffeurs, règles personnalisées',
  LIVREUR: 'Chauffeur livreur — scan bouteilles (vide/plein) via PDA, missions de tournée',
}

export type { Role } from '@lpg/types'
