import { createFileRoute } from '@tanstack/react-router'
import { FollowUpPage } from '@/features/tours/follow-up'

export const Route = createFileRoute('/_authenticated/tour-tracking')({
  component: FollowUpPage,
})
