import { describe, expect, it } from 'vitest'
import { buildRouteLpgVariation } from './route-lpg-variation'
import { getRouteTripsView } from './routes'

describe('buildRouteLpgVariation', () => {
  it('builds the loading, live, and projected LPG stages for a completed trip', () => {
    const trip = getRouteTripsView()[0]!
    const variation = buildRouteLpgVariation(trip)

    expect(variation.stages.map((stage) => stage.label)).toEqual([
      'Au chargement',
      'Dernier releve',
      'Niveau final',
    ])
    expect(variation.stages[0]).toMatchObject({
      quantityKg: 11850,
      percent: 100,
      deltaKg: 0,
    })
    expect(variation.stages[1]).toMatchObject({
      quantityKg: 230,
      percent: 2,
      deltaKg: -11620,
      deltaPercent: -98,
    })
    expect(variation.stages[2]).toMatchObject({
      label: 'Niveau final',
      quantityKg: 230,
      percent: 2,
      deltaKg: 0,
      deltaPercent: 0,
    })
    expect(variation.deliveredKg).toBe(11620)
    expect(variation.deliveredPercent).toBe(98)
    expect(variation.nextDropKg).toBe(0)
  })

  it('keeps the live level as final level once the trip is completed', () => {
    const trip = getRouteTripsView().find(
      (candidate) => candidate.id === 'tour-001',
    )

    expect(trip).toBeTruthy()

    const variation = buildRouteLpgVariation(trip!)

    expect(variation.stages[2]).toMatchObject({
      label: 'Niveau final',
      quantityKg: 230,
      percent: 2,
      deltaKg: 0,
      deltaPercent: 0,
    })
    expect(variation.nextDropKg).toBe(0)
  })
})