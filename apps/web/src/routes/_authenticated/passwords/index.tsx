import { createFileRoute } from '@tanstack/react-router'
import { PasswordsPage } from '@/features/passwords'

export const Route = createFileRoute('/_authenticated/passwords/')({
  component: PasswordsPage,
})