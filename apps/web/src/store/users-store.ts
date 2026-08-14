import { create } from 'zustand'
import { curated } from '@lpg/mock-data'
import { getCreatableRoles } from '@lpg/permissions'
import type { Role, User as CuratedUser } from '@lpg/types'
import { getScope } from '@/features/scope/scope'
import { useAuthStore } from '@/store/auth-store'

export type UserPatch = Partial<Pick<CuratedUser,
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'system_role'
  | 'org_id'
  | 'is_active'
>>

interface UsersState {
  users: CuratedUser[]
  createUser: (user: Omit<CuratedUser, 'id' | 'created_at' | 'updated_at'>) => void
  updateUser: (id: string, patch: UserPatch) => void
  setStatus: (id: string, active: boolean) => void
  deleteUser: (id: string) => void
  resetPassword: (id: string) => void
  lockUntil: (id: string, iso?: string | null) => void
  unlock: (id: string) => void
}

export const useUsersStore = create<UsersState>()((set, get) => ({
  users: (curated.users as CuratedUser[]).map((u) => ({ ...u })),

  createUser(user) {
    // Defense in depth: the sheet already restricts the role select via
    // getCreatableRoles, but a direct store call must be gated too. A creator
    // may only create roles at or below their own hierarchy level, and a
    // non-REGULATEUR (MARKETEUR/TRANSPORTEUR/AGENT/LIVREUR) may only create
    // users inside their own org.
    const authUser = useAuthStore.getState().user
    const role = (authUser?.system_role ?? 'LIVREUR') as Role
    const creatable = getCreatableRoles(role)
    if (!creatable.includes(user.system_role)) {
      throw new Error('Impossible de créer ce rôle depuis le rôle courant.')
    }
    const scope = getScope(authUser)
    if (scope.view !== 'org' && user.org_id && user.org_id !== scope.orgId) {
      throw new Error('Accès refusé.')
    }
    const id = `user-${crypto.randomUUID().slice(0, 8)}`
    const now = new Date().toISOString()
    set((s) => ({
      users: [{ ...user, id, created_at: now, updated_at: now } as CuratedUser, ...s.users],
    }))
  },

  updateUser(id, patch) {
    const authUser = useAuthStore.getState().user
    const role = (authUser?.system_role ?? 'LIVREUR') as Role
    const creatable = getCreatableRoles(role)
    if (patch.system_role && !creatable.includes(patch.system_role)) {
      throw new Error('Impossible de créer ce rôle depuis le rôle courant.')
    }
    const scope = getScope(authUser)
    if (scope.view !== 'org' && patch.org_id && patch.org_id !== scope.orgId) {
      throw new Error('Accès refusé.')
    }
    set((s) => ({
      users: s.users.map((u) =>
        u.id === id ? { ...u, ...patch } : u,
      ),
    }))
  },

  setStatus(id, active) {
    set((s) => ({
      users: s.users.map((u) =>
        u.id === id ? { ...u, is_active: active } : u,
      ),
    }))
  },

  deleteUser(id) {
    set((s) => ({
      users: s.users.filter((u) => u.id !== id),
    }))
  },

  resetPassword(id) {
    const u = get().users.find((x) => x.id === id)
    if (!u) return
  },

  lockUntil(id, iso) {
    const stamp = iso ?? new Date(Date.now() + 15 * 60 * 1000).toISOString()
    set((s) => ({
      users: s.users.map((u) =>
        u.id === id ? { ...u, locked_until: stamp } : u,
      ),
    }))
  },

  unlock(id) {
    set((s) => ({
      users: s.users.map((u) =>
        u.id === id ? { ...u, locked_until: null } : u,
      ),
    }))
  },
}))

export function listOrgsForRole(role: Role): string[] {
  const seen = new Set<string>()
  for (const u of useUsersStore.getState().users) {
    if (u.system_role === role && u.org_id) seen.add(u.org_id)
  }
  return [...seen]
}
