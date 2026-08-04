import type { PromotionThresholds } from '../lib/auto-promotion'
import type { SiteRow } from '../lib/site-status-machine'

const REGIONS = [
  'CENTRE', 'LITTORAL', 'NORD', 'EXTREMENORD', 'OUEST',
  'SUDOUEST', 'EST', 'ADAMAOUA', 'NORDOUEST', 'SUD',
] as const

export const defaultThresholds: PromotionThresholds = {
  auto: 80,
  flag: 30,
}

export const siteRows: SiteRow[] = [
  {
    id: 'site-bipaga',
    status: 'ACTIVE',
    region: 'SUD',
    delivery_count: 7,
    geo_confidence_score: 62,
    is_client_site: false,
  },
  {
    id: 'site-scdp-douala',
    status: 'VERIFIED',
    region: 'LITTORAL',
    delivery_count: 28,
    geo_confidence_score: 92,
    is_client_site: false,
  },
  {
    id: 'site-tradex-akwa',
    status: 'ASSIGNED',
    region: 'LITTORAL',
    delivery_count: 4,
    geo_confidence_score: 41,
    is_client_site: false,
  },
  {
    id: 'site-tradex-onanne',
    status: 'UNASSIGNED',
    region: 'CENTRE',
    delivery_count: 0,
    geo_confidence_score: 0,
    is_client_site: false,
  },
  {
    id: 'site-bafoussam-center',
    status: 'SUSPENDED',
    region: 'OUEST',
    delivery_count: 12,
    geo_confidence_score: 70,
    is_client_site: false,
  },
]

export const clientSiteRows: SiteRow[] = [
  {
    id: 'csite-tradex-bonamoussadi',
    status: 'ACTIVE',
    region: 'LITTORAL',
    delivery_count: 8,
    geo_confidence_score: 84,
    is_client_site: true,
  },
  {
    id: 'csite-total-ebolowa',
    status: 'ASSIGNED',
    region: 'SUD',
    delivery_count: 3,
    geo_confidence_score: 35,
    is_client_site: true,
  },
  {
    id: 'csite-tradex-new-bell',
    status: 'REJECTED',
    region: 'LITTORAL',
    delivery_count: 1,
    geo_confidence_score: 12,
    is_client_site: true,
  },
]

export function getSiteRows(): SiteRow[] {
  return siteRows
}

export function getClientSiteRows(): SiteRow[] {
  return clientSiteRows
}

export function getVerificationInbox(): SiteRow[] {
  return [...siteRows, ...clientSiteRows]
    .filter((s) => s.status === 'ASSIGNED' || s.status === 'ACTIVE')
    .sort((a, b) => (a.delivery_count < b.delivery_count ? -1 : 1))
}

export { REGIONS }
