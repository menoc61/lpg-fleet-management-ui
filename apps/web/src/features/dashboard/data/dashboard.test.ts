import { describe, expect, it } from 'vitest'
import { buildDashboardView } from './dashboard'

describe('buildDashboardView', () => {
  it('builds the command dashboard aggregates from fleet, route, and site data', () => {
    const dashboard = buildDashboardView()

    expect(dashboard.overview).toMatchObject({
      totalTransportedKg: 83890,
      totalDeliveredKg: 25140,
      totalReserveKg: 86550,
      reserveCapacityKg: 144000,
      reserveFillPercent: 60,
      reserveCoverageDays: 3.4,
      activeTrips: 4,
      plannedTrips: 4,
      incidentTrips: 0,
      activeTrucks: 27,
      totalTrucks: 33,
      riskTrucks: 0,
      abnormalLossKg: 0,
      openAlerts: 4,
      criticalAlerts: 1,
    })

    expect(dashboard.metrics.map((metric) => metric.id)).toEqual([
      'transported',
      'reserve',
      'delivered',
      'alerts',
    ])
    expect(dashboard.metrics[0]).toMatchObject({
      deltaPercent: 4,
      deltaDirection: 'up',
    })
    expect(dashboard.metrics[1]).toMatchObject({
      deltaPercent: -1,
      deltaDirection: 'down',
    })

    expect(
      dashboard.trendByPeriod.daily[dashboard.trendByPeriod.daily.length - 1]
    ).toEqual({
      label: "Aujourd'hui",
      transportedKg: 83890,
      deliveredKg: 25140,
      reserveKg: 86550,
      alertCount: 4,
      serviceRate: 67,
    })

    expect(dashboard.cadence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          period: 'daily',
          transportedDeltaPercent: 4,
          reserveDeltaPercent: -1,
        }),
      ])
    )
  })

  it('surfaces fleet and reserve site hotspots in priority order', () => {
    const dashboard = buildDashboardView()

    expect(dashboard.fleets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fleetName: 'CSPH — Caisse de Stabilisation des Prix des Hydrocarbures',
          transportedKg: 26850,
          deliveredKg: 11620,
          pendingKg: 15230,
          sharePercent: 32,
          onTimeRate: 100,
          truckCount: 3,
        }),
        expect.objectContaining({
          fleetName: 'STARGAS Cameroun SARL',
          transportedKg: 12000,
          deliveredKg: 0,
          pendingKg: 12000,
          sharePercent: 14,
          onTimeRate: 0,
          truckCount: 2,
        }),
      ])
    )

    expect(dashboard.fleets[0]!.fleetName).toBe(
      'CSPH — Caisse de Stabilisation des Prix des Hydrocarbures'
    )
    expect(dashboard.fleets[1]!.fleetName).toBe('STARGAS Cameroun SARL')
    expect(dashboard.fleets[0]).toMatchObject({ onTimeRate: 100 })
    expect(dashboard.fleets[1]).toMatchObject({ onTimeRate: 0 })

    expect(dashboard.reserveSites[0]).toMatchObject({
      siteId: 'site-0001-sctm-bonaberi',
      status: 'critical',
      fillPercent: 31,
      activeTripCount: 6,
    })
    expect(dashboard.reserveSites[1]).toMatchObject({
      siteId: 'site-0029-scdp-yaounde',
      status: 'watch',
      fillPercent: 44,
      activeTripCount: 0,
    })

    expect(dashboard.alerts.map((alert) => alert.id)).toEqual([
      'reserve-site-0001-sctm-bonaberi-critical',
      'tour-002-eta',
      'tour-008-eta',
      'reserve-site-0029-scdp-yaounde-watch',
    ])
  })

  it('keeps route-level contribution details for volume traceability', () => {
    const dashboard = buildDashboardView()

    expect(dashboard.routeContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reference: 'TRP-2405',
          carrierName: 'CSPH — Caisse de Stabilisation des Prix des Hydrocarbures',
          plateNumber: 'LT1123UB',
          loadedQuantityKg: 15000,
          transportedSharePercent: 18,
        }),
        expect.objectContaining({
          reference: 'TRP-2409',
          carrierName: 'STARGAS Cameroun SARL',
          plateNumber: 'LT0013TL',
          loadedQuantityKg: 12000,
        }),
        expect.objectContaining({
          reference: 'TRP-2401',
          carrierName: 'CSPH — Caisse de Stabilisation des Prix des Hydrocarbures',
          plateNumber: 'LT1123UB',
          deliveredQuantityKg: 11620,
        }),
        expect.objectContaining({
          reference: 'TRP-2404',
          carrierName: 'Clinique Baptiste de Douala',
          plateNumber: 'LT9903TJ',
          loadedQuantityKg: 3600,
          status: 'in-progress',
        }),
      ])
    )
  })
})