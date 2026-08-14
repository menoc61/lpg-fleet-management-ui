/**
 * Settings-driven business rules (AGENTS.md §4).
 *
 * Thumb rule: no hardcoded business thresholds in code. Every tunable value
 * (geo confidence, battery alerts, SLA timeouts, tolerances, retention years,
 * MFA enforcement, …) is read by `setting_key` from the `settings` fixture
 * (`seed/curated/10_system_config.json`), mirroring the production `settings`
 * table. Consumers that need a numeric threshold use `getSettingNumber`.
 */

import { curated } from './curated.ts'

export function getSetting(key: string): string | null {
  const setting = curated.settings.find((s) => s.setting_key === key)
  const value = setting?.setting_value
  return typeof value === 'string' ? value : value === undefined || value === null ? null : String(value)
}

export function getSettingNumber(key: string): number | null {
  const raw = getSetting(key)
  if (raw === null || raw === '') return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}