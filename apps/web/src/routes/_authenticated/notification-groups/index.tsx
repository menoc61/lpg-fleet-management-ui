import { createFileRoute } from '@tanstack/react-router'
import { NotificationGroupsPage } from '@/features/notification-groups'

export const Route = createFileRoute('/_authenticated/notification-groups/')({
  component: NotificationGroupsPage,
})