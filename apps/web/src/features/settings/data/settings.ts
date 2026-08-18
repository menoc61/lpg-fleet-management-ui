import { settings } from '@lpg/mock-data'
import type { Setting } from '@lpg/types'

export type { Setting }

export interface SettingView {
  key: string
  value: string
  valueType: string
  category: string
  categoryLabel: string
  description: string
  isEncrypted: boolean
  requiresRestart: boolean
}

export const settingCategoryLabels: Record<string, string> = {
  GEO: 'Géolocalisation',
  DEVICE: 'Dispositifs',
  COMPLIANCE: 'Conformité',
  TOURNEE: 'Tournées',
  AUDIT: 'Audit',
  SECURITY: 'Sécurité',
  GPS: 'GPS',
  REPORT: 'Rapports',
  RESERVE: 'Réserve',
  FLUX1: 'Flux 1 (enlèvements)',
}

export function getSettings(): SettingView[] {
  return (settings as Setting[]).map((setting) => ({
    key: setting.setting_key,
    value: String(setting.setting_value),
    valueType: setting.value_type,
    category: setting.category,
    categoryLabel: settingCategoryLabels[setting.category] ?? setting.category,
    description: setting.description ?? '',
    isEncrypted: setting.is_encrypted,
    requiresRestart: setting.requires_restart,
  }))
}

export function getSettingSummary() {
  const rows = getSettings()
  const categories = new Set(rows.map((r) => r.categoryLabel))
  return {
    total: rows.length,
    encrypted: rows.filter((r) => r.isEncrypted).length,
    categories: categories.size,
  }
}

export function getSettingsByCategory(): Record<string, SettingView[]> {
  const rows = getSettings()
  const grouped: Record<string, SettingView[]> = {}
  for (const row of rows) {
    const key = row.categoryLabel
    grouped[key] = grouped[key] ?? []
    grouped[key].push(row)
  }
  return grouped
}