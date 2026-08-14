import { notification_groups, notification_rules } from '@lpg/mock-data'
import type { NotificationRule, RiskLevel } from '@lpg/types'
import type { AnomalyType } from '@lpg/types'

export type { RiskLevel, AnomalyType }

export interface NotifRuleView {
  id: string
  anomalyType: AnomalyType | null
  minSeverity: RiskLevel | null
  targetGroupId: string
  targetGroupName: string
  isActive: boolean
}

export interface NotifRoutingGroup {
  targetGroupId: string
  targetGroupName: string
  ruleCount: number
  activeRuleCount: number
  rules: NotifRoutingRuleRow[]
}

export interface NotifRoutingRuleRow {
  id: string
  name: string
  anomalyType: AnomalyType | null
  minSeverity: RiskLevel | null
  isActive: boolean
}

export const routingSeverityLabels: Record<RiskLevel, string> = {
  FAIBLE: 'Faible',
  MODERE: 'Modéré',
  ELEVE: 'Élevé',
  CRITIQUE: 'Critique',
  CRITIQUEEXTREME: 'Critique extrême',
}

export function getNotifRoutingGroups(): NotifRoutingGroup[] {
  const rules = notification_rules as NotificationRule[]
  const groupNameById = new Map(notification_groups.map((g) => [g.id, g.name]))

  const byGroup = new Map<string, NotifRoutingRuleRow[]>()
  for (const rule of rules) {
    const key = rule.target_group_id
    if (!byGroup.has(key)) byGroup.set(key, [])
    byGroup.get(key)!.push({
      id: rule.id,
      name: rule.name,
      anomalyType: rule.anomaly_type ?? null,
      minSeverity: rule.min_severity ?? null,
      isActive: rule.is_active,
    })
  }

  return Array.from(byGroup.entries()).map(([groupId, ruleRows]) => ({
    targetGroupId: groupId,
    targetGroupName: groupNameById.get(groupId) ?? groupId,
    ruleCount: ruleRows.length,
    activeRuleCount: ruleRows.filter((r) => r.isActive).length,
    rules: ruleRows,
  }))
}

export function getNotifRuleCount(): number {
  return (notification_rules as NotificationRule[]).length
}

export function getNotifActiveRuleCount(): number {
  return getNotifRoutingGroups().reduce((acc, g) => acc + g.activeRuleCount, 0)
}