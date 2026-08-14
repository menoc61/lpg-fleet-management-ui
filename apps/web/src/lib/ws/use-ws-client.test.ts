import { describe, expect, it } from 'vitest'
import { mapWsEventToInvalidation } from './use-ws-client'

describe('mapWsEventToInvalidation', () => {
  it('maps tour:update to tours', () => {
    expect(mapWsEventToInvalidation('tour:update')).toEqual(['tours'])
  })
  it('maps anomaly:new to anomalies', () => {
    expect(mapWsEventToInvalidation('anomaly:new')).toEqual(['anomalies'])
  })
  it('maps device:telemetry to devices', () => {
    expect(mapWsEventToInvalidation('device:telemetry')).toEqual(['devices'])
  })
  it('unknown events return []', () => {
    expect(mapWsEventToInvalidation('position:update')).toEqual([])
  })
})
