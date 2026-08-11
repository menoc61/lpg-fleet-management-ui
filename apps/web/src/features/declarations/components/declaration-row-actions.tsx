import { useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { hasPermission } from '@lpg/permissions'
import { useRoleStore } from '@/store/role-store'
import { useComplianceStore } from '@/store/compliance-store'
import type { DeclarationView } from '../data/declarations'

export function DeclarationRowActions({ row }: { row: DeclarationView }) {
  const activeRole = useRoleStore((s) => s.activeRole)
  const submitDeclaration = useComplianceStore((s) => s.submitDeclaration)

  const canSubmit = useMemo(
    () =>
      hasPermission(activeRole, 'declarations.write') &&
      (row.status === 'DRAFT' || row.status === 'DISPUTED'),
    [activeRole, row.status],
  )

  if (!canSubmit) return null

  function handleSubmit() {
    try {
      submitDeclaration(row.id)
      toast.success(`${row.reference} � Declaration soumise`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible')
    }
  }

  return (
    <Button size='sm' onClick={handleSubmit}>
      Soumettre
    </Button>
  )
}