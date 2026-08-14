import { createFileRoute } from '@tanstack/react-router'
import { FirmwarePage } from '@/features/firmware'

export const Route = createFileRoute('/_authenticated/firmware/')({
  component: FirmwarePage,
})