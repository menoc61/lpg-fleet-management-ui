import { describe, it, expect } from 'vitest'
import { getInitialLayers, type MapLayerKey } from './layers'

describe('getInitialLayers', () => {
  it('exposes a boolean toggle per layer', () => {
    const layers = getInitialLayers()
    expect(Object.keys(layers)).toHaveLength(6)
    for (const key of Object.keys(layers) as MapLayerKey[]) {
      expect(typeof layers[key]).toBe('boolean')
    }
  })
  it('shows sites, clientSites, regions, vrac by default; hides zones + anomalies', () => {
    const layers = getInitialLayers()
    expect(layers.sites).toBe(true)
    expect(layers.clientSites).toBe(true)
    expect(layers.regions).toBe(true)
    expect(layers.vrac).toBe(true)
    expect(layers.zones).toBe(false)
    expect(layers.anomalies).toBe(false)
  })
})
