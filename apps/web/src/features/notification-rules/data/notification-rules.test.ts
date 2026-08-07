import { describe, expect, it } from 'vitest'
import {
  getNotifActiveRuleCount,
  getNotifRuleCount,
  getNotifRoutingGroups,
  routingSeverityLabels,
} from './notification-rules'

describe('notification-rules routing view-model', () => {
  it('routes every rule to a target group', () => {
    const groups = getNotifRoutingGroups()
    const total = groups.reduce((acc, g) => acc + g.ruleCount, 0)
    expect(total).toBe(getNotifRuleCount())
  })

  it('tracks active rule counts across groups', () => {
    expect(getNotifActiveRuleCount()).toBeGreaterThanOrEqual(1)
  })

  it('labels severity thresholds', () => {
    expect(routingSeverityLabels.CRITIQUE).toBe('Critique')
    expect(routingSeverityLabels.MODERE).toBe('Modéré')
  })
})
