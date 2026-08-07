import { createFileRoute } from '@tanstack/react-router'
import { CustomRolesPage } from '@/features/custom-roles'

export const Route = createFileRoute('/_authenticated/custom-roles/')({
  component: CustomRolesPage,
})