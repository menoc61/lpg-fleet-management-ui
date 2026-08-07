import { createFileRoute } from '@tanstack/react-router'
import { LivreursPage } from '@/features/livreurs'

export const Route = createFileRoute('/_authenticated/livreurs/')({
  component: LivreursPage,
})
