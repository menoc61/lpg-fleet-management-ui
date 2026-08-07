import { describe, expect, it } from 'vitest'
import { getRiskScores, getRiskSummary, riskLevelLabels, riskEntityLabels } from './risk-scores'

describe('risk-scores view-model', () => {
  it('returns risk scores with resolved entities', () => {
    const rows = getRiskScores()
    expect(rows.length).toBeGreaterThanOrEqual(1)
    for (const row of rows) {
      expect(row.entity_name).toBeTruthy()
      expect(row.level_label).toBeTruthy()
      expect(row.score).toBeGreaterThanOrEqual(0)
    }
  })

  it('sorts by descending score', () => {
    const rows = getRiskScores()
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1]!.score >= rows[i]!.score).toBe(true)
    }
  })

  it('summarizes level buckets', () => {
    const summary = getRiskSummary(getRiskScores())
    const sum = summary.faible + summary.modere + summary.eleve + summary.critique
    expect(sum).toBe(summary.total)
    expect(summary.average).toBeGreaterThanOrEqual(0)
  })

  it('labels every risk level and entity', () => {
    expect(riskLevelLabels.CRITIQUE).toBe('Critique')
    expect(riskEntityLabels.MARKETEUR).toBe('Marketeur')
  })
})