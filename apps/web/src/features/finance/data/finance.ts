import {
  redressementStatusLabels,
  type RedressementStatus,
} from '@/features/redressements/data/redressements'
import { getReconciliations } from '@/features/reconciliations/data/reconciliations'
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
  const flagged = reconciliations.filter((r) => r.gap_percentage > 2.5).length

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