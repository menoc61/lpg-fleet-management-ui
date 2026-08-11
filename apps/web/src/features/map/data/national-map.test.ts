import { describe, it, expect } from 'vitest'
import { getNationalMapView } from './national-map'

describe('getNationalMapView', () => {
  it('exposes every aggregated sub-view', () => {
    const view = getNationalMapView()
    expect(Array.isArray(view.sites)).toBe(true)
    expect(Array.isArray(view.clientSites)).toBe(true)
    expect(Array.isArray(view.zones)).toBe(true)
    expect(Array.isArray(view.regions)).toBe(true)
    expect(Array.isArray(view.anomalies)).toBe(true)
    expect(typeof view.vrac.totalTM).toBe('number')
  })

  it('flags at least one anomaly present in the mock', () => {
    const view = getNationalMapView()
    expect(view.anomalies.length).toBeGreaterThan(0)
  })
})
