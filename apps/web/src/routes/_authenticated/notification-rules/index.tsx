import { createFileRoute } from '@tanstack/react-router'
import { NotificationRulesPage } from '@/features/notification-rules'

export const Route = createFileRoute('/_authenticated/notification-rules/')({
  component: NotificationRulesPage,
})