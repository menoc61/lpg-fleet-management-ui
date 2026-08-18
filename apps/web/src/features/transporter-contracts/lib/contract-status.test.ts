import { describe, expect, it } from 'vitest'
import {
  contractStatusClasses,
  contractStatusLabels,
  contractsEligibleForExternal,
  deriveContractStatus,
  type ContractStatus,
} from './contract-status'

const now = new Date('2026-08-18T12:00:00Z')

const contract = (overrides: Partial<{
  id: string
  deleted_at: string | null
  is_active: boolean
  contract_document_url: string | null
  transporter_accepted_at: string | null
  started_at: string | null
  ended_at: string | null
  marketeur_org_id: string
  transporter_org_id: string
}> = {}) => ({
  id: 'contract-1',
  marketeur_org_id: 'marketeur-1',
  transporter_org_id: 'transporter-1',
  is_primary: false,
  is_active: true,
  contract_document_url: 'https://example.test/contract.pdf',
  transporter_accepted_at: '2026-08-01T09:00:00Z',
  started_at: '2026-01-01T00:00:00Z',
  ended_at: '2026-12-31T23:59:59Z',
  deleted_at: null,
  ...overrides,
})

describe('deriveContractStatus', () => {
  const cases: Array<[ContractStatus, Partial<Parameters<typeof contract>[0]>]> = [
    ['CANCELLED', { deleted_at: '2026-01-01T00:00:00Z' }],
    ['SUSPENDED', { is_active: false }],
    ['PENDING', { contract_document_url: null }],
    ['PENDINGTRANSPORTERACK', { transporter_accepted_at: null }],
    ['EXPIRED', { ended_at: '2026-08-18T11:59:59Z' }],
    ['UPCOMING', { started_at: '2026-08-18T12:00:01Z' }],
    ['ACTIVE', {}],
  ]

  it.each(cases)('derives %s', (expected, overrides) => {
    expect(deriveContractStatus(contract(overrides), now)).toBe(expected)
  })

  it('applies precedence when multiple conditions match', () => {
    expect(
      deriveContractStatus(
        contract({
          deleted_at: '2026-01-01T00:00:00Z',
          is_active: false,
          contract_document_url: null,
          transporter_accepted_at: null,
          ended_at: '2026-01-01T00:00:00Z',
          started_at: '2027-01-01T00:00:00Z',
        }),
        now,
      ),
    ).toBe('CANCELLED')
  })
})

describe('contractsEligibleForExternal', () => {
  it('returns only ACTIVE contracts for the requested marketeur organization', () => {
    const eligible = contractsEligibleForExternal(
      [
        contract({}),
        contract({ id: 'other-org', marketeur_org_id: 'marketeur-2' }),
        contract({ id: 'pending', transporter_accepted_at: null }),
        contract({ id: 'expired', ended_at: '2026-01-01T00:00:00Z' }),
        contract({ id: 'upcoming', started_at: '2027-01-01T00:00:00Z' }),
      ],
      'marketeur-1',
      now,
    )

    expect(eligible.map(({ id }) => id)).toEqual(['contract-1'])
  })
})

describe('contract status metadata', () => {
  it('defines a label and class for every status', () => {
    const statuses: ContractStatus[] = [
      'CANCELLED',
      'SUSPENDED',
      'PENDING',
      'PENDINGTRANSPORTERACK',
      'EXPIRED',
      'UPCOMING',
      'ACTIVE',
    ]

    for (const status of statuses) {
      expect(contractStatusLabels[status]).toBeTruthy()
      expect(contractStatusClasses[status]).toBeTruthy()
    }
  })
})
