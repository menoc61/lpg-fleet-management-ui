/**
 * Role → bespoke-screen contract.
 *
 * Uniform CRUD modules are rendered generically via `module/module-screen.tsx`
 * (driven by `config/modules/registry.ts`) and gated by `@lpg/permissions`.
 * This manifest is the single, explicit registry for the *bespoke* screens that
 * a role owns — the screens that are NOT a generic module view.
 *
 * Each role may register one screen per module key (e.g. `TRANSPORTEUR:tours`).
 * `module/custom-screens.tsx` consumes this manifest at runtime.
 */
import { type Role } from '@/config/rbac/roles'

import { PermissionMatrixScreen } from '@/module/permission-matrix'

import { AgentDeclarationsScreen } from '@/roles/agent/declarations-screen'
import { IntegrateurPdaScreen } from '@/roles/integrateur/pda-screen'
import { MarketeurDeliveryToursScreen } from '@/roles/marketeur/delivery-tours-screen'
import { MarketeurSupplyScreen } from '@/roles/marketeur/supply-screen'
import { SuperAdminOverviewScreen } from '@/roles/super-admin/overview-screen'
import { SuperAdminOrganizationsScreen } from '@/roles/super-admin/organizations-screen'
import { SuperAdminTransportersScreen } from '@/roles/super-admin/transporters-screen'
import { SuperAdminMapScreen } from '@/roles/super-admin/map-screen'
import { SuperAdminRiskDashboardScreen } from '@/roles/super-admin/risk-dashboard-screen'
import { SuperAdminCustomRolesScreen } from '@/roles/super-admin/custom-roles-screen'
import { SupervisorInfraScreen } from '@/roles/supervisor/infra-screen'
import { TransporteurOverviewScreen } from '@/roles/transporteur/overview-screen'

import { type CustomScreenComponent } from '@/module/custom-screens'

type ScreenRegistration = {
  file: string
  component: CustomScreenComponent
  modules: string[]
}

export const ROLE_MANIFEST: Record<Role, ScreenRegistration[]> = {
  SUPERADMIN: [
    {
      file: 'roles/super-admin/overview-screen.tsx',
      component: SuperAdminOverviewScreen,
      modules: ['overview'],
    },
    {
      file: 'roles/super-admin/organizations-screen.tsx',
      component: SuperAdminOrganizationsScreen,
      modules: ['organizations'],
    },
    {
      file: 'roles/super-admin/transporters-screen.tsx',
      component: SuperAdminTransportersScreen,
      modules: ['transporters'],
    },
    {
      file: 'roles/super-admin/map-screen.tsx',
      component: SuperAdminMapScreen,
      modules: ['map'],
    },
    {
      file: 'roles/super-admin/risk-dashboard-screen.tsx',
      component: SuperAdminRiskDashboardScreen,
      modules: ['risks'],
    },
    {
      file: 'roles/super-admin/custom-roles-screen.tsx',
      component: SuperAdminCustomRolesScreen,
      modules: ['custom-roles'],
    },
    {
      file: 'module/permission-matrix.tsx',
      component: PermissionMatrixScreen,
      modules: ['permissions'],
    },
  ],
  ADMIN: [
    {
      file: 'module/permission-matrix.tsx',
      component: PermissionMatrixScreen,
      modules: ['permissions'],
    },
  ],
  SUPERVISOR: [
    {
      file: 'roles/supervisor/infra-screen.tsx',
      component: SupervisorInfraScreen,
      modules: ['infra'],
    },
  ],
  INTEGRATEUR: [
    {
      file: 'roles/integrateur/pda-screen.tsx',
      component: IntegrateurPdaScreen,
      modules: ['pda'],
    },
  ],
  AGENT: [
    {
      file: 'roles/agent/declarations-screen.tsx',
      component: AgentDeclarationsScreen,
      modules: ['declarations'],
    },
  ],
  MARKETEUR: [
    {
      file: 'roles/marketeur/supply-screen.tsx',
      component: MarketeurSupplyScreen,
      modules: ['supply'],
    },
    {
      file: 'roles/marketeur/delivery-tours-screen.tsx',
      component: MarketeurDeliveryToursScreen,
      modules: ['delivery-tours'],
    },
  ],
  TRANSPORTEUR: [
    {
      file: 'roles/transporteur/overview-screen.tsx',
      component: TransporteurOverviewScreen,
      modules: ['overview'],
    },
  ],
}

export function buildCustomScreenRegistry(): Record<string, CustomScreenComponent> {
  const registry: Record<string, CustomScreenComponent> = {}
  for (const [role, registrations] of Object.entries(ROLE_MANIFEST)) {
    for (const reg of registrations) {
      for (const module of reg.modules) {
        registry[`${role}:${module}`] = reg.component
      }
    }
  }
  return registry
}
