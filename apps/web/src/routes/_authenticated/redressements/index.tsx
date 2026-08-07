import { createFileRoute } from '@tanstack/react-router'
import { RedressementsPage } from '@/features/redressements'

export const Route = createFileRoute('/_authenticated/redressements/')({
  component: RedressementsPage,
})