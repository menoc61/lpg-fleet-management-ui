import { describe, expect, it } from 'vitest'
import {
  formatFileSize,
  getReportSummary,
  getReports,
  reportStatusLabels,
  reportTypeLabels,
} from './reports'

describe('reports view-model', () => {
  it('maps reports with labels', () => {
    const rows = getReports()
    expect(rows.length).toBeGreaterThanOrEqual(4)
    for (const row of rows) {
      expect(row.name).toBeTruthy()
      expect(reportTypeLabels[row.type]).toBe(row.typeLabel)
      expect(reportStatusLabels[row.status]).toBe(row.statusLabel)
    }
  })

  it('computes status summary', () => {
    const summary = getReportSummary()
    expect(summary.total).toBe(getReports().length)
    expect(summary.ready).toBeGreaterThanOrEqual(1)
  })

  it('formats file sizes', () => {
    expect(formatFileSize(null)).toBe('')
    expect(formatFileSize(512)).toBe('512 o')
    expect(formatFileSize(2048)).toBe('2.0 Ko')
  })
})