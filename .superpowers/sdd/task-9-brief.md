Task 9: Adopt dashboard charts, notifications, command-palette, PWA

Goal: Add the remaining feature files from source (dashboard charts, notifications, command-palette, PWA support).

## Source files to copy (from C:\Users\DTA_WorkStation\Documents\lpg-fleet-management-ui\apps\web\):

### New directories to create and copy:
- features/command-palette/ → local features/command-palette/
- features/notifications/ → local features/notifications/

### New/updated files:
- features/dashboard/chart-area-interactive.tsx
- features/dashboard/chart-bar.tsx
- features/dashboard/chart-line.tsx
- features/dashboard/chart-pie.tsx
- features/dashboard/dashboard-details.tsx
- features/dashboard/dashboard.test.ts
- features/dashboard/multiselect-filter.tsx
- features/dashboard/recent-activity.tsx
- features/dashboard/section-cards.tsx
- features/routes/route-corridor-map.tsx
- features/routes/route-lpg-variation.ts (and .test.ts)
- features/routes/route-lpg-variation-panel.tsx
- features/routes/route-telemetry-chart.tsx
- features/routes/routes-bulk-actions.tsx
- features/transporters/transporter-details.tsx (and history, routes, trucks variants)
- features/trucks/truck-details-sheet.tsx
- features/trucks/trucks-map.tsx
- features/marketers/components/marketers-bulk-actions.tsx
- features/marketers/components/marketer-cylinders.tsx

### Vite config update:
Add VitePWA plugin to apps/web/vite.config.ts

## Steps:
1. Copy all new directories/files from source
2. Update vite.config.ts with VitePWA plugin
3. pnpm -F @lpg/web typecheck
4. pnpm -F @lpg/web build
5. Commit

## Verification:
- typecheck passes
- build produces dist/