import { describe, expect, it } from 'vitest'
import { getFinanceSummary, getRedressementStatusRows } from './finance'

describe('finance view-model', () => {
  it('aggregates subsidy impact and gaps', () => {
    const summary = getFinanceSummary()
    expect(summary.declaredVolumeLabel).toContain('TM')
    expect(summary.subsidyImpactLabel).toContain('XAF')
    expect(summary.collectedLabel).toContain('XAF')
    expect(summary.gapPercentage).toBeGreaterThanOrEqual(0)
  })

  it('builds one status row per redressement status with totals', () => {
    const rows = getRedressementStatusRows()
    expect(rows).toHaveLength(3)
    const totalCount = rows.reduce((acc, r) => acc + r.count, 0)
    expect(totalCount).toBeGreaterThanOrEqual(1)
    for (const row of rows) {
      expect(row.statusLabel).toBeTruthy()
      expect(row.totalLabel).toContain('XAF')
    }
  })
})