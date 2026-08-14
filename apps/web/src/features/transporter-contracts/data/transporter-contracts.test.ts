import { describe, expect, it } from 'vitest'
import { getTransporterContracts, getTransporterContractSummary } from './transporter-contracts'

describe('transporter-contracts view-model', () => {
  it('returns contracts with resolved orgs', () => {
    const rows = getTransporterContracts()
    expect(rows.length).toBeGreaterThanOrEqual(1)
    for (const row of rows) {
      expect(row.marketeur_name).toBeTruthy()
      expect(row.transporter_name).toBeTruthy()
      expect(row.reference).toMatch(/^CTR-/)
    }
  })

  it('summarizes active/primary contracts', () => {
    const summary = getTransporterContractSummary(getTransporterContracts())
    expect(summary.active + summary.inactive).toBe(summary.total)
  })
})