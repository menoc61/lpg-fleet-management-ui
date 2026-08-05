/**
 * Role → bespoke-screen registry.
 *
 * Uniform CRUD modules are rendered generically via `module/module-screen.tsx`
 * (driven by `config/modules/registry.ts`) and gated by `@lpg/permissions`.
 * This manifest is the single, explicit registry for the *bespoke* screens
 * that a role owns — the screens that are NOT a generic module view.
 *
 * Each entry declares the permission codes the active role must hold for
 * the screen to be mounted. The renderer in `custom-screens.tsx` calls
 * `hasPermission(role, code)` to gate registration dynamically.
 */

import {
  hasPermission,
  type PermissionCode,
  type Role,
} from '@lpg/permissions'
import { type Role as WebRole } from '@/config/rbac/roles'

import { PermissionMatrixScreen } from '@/module/permission-matrix'

import { AgentDeclarationsScreen } from '@/roles/agent/declarations-screen'
import { IntegrateurPdaScreen } from '@/roles/integrateur/pda-screen'
import { MarketeurDeliveryToursScreen } from '@/roles/marketeur/delivery-tours-screen'
import { MarketeurSupplyScreen } from '@/roles/marketeur/supply-screen'
import { SuperAdminOverviewScreen } from '@/roles/super-admin/overview-screen'
import { SuperAdminOrganizationsScreen } from '@/roles/super-admin/organizations-screen'
import { SuperAdminMapScreen } from '@/roles/super-admin/map-screen'
import { SuperAdminRiskDashboardScreen } from '@/roles/super-admin/risk-dashboard-screen'
import { SuperAdminCustomRolesScreen } from '@/roles/super-admin/custom-roles-screen'
import { SupervisorInfraScreen } from '@/roles/supervisor/infra-screen'
import { TransporteurOverviewScreen } from '@/roles/transporteur/overview-screen'
import { PickupsPage } from '@/features/pickups'

import { type CustomScreenComponent } from '@/module/custom-screens'

interface RoleScreenRegistration {
  module: string
  component: CustomScreenComponent
  requires: readonly PermissionCode[]
}

type BespokeCatalog = {
  readonly module: string
  readonly requires: readonly PermissionCode[]
  readonly component: CustomScreenComponent
}

/* --------------------------------------------------------------------------
 * CATALOG — single source of bespoke screens.
 * --------------------------------------------------------------------------*/

const BESPOKE_SCREENS: ReadonlyArray<BespokeCatalog> = [
  { module: 'overview', component: SuperAdminOverviewScreen, requires: ['reports.read'] },
  { module: 'organizations', component: SuperAdminOrganizationsScreen, requires: ['orgs.read'] },
  { module: 'map', component: SuperAdminMapScreen, requires: ['sites.read', 'tours.read'] },
  { module: 'risks', component: SuperAdminRiskDashboardScreen, requires: ['risks.read'] },
{ module: 'custom-roles', component: SuperAdminCustomRolesScreen, requires: ['custom-roles.manage'] },

  { module: 'permissions', component: PermissionMatrixScreen, requires: ['permissions.read'] },
  { module: 'infra', component: SupervisorInfraScreen, requires: ['metrics.read'] },
  { module: 'pda', component: IntegrateurPdaScreen, requires: ['pda.read'] },
  { module: 'declarations', component: AgentDeclarationsScreen, requires: ['declarations.read'] },
  { module: 'supply', component: MarketeurSupplyScreen, requires: ['pickups.create'] },
  { module: 'pickups', component: PickupsPage, requires: ['pickups.read'] },
  { module: 'delivery-tours', component: MarketeurDeliveryToursScreen, requires: ['tours.read'] },
  { module: 'transporteur-overview', component: TransporteurOverviewScreen, requires: ['tours.read'] },
] as const

/* --------------------------------------------------------------------------
 * Permission-driven registration
 *
 * Same shape as before — `buildCustomScreenRegistry()` returns a
 * `Record<\`${role}:${module}\`, Component>` — but its membership is
 * derived from `ROLE_GRANTS`, so reducing a role's grants automatically
 * hides the screen.
 * --------------------------------------------------------------------------*/

