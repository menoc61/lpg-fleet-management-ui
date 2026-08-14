import { describe, expect, it, beforeEach } from 'vitest'
import { usePickupsStore } from './pickups-store'
import { useAuthStore } from './auth-store'
import { PERMISSION_DENIED } from '@/lib/security/guards'
import { curated } from '@lpg/mock-data'

const MARKETEUR_ORG = 'org-0002-sctm-0000-000000000001'
const SOURCE_SITE = 'site-0030-scdp-garoua'
const DEST_SITE = 'site-0004-sctm-garoua'

const SUPERADMIN_USER = {
  id: 'u-super',
  email: 's@csph.cm',
  first_name: 'S',
  last_name: 'A',
  system_role: 'SUPERADMIN' as const,
  org_type: 'REGULATEUR' as const,
  site_ids: [] as string[],
}

function setAuthUser(system_role: 'SUPERADMIN' | 'AGENT' | 'MARKETEUR', site_ids: string[] = []) {
  const org_type =
    system_role === 'MARKETEUR' ? ('MARKETEUR' as const) : ('REGULATEUR' as const)
  useAuthStore.setState({
    user: { ...SUPERADMIN_USER, id: `u-${system_role.toLowerCase()}`, system_role, org_type, site_ids },
  })
}

function freshSeed() {
  return {
    pickups: curated.pickup_requests.map((p) => ({ ...p })),
  }
}

describe('pickups store', () => {
  beforeEach(() => {
    usePickupsStore.setState(freshSeed())
    // Guards read the live auth state: a SUPERADMIN clears every permission
    // check so the mutation tests exercise the business logic, not the guard.
    setAuthUser('SUPERADMIN')
  })

  it('seeds with the curated pickup requests', () => {
    expect(usePickupsStore.getState().all().length).toBe(curated.pickup_requests.length)
  })

  describe('permission guards', () => {
    it('throws PERMISSION_DENIED for createPickup when the role lacks pickups.create', () => {
      // AGENT holds no pickups.* grants (packages/permissions AGENT_GRANTS); it
      // is genuinely denied pickups.create, unlike MARKETEUR whose pickups.write
      // implies pickups.create.
      setAuthUser('AGENT')
      expect(() =>
        usePickupsStore.getState().createPickup({
          marketeur_org_id: MARKETEUR_ORG,
          source_site_id: SOURCE_SITE,
          destination_site_id: DEST_SITE,
          requested_quantity: 9000,
        }),
      ).toThrow(PERMISSION_DENIED)
    })

    it('throws PERMISSION_DENIED for a MARKETEUR whose scope excludes the source site', () => {
      setAuthUser('MARKETEUR', ['site-other'])
      expect(() =>
        usePickupsStore.getState().createPickup({
          marketeur_org_id: MARKETEUR_ORG,
          source_site_id: SOURCE_SITE,
          destination_site_id: DEST_SITE,
          requested_quantity: 9000,
        }),
      ).toThrow(PERMISSION_DENIED)
    })

    it('allows a MARKETEUR whose scope includes the source site', () => {
      setAuthUser('MARKETEUR', [SOURCE_SITE])
      expect(() =>
        usePickupsStore.getState().createPickup({
          marketeur_org_id: MARKETEUR_ORG,
          source_site_id: SOURCE_SITE,
          destination_site_id: DEST_SITE,
          requested_quantity: 9000,
        }),
      ).not.toThrow(PERMISSION_DENIED)
    })
  })

  describe('createPickup', () => {
    it('creates a DRAFT request and prepends it to the list', () => {
      const countBefore = usePickupsStore.getState().all().length
      const created = usePickupsStore.getState().createPickup({
        marketeur_org_id: MARKETEUR_ORG,
        source_site_id: SOURCE_SITE,
        destination_site_id: DEST_SITE,
        requested_quantity: 9000,
      })

      expect(created.status).toBe('DRAFT')
      expect(created.requested_quantity).toBe(9000)
      expect(created.approved_quantity).toBeNull()
      expect(usePickupsStore.getState().all().length).toBe(countBefore + 1)
      expect(usePickupsStore.getState().viewById(created.id)?.status).toBe('DRAFT')
    })

    it('throws chk_pickup_sites_different when source equals destination', () => {
      expect(() =>
        usePickupsStore.getState().createPickup({
          marketeur_org_id: MARKETEUR_ORG,
          source_site_id: SOURCE_SITE,
          destination_site_id: SOURCE_SITE,
          requested_quantity: 9000,
        }),
      ).toThrow(/chk_pickup_sites_different/)
    })

    it('throws chk_pickup_quantity when quantity is not positive', () => {
      expect(() =>
        usePickupsStore.getState().createPickup({
          marketeur_org_id: MARKETEUR_ORG,
          source_site_id: SOURCE_SITE,
          destination_site_id: DEST_SITE,
          requested_quantity: 0,
        }),
      ).toThrow(/chk_pickup_quantity/)
    })

    it('throws when required fields are missing', () => {
      expect(() =>
        usePickupsStore.getState().createPickup({
          marketeur_org_id: '',
          source_site_id: '',
          destination_site_id: '',
          requested_quantity: 1000,
        }),
      ).toThrow(/mandatory|requires/)
    })

    it('does not mutate the shared curated fixture', () => {
      const originalLength = curated.pickup_requests.length
      usePickupsStore.getState().createPickup({
        marketeur_org_id: MARKETEUR_ORG,
        source_site_id: SOURCE_SITE,
        destination_site_id: DEST_SITE,
        requested_quantity: 5000,
      })
      expect(curated.pickup_requests.length).toBe(originalLength)
    })
  })
})