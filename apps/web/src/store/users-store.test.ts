import { describe, expect, it, beforeEach } from 'vitest'
import { useUsersStore } from './users-store'
import { curated } from '@lpg/mock-data'

const USER_FIXTURE_ID = 'user-0001-csph-super'
const USER_FIXTURE_EMAIL = 'b.ndoumbetane@csph.cm'
const USER_ACTIVE_ID = 'user-0007-sctm-marketeur'

function freshSeed() {
  return {
    users: (curated.users as ReturnType<typeof useUsersStore.getState>['users']).map(
      (u) => ({ ...u }),
    ),
  }
}

describe('users store', () => {
  beforeEach(() => {
    useUsersStore.setState(freshSeed())
  })

  it('seeds with the curated users', () => {
    expect(useUsersStore.getState().users.length).toBe(curated.users.length)
  })

  it('does not mutate the shared curated fixture on init', () => {
    const first = curated.users[0]
    if (!first) throw new Error('expected curated.users[0] to exist')
    const idBefore = first.id
    useUsersStore.getState().updateUser(idBefore, { email: 'x@y.z' })
    expect(curated.users[0]?.id).toBe(idBefore)
    expect(curated.users[0]?.email).not.toBe('x@y.z')
  })

  describe('updateUser', () => {
    it('patches only the specified fields', () => {
      const before = useUsersStore.getState().users.find((u) => u.id === USER_FIXTURE_ID)
      useUsersStore.getState().updateUser(USER_FIXTURE_ID, {
        email: 'new@example.cm',
      })
      const after = useUsersStore.getState().users.find((u) => u.id === USER_FIXTURE_ID)
      expect(after?.email).toBe('new@example.cm')
      expect(after?.first_name).toBe(before?.first_name)
      expect(after?.last_name).toBe(before?.last_name)
      expect(after?.system_role).toBe(before?.system_role)
    })

    it('does nothing when the id does not exist', () => {
      const lenBefore = useUsersStore.getState().users.length
      useUsersStore.getState().updateUser('does-not-exist', { email: 'x@y.z' })
      expect(useUsersStore.getState().users.length).toBe(lenBefore)
    })
  })

  describe('setStatus', () => {
    it('flips is_active to false', () => {
      useUsersStore.getState().setStatus(USER_ACTIVE_ID, false)
      const u = useUsersStore.getState().users.find((x) => x.id === USER_ACTIVE_ID)
      expect(u?.is_active).toBe(false)
    })

    it('flips is_active back to true', () => {
      useUsersStore.getState().setStatus(USER_ACTIVE_ID, false)
      useUsersStore.getState().setStatus(USER_ACTIVE_ID, true)
      const u = useUsersStore.getState().users.find((x) => x.id === USER_ACTIVE_ID)
      expect(u?.is_active).toBe(true)
    })
  })

  describe('deleteUser', () => {
    it('removes the row', () => {
      const lenBefore = useUsersStore.getState().users.length
      useUsersStore.getState().deleteUser(USER_FIXTURE_ID)
      const lenAfter = useUsersStore.getState().users.length
      expect(lenAfter).toBe(lenBefore - 1)
      expect(
        useUsersStore.getState().users.find((u) => u.id === USER_FIXTURE_ID),
      ).toBeUndefined()
    })

    it('does nothing on a missing id', () => {
      const lenBefore = useUsersStore.getState().users.length
      useUsersStore.getState().deleteUser('does-not-exist')
      expect(useUsersStore.getState().users.length).toBe(lenBefore)
    })
  })

  describe('resetPassword', () => {
    it('does not mutate the user row (acked via toast at the UI layer)', () => {
      const before = useUsersStore.getState().users.find((u) => u.id === USER_FIXTURE_ID)
      useUsersStore.getState().resetPassword(USER_FIXTURE_ID)
      const after = useUsersStore.getState().users.find((u) => u.id === USER_FIXTURE_ID)
      expect(after).toEqual(before)
    })
  })

  describe('lockUntil / unlock', () => {
    it('sets locked_until to a future iso when no arg passed', () => {
      useUsersStore.getState().lockUntil(USER_FIXTURE_ID)
      const u = useUsersStore.getState().users.find((x) => x.id === USER_FIXTURE_ID)
      expect(u?.locked_until).not.toBeNull()
      expect(typeof u?.locked_until).toBe('string')
    })

    it('sets a custom iso and unlock clears it back to null', () => {
      const stamp = '2030-01-01T00:00:00Z'
      useUsersStore.getState().lockUntil(USER_FIXTURE_ID, stamp)
      const locked = useUsersStore.getState().users.find((x) => x.id === USER_FIXTURE_ID)
      expect(locked?.locked_until).toBe(stamp)
      useUsersStore.getState().unlock(USER_FIXTURE_ID)
      const freed = useUsersStore.getState().users.find((x) => x.id === USER_FIXTURE_ID)
      expect(freed?.locked_until).toBeNull()
    })
  })

  describe('multi-mutation shape', () => {
    it('after update + status-flip + lock, only the targeted row changed', () => {
      const othersBefore = useUsersStore
        .getState()
        .users.filter((u) => u.id !== USER_FIXTURE_ID)
        .map((u) => ({ id: u.id, email: u.email, is_active: u.is_active, locked_until: u.locked_until }))

      useUsersStore.getState().updateUser(USER_FIXTURE_ID, { email: 'locked@example.cm' })
      useUsersStore.getState().setStatus(USER_FIXTURE_ID, false)
      useUsersStore.getState().lockUntil(USER_FIXTURE_ID, '2030-12-31T00:00:00Z')

      const othersAfter = useUsersStore
        .getState()
        .users.filter((u) => u.id !== USER_FIXTURE_ID)
        .map((u) => ({ id: u.id, email: u.email, is_active: u.is_active, locked_until: u.locked_until }))

      expect(othersAfter).toEqual(othersBefore)

      const target = useUsersStore.getState().users.find((u) => u.id === USER_FIXTURE_ID)
      expect(target?.email).toBe('locked@example.cm')
      expect(target?.is_active).toBe(false)
      expect(target?.locked_until).toBe('2030-12-31T00:00:00Z')
    })
  })
})

describe('users store fixture id sanity', () => {
  it('fixture ids exist in curated.users', () => {
    const ids = new Set(curated.users.map((u) => u.id))
    expect(ids.has(USER_FIXTURE_ID)).toBe(true)
    expect(ids.has(USER_ACTIVE_ID)).toBe(true)
  })

  it('fixture email matches seed', () => {
    const u = curated.users.find((u) => u.id === USER_FIXTURE_ID)
    expect(u?.email).toBe(USER_FIXTURE_EMAIL)
  })
})
