import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/anomalies')({
  component: AnomaliesLayout,
})

function AnomaliesLayout() {
  return <Outlet />
}