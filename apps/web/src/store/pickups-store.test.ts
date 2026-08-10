import { describe, expect, it, beforeEach } from 'vitest'
import { usePickupsStore } from './pickups-store'
import { curated } from '@lpg/mock-data'

const MARKETeur_ORG = 'org-0002-sctm-0000-000000000001'
const SOURCE_SITE = 'site-0030-scdp-garoua'
const DEST_SITE = 'site-0004-sctm-garoua'

function freshSeed() {
  return {
    pickups: curated.pickup_requests.map((p) => ({ ...p })),
  }
}

describe('pickups store', () => {
  beforeEach(() => {
    usePickupsStore.setState(freshSeed())
  })

  it('seeds with the curated pickup requests', () => {
    expect(usePickupsStore.getState().all().length).toBe(curated.pickup_requests.length)
  })

  describe('createPickup', () => {
    it('creates a DRAFT request and prepends it to the list', () => {
      const countBefore = usePickupsStore.getState().all().length
      const created = usePickupsStore.getState().createPickup({
        marketeur_org_id: MARKETeur_ORG,
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
          marketeur_org_id: MARKETeur_ORG,
          source_site_id: SOURCE_SITE,
          destination_site_id: SOURCE_SITE,
          requested_quantity: 9000,
        }),
      ).toThrow(/chk_pickup_sites_different/)
    })

    it('throws chk_pickup_quantity when quantity is not positive', () => {
      expect(() =>
        usePickupsStore.getState().createPickup({
          marketeur_org_id: MARKETeur_ORG,
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
        marketeur_org_id: MARKETeur_ORG,
        source_site_id: SOURCE_SITE,
        destination_site_id: DEST_SITE,
        requested_quantity: 5000,
      })
      expect(curated.pickup_requests.length).toBe(originalLength)
    })
  })
})