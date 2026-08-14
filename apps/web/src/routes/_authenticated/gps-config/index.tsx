import { createFileRoute } from '@tanstack/react-router'
import { GpsConfigPage } from '@/features/gps-config'

export const Route = createFileRoute('/_authenticated/gps-config/')({
  component: GpsConfigPage,
})