const ROLE_BESPOKE_BY_MODULE: Record<string, { role: WebRole; decl: BespokeCatalog }[]> = {
  overview: [
    { role: 'SUPERADMIN', decl: BESPOKE_SCREENS.find((s) => s.module === 'overview')! },
    { role: 'TRANSPORTEUR', decl: BESPOKE_SCREENS.find((s) => s.module === 'transporteur-overview')! },
  ],
  organizations: [{ role: 'SUPERADMIN', decl: BESPOKE_SCREENS.find((s) => s.module === 'organizations')! }],
  map: [{ role: 'SUPERADMIN', decl: BESPOKE_SCREENS.find((s) => s.module === 'map')! }],
  risks: [{ role: 'SUPERADMIN', decl: BESPOKE_SCREENS.find((s) => s.module === 'risks')! }],
  'custom-roles': [{ role: 'SUPERADMIN', decl: BESPOKE_SCREENS.find((s) => s.module === 'custom-roles')! }],
  permissions: [
    { role: 'SUPERADMIN', decl: BESPOKE_SCREENS.find((s) => s.module === 'permissions')! },
    { role: 'ADMIN', decl: BESPOKE_SCREENS.find((s) => s.module === 'permissions')! },
  ],
  infra: [{ role: 'SUPERVISOR', decl: BESPOKE_SCREENS.find((s) => s.module === 'infra')! }],
  pda: [{ role: 'INTEGRATEUR', decl: BESPOKE_SCREENS.find((s) => s.module === 'pda')! }],
  declarations: [{ role: 'AGENT', decl: BESPOKE_SCREENS.find((s) => s.module === 'declarations')! }],
  supply: [{ role: 'MARKETEUR', decl: BESPOKE_SCREENS.find((s) => s.module === 'supply')! }],
  pickups: [
    { role: 'SUPERADMIN', decl: BESPOKE_SCREENS.find((s) => s.module === 'pickups')! },
    { role: 'ADMIN', decl: BESPOKE_SCREENS.find((s) => s.module === 'pickups')! },
  ],
  'delivery-tours': [{ role: 'MARKETEUR', decl: BESPOKE_SCREENS.find((s) => s.module === 'delivery-tours')! }],
}

export function buildCustomScreenRegistry(): Record<string, CustomScreenComponent> {
  const registry: Record<string, CustomScreenComponent> = {}
  for (const [module, registrations] of Object.entries(ROLE_BESPOKE_BY_MODULE)) {
    for (const { role, decl } of registrations) {
      if (decl.requires.some((code) => hasPermission(role as Role, code))) {
        registry[`${role}:${module}`] = decl.component
      }
    }
  }
  return registry
}

/**
 * `ROLE_MANIFEST` retained for backward compatibility (existing
 * `role-dashboard.tsx` reads it). Each entry is the same data shape as
 * before but with the `requires` projection applied.
 */
export const ROLE_MANIFEST: Record<Role, RoleScreenRegistration[]> = (() => {
  const roleKeys: WebRole[] = ['SUPERADMIN', 'ADMIN', 'SUPERVISOR', 'INTEGRATEUR', 'AGENT', 'MARKETEUR', 'TRANSPORTEUR']
  const out: Partial<Record<Role, RoleScreenRegistration[]>> = {}
  for (const roleKey of roleKeys) {
    const entries: RoleScreenRegistration[] = []
    for (const [module, registrations] of Object.entries(ROLE_BESPOKE_BY_MODULE)) {
      for (const { role, decl } of registrations) {
        if (role === roleKey && decl.requires.some((code) => hasPermission(role as Role, code))) {
          entries.push({
            module,
            component: decl.component,
            requires: decl.requires,
          })
        }
      }
    }
    if (entries.length > 0) {
      out[roleKey] = entries
    }
  }
  return out as Record<Role, RoleScreenRegistration[]>
})()
