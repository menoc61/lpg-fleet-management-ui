import {
  redressementStatusLabels,
  type RedressementStatus,
} from '@/features/redressements/data/redressements'
import { getReconciliations, gapToleranceThreshold } from '@/features/reconciliations/data/reconciliations'
import { getRedressements } from '@/features/redressements/data/redressements'

export type { RedressementStatus }

const CURRENCY = 'XAF'

function currencyLabel(value: number): string {
  return `${Math.round(value).toLocaleString('fr-FR')} ${CURRENCY}`
}

export function getFinanceSummary() {
  const reconciliations = getReconciliations()
  const redressements = getRedressements()

  const declaredVolume = reconciliations.reduce((acc, r) => acc + r.declared_volume, 0)
  const totalGap = reconciliations.reduce((acc, r) => acc + Math.abs(r.volume_gap), 0)
  const subsidyImpact = reconciliations.reduce((acc, r) => acc + Math.abs(r.subsidy_impact), 0)
  const outstanding = redressements
    .filter((r) => r.status === 'ISSUED')
    .reduce((acc, r) => acc + r.amount, 0)
  const collected = redressements
    .filter((r) => r.status === 'PAID')
    .reduce((acc, r) => acc + r.amount, 0)
  const flagged = reconciliations.filter(
    (r) => r.gap_percentage > gapToleranceThreshold()
  ).length

  return {
    declaredVolume,
    declaredVolumeLabel: `${declaredVolume.toLocaleString('fr-FR')} TM`,
    totalGap,
    totalGapLabel: `${totalGap.toLocaleString('fr-FR')} TM`,
    gapPercentage: declaredVolume > 0 ? (totalGap / declaredVolume) * 100 : 0,
    subsidyImpact,
    subsidyImpactLabel: currencyLabel(subsidyImpact),
    outstanding,
    outstandingLabel: currencyLabel(outstanding),
    collected,
    collectedLabel: currencyLabel(collected),
    redressementCount: redressements.length,
    flaggedCount: flagged,
  }
}

export interface FinanceStatusRow {
  status: RedressementStatus
  statusLabel: string
  count: number
  totalLabel: string
}

export function getRedressementStatusRows(): FinanceStatusRow[] {
  const rows = getRedressements()
  const statuses = Object.keys(redressementStatusLabels) as RedressementStatus[]
  return statuses.map((status) => {
    const subset = rows.filter((r) => r.status === status)
    return {
      status,
      statusLabel: redressementStatusLabels[status],
      count: subset.length,
      totalLabel: currencyLabel(subset.reduce((acc, r) => acc + r.amount, 0)),
    }
  })
}

export interface FinanceMarketeurRow {
  marketeur: string
  declaredVolume: number
  volumeGap: number
  subsidyImpact: number
  reconciliationCount: number
}

/** Per-marketeur aggregation over real reconciliation rows (no fabricated data). */
export function getMarketeurImpactRows(): FinanceMarketeurRow[] {
  const rows = getReconciliations()
  const byMarketeur = new Map<string, FinanceMarketeurRow>()
  for (const r of rows) {
    const entry = byMarketeur.get(r.marketeur_name) ?? {
      marketeur: r.marketeur_name,
      declaredVolume: 0,
      volumeGap: 0,
      subsidyImpact: 0,
      reconciliationCount: 0,
    }
    entry.declaredVolume += r.declared_volume
    entry.volumeGap += Math.abs(r.volume_gap)
    entry.subsidyImpact += r.subsidy_impact
    entry.reconciliationCount += 1
    byMarketeur.set(r.marketeur_name, entry)
  }
  return [...byMarketeur.values()].sort((a, b) => b.subsidyImpact - a.subsidyImpact)
}

/** Real reconciliation rows flagged as over the tolerance threshold. */
export function getFlaggedReconciliations() {
  const rows = getReconciliations()
  return rows.filter((r) => r.gap_percentage > gapToleranceThreshold())
}