import { useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { hasPermission, type PermissionCode } from '@lpg/permissions'
import { useRoleStore } from '@/store/role-store'
import { useComplianceStore } from '@/store/compliance-store'
import type { DeclarationView } from '@/features/declarations/data/declarations'

const SUBMIT_PERMISSION: PermissionCode = 'declarations.write'

export function DeclarationActions({ declaration }: { declaration: DeclarationView }) {
  const activeRole = useRoleStore((s) => s.activeRole)
  const submitDeclaration = useComplianceStore((s) => s.submitDeclaration)

  const canSubmit = useMemo(
    () =>
      hasPermission(activeRole, SUBMIT_PERMISSION) &&
      (declaration.status === 'DRAFT' || declaration.status === 'DISPUTED'),
    [activeRole, declaration.status],
  )

  if (!canSubmit) return null

  function handleSubmit() {
    try {
      submitDeclaration(declaration.id)
      toast.success(`${declaration.reference} — Declaration soumise`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible')
    }
  }

  return (
    <div className='flex flex-wrap justify-end gap-2 border-t pt-3'>
      <Button onClick={handleSubmit}>Soumettre</Button>
    </div>
  )
}