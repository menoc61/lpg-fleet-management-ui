import { createFileRoute } from '@tanstack/react-router'
import { TransporterContractsPage } from '@/features/transporter-contracts'

export const Route = createFileRoute('/_authenticated/transporter-contracts/')({
  component: TransporterContractsPage,
})