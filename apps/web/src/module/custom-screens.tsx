import { type Role } from '@/config/rbac/roles'

import { buildCustomScreenRegistry } from '@/roles/manifest'

export type CustomScreenComponent = React.ComponentType

const registry = buildCustomScreenRegistry()

export function registerCustomScreen(
  role: Role,
  module: string,
  component: CustomScreenComponent
) {
  registry[`${role}:${module}`] = component
}

export function getCustomScreen(
  role: Role,
  module: string
): CustomScreenComponent | undefined {
  return registry[`${role}:${module}`]
}
