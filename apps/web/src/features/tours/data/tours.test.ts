import { describe, expect, it } from 'vitest'
import {
  getTours,
  getTourById,
  getTourSummary,
  getTourProgress,
  getTourStops,
} from './tours'

describe('tours view-model', () => {
  it('returns all tours', () => {
    const tours = getTours()
    expect(tours.length).toBeGreaterThanOrEqual(1)
    for (const tour of tours) {
      expect(tour.reference).toMatch(/^TR-\d{4}$/)
      expect(tour.marketeur_name).toBeTruthy()
      expect(tour.status_label).toBeTruthy()
    }
  })

  it('filters INTERNAL and EXTERNAL slices', () => {
    const internal = getTours('INTERNAL')
    const external = getTours('EXTERNAL')
    expect(internal.every((t) => t.execution_mode === 'INTERNAL')).toBe(true)
    expect(external.every((t) => t.execution_mode === 'EXTERNAL')).toBe(true)
  })

  it('filters ACTIVE and HISTORY slices', () => {
    const active = getTours('ACTIVE')
    const history = getTours('HISTORY')
    expect(active.every((t) => t.status === 'INPROGRESS' || t.status === 'CHECKPOINTACTIVE')).toBe(true)
    expect(history.every((t) => t.status === 'CLOSED' || t.status === 'CANCELLED')).toBe(true)
  })

  it('resolves a tour by id', () => {
    const [first] = getTours()
    expect(first).toBeDefined()
    const tour = getTourById(first!.id)
    expect(tour?.id).toBe(first!.id)
  })

  it('computes passage progress', () => {
    const [first] = getTours()
    expect(first).toBeDefined()
    const progress = getTourProgress(first!)
    expect(progress).toBeGreaterThanOrEqual(0)
    expect(progress).toBeLessThanOrEqual(100)
  })

  it('resolves ordered stops for a tour', () => {
    const [first] = getTours()
    expect(first).toBeDefined()
    const stops = getTourStops(first!.id)
    if (first!.checkpoint_count > 0) {
      expect(stops.length).toBe(first!.checkpoint_count)
    }
  })

  it('summarizes totals by bucket', () => {
    const summary = getTourSummary(getTours())
    expect(summary.internal + summary.external).toBe(summary.total)
  })
})