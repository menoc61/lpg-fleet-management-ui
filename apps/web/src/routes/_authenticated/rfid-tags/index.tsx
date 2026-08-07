import { createFileRoute } from '@tanstack/react-router'
import { RfidTagsPage } from '@/features/rfid-tags'

export const Route = createFileRoute('/_authenticated/rfid-tags/')({
  component: RfidTagsPage,
})