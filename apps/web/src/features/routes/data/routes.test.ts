import { describe, expect, it } from 'vitest'
import { buildRouteSummary, getRouteTripsView } from './routes'

describe('getRouteTripsView', () => {
  it('resolves the route dataset into a UI-friendly view model', () => {
    const trips = getRouteTripsView()
    const selectedTrip = trips[0]!

    expect(selectedTrip.id).toBe('tour-001')
    expect(selectedTrip.truckId).toBe('veh-0001-lt1123ub')
    expect(selectedTrip.originSiteId).toBe('site-0001-sctm-bonaberi')
    expect(selectedTrip.destinationSiteId).toBe('csite-0001-shc-principal')
    expect(selectedTrip.stops).toHaveLength(2)
    expect(selectedTrip.nextStop.site.id).toBe('csite-0001-shc-principal')
    expect(selectedTrip.deliveredPercent).toBe(98)
    expect(selectedTrip.remainingPercent).toBe(2)
    expect(selectedTrip.unaccountedKg).toBe(0)
    expect(selectedTrip.attentionLevel).toBe('low')
  })
})

describe('buildRouteSummary', () => {
  it('aggregates the route portfolio for the command center header', () => {
    expect(buildRouteSummary([...getRouteTripsView()])).toEqual({
      totalTrips: 10,
      activeTrips: 4,
      plannedTrips: 4,
      completedTrips: 2,
      incidentTrips: 0,
      activeVolumeKg: 21240,
      deliveredVolumeKg: 25140,
      onTimeRate: 67,
      attentionCount: 3,
    })
  })
})