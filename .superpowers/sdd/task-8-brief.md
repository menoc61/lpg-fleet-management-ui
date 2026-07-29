Task 8: Module routing + roles

Copy these directories from source to local to add the module system and role-based views.

Source prefix: C:\Users\DTA_WorkStation\Documents\lpg-fleet-management-ui\apps\web\
Local prefix: C:\Users\DTA_WorkStation\Documents\manga\lpg-fleet-management-ui\apps\web\

## Directories to copy (with all contents):

1. config/modules/ → local config/modules/
2. config/rbac/ → local config/rbac/ (overwrite)
3. module/ → local module/
4. roles/ → local roles/
5. routes/_authenticated/$role/ → local routes/_authenticated/$role/
6. routes/login.tsx → local routes/login.tsx
7. routes/terms.tsx → local routes/terms.tsx
8. routes/_authenticated/dashboard/fleets/ → local equivalent
9. routes/_authenticated/dashboard/sites/ → local equivalent
10. routes/_authenticated/settings/notification-groups.tsx → local equivalent

## After copying:
- Run pnpm -F @lpg/web typecheck
- Run pnpm -F @lpg/web build
- If typecheck fails due to missing routeTree.gen.ts, regenerate it by running `pnpm -F @lpg/web typecheck` which triggers the TanStack Router plugin
- Commit all changes

## Verification:
- typecheck passes
- build passes