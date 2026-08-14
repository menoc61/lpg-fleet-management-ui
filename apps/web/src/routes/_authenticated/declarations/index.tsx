import { createFileRoute } from '@tanstack/react-router'
import { DeclarationsPage } from '@/features/declarations'

export const Route = createFileRoute('/_authenticated/declarations/')({
  component: DeclarationsPage,
})