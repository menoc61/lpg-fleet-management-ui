import { describe, expect, it } from 'vitest'
import {
  getActiveCustomRoleCount,
  getCustomRoleAssignmentCount,
  getCustomRoles,
} from './custom-roles'

describe('custom-roles view-model', () => {
  it('lists custom roles with permission counts', () => {
    const roles = getCustomRoles()
    expect(roles.length).toBeGreaterThanOrEqual(1)
    for (const role of roles) {
      expect(role.name).toBeTruthy()
      expect(role.permissionCount).toBeGreaterThanOrEqual(1)
      expect(role.permissions).toHaveLength(role.permissionCount)
      expect(role.orgName).toBeTruthy()
    }
  })

  it('resolves member counts from assignments', () => {
    const roles = getCustomRoles()
    const totalAssignments = roles.reduce((acc, r) => acc + r.memberCount, 0)
    expect(totalAssignments).toBe(getCustomRoleAssignmentCount())
  })

  it('tracks active roles', () => {
    expect(getActiveCustomRoleCount()).toBe(getCustomRoles().filter((r) => r.isActive).length)
  })
})