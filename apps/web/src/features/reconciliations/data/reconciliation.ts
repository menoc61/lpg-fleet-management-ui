import { scan_events, settings } from '@lpg/mock-data'
import type { Declaration, Reconciliation, Setting } from '@lpg/types'

export interface ReconciliationComputation {
  declaration_id: string
  declared_volume: number
  tracked_volume: number
  volume_gap: number
  gap_pct: number
  tolerance_pct: number
  within_tolerance: boolean
  subsidy_impact: number
}

const TOLERANCE_KEY = 'reconciliation.volume_gap_tolerance_percent'
const SUBSIDY_RATE_PER_TM = 1000

function resolveTolerance(settingsList: Setting[]): number {
  const setting = settingsList.find((s) => s.setting_key === TOLERANCE_KEY)
  return setting ? Number(setting.setting_value) : 2.5
}

export function sumTrackedVolume(): number {
  return scan_events
    .filter((s) => s.direction === 'OUT')
    .reduce((acc, s) => acc + (s.meter_reading ?? 0), 0)
}

export function computeReconciliation(
  declaration: Declaration,
  trackedVolume?: number,
  toleranceOverride?: number,
): ReconciliationComputation {
  const tolerance = toleranceOverride ?? resolveTolerance(settings as Setting[])
  const tracked = trackedVolume ?? sumTrackedVolume()
  const volumeGap = declaration.declared_volume - tracked
  const gapPct =
    declaration.declared_volume > 0
      ? Math.abs((volumeGap / declaration.declared_volume) * 100)
      : 0
  return {
    declaration_id: declaration.id,
    declared_volume: declaration.declared_volume,
    tracked_volume: tracked,
    volume_gap: volumeGap,
    gap_pct: Math.round(gapPct * 100) / 100,
    tolerance_pct: tolerance,
    within_tolerance: gapPct <= tolerance,
    subsidy_impact: Math.round(Math.abs(volumeGap) * SUBSIDY_RATE_PER_TM),
  }
}

export function reconciliationFromDeclaration(
  decl: Declaration,
  existing?: Reconciliation,
): Reconciliation {
  const comp = computeReconciliation(decl)
  const now = new Date().toISOString()
  return {
    id: existing?.id ?? `rec-comp-${decl.id}`,
    declaration_id: decl.id,
    tracked_volume: comp.tracked_volume,
    volume_gap: comp.volume_gap,
    subsidy_impact: comp.subsidy_impact,
    status: existing?.status ?? 'PENDING',
    verified_by: existing?.verified_by ?? null,
    verified_at: existing?.verified_at ?? null,
    notes: existing?.notes ?? null,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    deleted_at: null,
    created_by: null,
    updated_by: null,
  }
}