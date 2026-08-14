import type { UserScope } from './scope'

export function scopeBySiteOrCreator<T>(
  rows: T[],
  scope: UserScope,
  siteKey: (row: T) => string | undefined,
  creatorKey: (row: T) => string | undefined,
): T[] {
  if (scope.view === 'org') return rows
  const siteSet = new Set(scope.siteIds)
  return rows.filter(
    (row) =>
      siteSet.has(siteKey(row) ?? '') ||
      (scope.userId !== undefined && creatorKey(row) === scope.userId),
  )
}

/**
 * Extend a scope's site set with the user's org id so that rows keyed by an
 * org id (e.g. `marketeur_org_id`, `transporter_org_id`, `org_id`) match the
 * user's own organisation, not just their assigned sites.
 */
export function scopeWithOrgId(scope: UserScope): UserScope {
  if (scope.view === 'org' || scope.orgId === undefined) return scope
  if (scope.siteIds.includes(scope.orgId)) return scope
  return { ...scope, siteIds: [...scope.siteIds, scope.orgId] }
}
