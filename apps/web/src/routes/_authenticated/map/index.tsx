import { createFileRoute } from '@tanstack/react-router'
import { NationalMapPage } from '@/features/map'

export const Route = createFileRoute('/_authenticated/map/')({
  component: NationalMapPage,
})
