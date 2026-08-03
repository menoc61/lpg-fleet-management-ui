# Codebase Concerns

**Analysis Date:** 2026-08-03

---

## Tech Debt

### TD-1. Dead CASL Permissions Provider

- Issue: `apps/web/src/context/PermissionsProvider.tsx` and `apps/web/src/context/AbilityContext.ts` build a CASL `Ability` from `@lpg/permissions`, but **never imported into `apps/web/src/main.tsx`** (`main.tsx:11-18` wires only Router + QueryClient + ThemeProvider).
- Files: `apps/web/src/context/PermissionsProvider.tsx`, `apps/web/src/context/AbilityContext.ts`, `apps/web/src/main.tsx:11-18`
- Impact: `ROLE_PERMISSIONS` matrix (`packages/permissions/src/index.ts:45`) is dead at runtime; no `can()`/`cannot()` checks execute; per-role permission gating is non-functional.
- Fix approach: Add `PermissionsProvider` to the provider tree in `main.tsx:11-18`; refactor to use a custom `useAbility()` hook gated by `auth-store.role`.

### TD-2. Divergent Data Layer (Static Mocks vs. API Client)

- Issue: Feature modules inconsistently read data. `apps/web/src/features/trucks/index.tsx:31-42` imports a static `trucks[]` array; `apps/web/src/features/dashboard/index.tsx:45` calls `buildDashboardView()` with local mock builders. Other features use `@lpg/api-client`.
- Files: `apps/web/src/features/trucks/index.tsx:31-42`, `apps/web/src/features/trucks/data/*`, `apps/web/src/features/dashboard/index.tsx:45`
- Impact: The 124-endpoint API client (`packages/api-client/src/api.ts`) is unexercised for several domains; data is frozen fixture data, not live.
- Fix approach: Route all feature data through `@lpg/api-client`; delete `features/*/data/*.ts` static mocks.

### TD-3. Stale Mirror Tree (109 Dead Files)

- Issue: 109 git-tracked files at `apps/web/{components,config,context,module,roles,routes,store}/` mirror `apps/web/src/{same}` but are NOT compiled by Vite or in `tsconfig.app.json` `include`.
- Files: `apps/web/components/`, `apps/web/config/`, `apps/web/context/`, `apps/web/module/`, `apps/web/roles/`, `apps/web/routes/`, `apps/web/store/` (top-level, sibling to `src/`)
- Impact: Confuses new developers; 2× code maintenance; stale duplicates drift from `src/` versions; risk of editing the wrong file.
- Fix approach: Delete the top-level mirror directories (verify nothing external imports them); keep only `apps/web/src/`.

### TD-4. Stale ESLint importOrder Config

- Issue: `apps/web/eslint.config.mjs` `importOrder` references `@/stores`, `@/api`, `@/constants`, `@/components/layouts` — none of these alias groups exist (actual: `@/store`, `@/lib`, `@/components/layout`).
- Files: `apps/web/eslint.config.mjs`
- Impact: ESLint import-order rules never fire correctly; developers get no import-sorting enforcement.
- Fix approach: Update `importOrder` groups to match real `@/` subpaths (`@/lib`, `@/components/layout`, `@/store`, `@/features`, `@/config`).

---

## Known Bugs

### BUG-1. Role Switcher Links Are 404

- Symptoms: Role switcher navigates to `/${slug}` (e.g., `/super-admin`) instead of `/_authenticated/${slug}/...`.
- Files: `apps/web/src/components/layout/role-switcher.tsx`
- Trigger: Click any role in the dropdown switcher.
- Workaround: Manually edit URL to `/_authenticated/[role]/[module]`.

### BUG-2. Sidebar Reflects URL Role, Not Session Role

- Symptoms: `app-sidebar.tsx:16-17` reads `role-store.activeRole`, which is initialized to `'SUPER_ADMIN'` and only changes when the user edits the URL. Any authenticated user can view another role's sidebar by navigating to that role's URL.
- Files: `apps/web/src/components/layout/app-sidebar.tsx:16-17`, `apps/web/src/store/role-store.ts:13`
- Trigger: Log in as `supervisor@lpg.cm`, navigate to `/_authenticated/super-admin/tour-physique`.
- Workaround: None — RBAC is cosmetic only.

### BUG-3. Production Deploys Fake Backend

- Symptoms: `vercel.json` forces `VITE_API_MODE=fake`; the production build routes all API calls through `packages/api-client/src/fake-adapter.ts` (in-browser generator), never reaching the Express mock server.
- Files: `vercel.json`, `packages/api-client/src/fake-adapter.ts`
- Trigger: Deploy to Vercel; observe no network calls to a real API.
- Workaround: None — the published app shows entirely synthetic data.

---

## Security Considerations

### SEC-1. alg:none JWTs with No Expiration

- Risk: `packages/mock-api/src/jwt.ts:24,27` issues JWTs with `alg: "none"` (no signature) and no `exp` validation in `handlers.ts`. A valid token never expires and cannot be revoked.
- Files: `packages/mock-api/src/jwt.ts:24,27`, `packages/mock-api/src/handlers.ts`
- Current mitigation: None
- Recommendations: This is acceptable ONLY for a dev mock. Ensure `VITE_API_MODE=fake` is never the shipping default; rotate to a signed, expiring JWT in `SEC-1` before any production deployment.

### SEC-2. Hardcoded Demo Credentials in Source

- Risk: `packages/mock-data/src/fixtures-auth.ts:16-22` and `apps/web/src/routes/login.tsx:27-28` contain hardcoded demo passwords (all `password`).
- Files: `packages/mock-data/src/fixtures-auth.ts:16-22`, `apps/web/src/routes/login.tsx:27-28`
- Current mitigation: None
- Recommendations: Replace with a credential lookup against a seeded store; never commit real credentials. At minimum, gate login behind `VITE_API_MODE === 'fake'`.

### SEC-3. Client-Side Authorization Is Decorative

- Risk: Because CASL `PermissionsProvider` is dead code (`TD-1`) and the URL `:role` segment is not validated against the session, authorization is entirely cosmetic. Any authenticated user can view any role's screens and data.
- Files: `apps/web/src/main.tsx:11-18`, `apps/web/src/routes/_authenticated/$role/$module.tsx`
- Current mitigation: None
- Recommendations: Wire `PermissionsProvider` into `main.tsx`; add a `beforeLoad` guard on the `_authenticated` route that compares the URL `:role` against the session `auth-store.role`.

### SEC-4. Envelope Mismatch Can Bypass Auth Checks

- Risk: `packages/api-client/src/http-adapter.ts:84` reads `res.data.donnees`, but `CONCERNS.md` §Adapter Mismatch notes some servers return `data`. A mismatched response yields `undefined` silently — no error thrown.
- Files: `packages/api-client/src/http-adapter.ts:84`, `packages/types/src/index.ts:434`
- Current mitigation: None
- Recommendations: Normalize envelope on the server side (`handlers.ts`) and add a runtime assertion in the adapter.

---

## Performance Bottlenecks

### PERF-1. Fake Adapter Regenerates All Data Per Request

- Problem: `packages/api-client/src/fake-adapter.ts` regenerates full datasets (routes, tours, checkpoints, anomalies) on every call using `@faker-js/faker`. For large tables this is O(n) per render.
- Files: `packages/api-client/src/fake-adapter.ts`
- Cause: No caching layer between fake adapter and feature components.
- Improvement path: Memoize the generated dataset (zustand cache) keyed by request params; or pre-generate once at app init.

---

## Fragile Areas

### FRAG-1. RBAC Sidebar Visibility

- Files: `apps/web/src/config/rbac/sidebar-by-role.ts:39-57` (`getSidebarData`, `roleFromSlug`)
- Why fragile: Adds a new role requires edits in 3 places (`packages/permissions` enum, `sidebar-by-role.ts` `ROLE_SLUGS`, `roles/manifest.ts`); missing any one → silent `undefined` sidebar.
- Safe modification: Add the role to all three registries atomically; add a test that asserts every `Role` value has a matching slug and sidebar.
- Test coverage: None — `sidebar-by-role.ts` has no test.

### FRAG-2. API Client Endpoint Catalog

- Files: `packages/api-client/src/api.ts` (124 endpoints)
- Why fragile: Single file, ~1000+ lines; adding an endpoint means editing this file and the matching handler in `packages/mock-api/src/handlers.ts`. No compile-time cross-check between the two.
- Safe modification: Add a `zod` schema per endpoint and validate handler response shape in tests.
- Test coverage: None for endpoint↔handler consistency.

### FRAG-3. Module→Screen Registry

- Files: `apps/web/src/module/module-screen.tsx:19`, `apps/web/src/roles/manifest.ts`, `apps/web/src/module/module-registry.ts`
- Why fragile: `generateMockRows(def)` derives a module's table schema from a `def` object; renaming a column key breaks runtime silently (no type error surfaced to the table).
- Safe modification: Co-locate the column schema next to the row generator; type-check columns against data.
- Test coverage: None.

---

## Scaling Limits

### SCALE-1. In-Memory Mock API Data

- Current capacity: `packages/mock-api/src/server.ts` keeps data in-process; resets on restart; lost on every deploy (production doesn't even use it — `SEC`/BUG-3).
- Limit: Any state mutation (tour start, anomaly resolve) is lost on server restart.
- Scaling path: Introduce a real backend with a persisted store.

### SCALE-2. Single Zustand Store for All Features

- Current capacity: `apps/web/src/store/auth-store.ts` + `role-store.ts` — small state, fine.
- Limit: Feature modules manage local component state independently; no shared cache for cross-feature data (e.g., a tour's checkpoints shared between `tours` and `checkpoints` features).
- Scaling path: Centralize shared entity caches in `@tanstack/react-query` (already installed) with a single source per entity type.

---

## Dependencies at Risk

### RISK-1. TypeScript 6.0.3 (Unstable Major)

- Risk: `apps/web/package.json` pins `typescript@6.0.3`; `pnpm-lock.yaml` resolved 6.0.3. TypeScript 6.x was not yet stable at the lock's resolution date.
- Impact: Potential breaking `tsc` errors in `verbatimModuleSyntax`, `rewrite` rules; transitive deps may fail to compile.
- Migration plan: Pin to `typescript@5.9.3` (the version present in the rest of the graph) until 6.x is GA + tested.

### RISK-2. @arcgis/core 5.14 Bundle Weight

- Risk: Esri arcgis core is a large bundle shipped to the browser. If map rendering is not core to every screen, this inflates TTI.
- Files: `apps/web/src/components/map/`
- Migration plan: Code-split `@arcgis/core` behind dynamic `import()`; lazy-load only on map screens.

---

## Missing Critical Features

### MISS-1. No Real API Endpoints (CSPH §8 Gap)

- Problem: `packages/api-client/src/api.ts` is missing endpoints required by `CSPH_GPL_Master_Prompt.md` §8:
  - `POST /tours/:id/acknowledge` (tour acknowledgement)
  - `GET /organizations` + `GET /clients` + `GET /client-sites` (org/client hierarchy)
  - No WebSocket channel (`/ws`) for live tour/checkpoint updates
  - No `client-sites` resource (referenced by `integration-phase`)
  - No MinIO pre-signed download flow (blobs come from static `/assets/`)
  - No Grafana iframe embed component for supervisor infra dashboards (supervisor infra uses faker-generated rows instead)
  - No real-time anomaly assignment beyond the 2 stubbed endpoints in `api.ts`
- Blocks: Full CSPH §8 compliance; supervisor real dashboard; client-site integration flow.
- Recommendation: Add the missing endpoints to `packages/api-client/src/api.ts` and matching handlers to `packages/mock-api/src/handlers.ts`; implement a `GrafanaEmbed` component in `apps/web/src/components/`.

### MISS-2. No CI/CD Pipeline

- Problem: No `.github/workflows/*.yml`, no GitLab CI config — `pnpm test` and `pnpm build` are not automated.
- Blocks: Regression gating; the dead-CASL and stale-importOrder issues (`TD-1`, `TD-4`) would have been caught by CI lint/test.
- Recommendation: Add `.github/workflows/ci.yml` running `pnpm lint`, `pnpm typecheck`, `pnpm test -- --run`.

---

## Test Coverage Gaps

### GAP-1. RBAC Sidebar Visibility Untested

- What's not tested: `roleFromSlug`, `getSidebarData`, `ROLE_SLUGS` round-trip.
- Files: `apps/web/src/config/rbac/sidebar-by-role.ts:39-57`
- Risk: New roles silently produce empty/undefined sidebars; BUG-2 goes undetected.
- Priority: High

### GAP-2. Role Switcher / Layout Untested

- What's not tested: `role-switcher.tsx` link prefixing; `app-sidebar.tsx` sourcing from `activeRole` vs session role.
- Files: `apps/web/src/components/layout/role-switcher.tsx`, `apps/web/src/components/layout/app-sidebar.tsx:16-17`
- Risk: BUG-1 and BUG-2 regressions.
- Priority: High

### GAP-3. API Client ↔ Mock API Consistency Untested

- What's not tested: The 124 endpoints in `packages/api-client/src/api.ts` match handlers in `packages/mock-api/src/handlers.ts`; envelope (`donnees`) is consistent.
- Files: `packages/api-client/src/api.ts`, `packages/mock-api/src/handlers.ts:36,43`
- Risk: `SEC-4` envelope mismatch; missing endpoints (`MISS-1`) go unnoticed.
- Priority: Medium

### GAP-4. Auth Flow Untested

- What's not tested: Login with demo credentials → `alg:none` JWT issuance → `requireAuth` guard → session persistence.
- Files: `apps/web/src/routes/login.tsx:27-28`, `packages/mock-api/src/jwt.ts:24,27`, `packages/mock-api/src/handlers.ts`
- Risk: `SEC-1`, `SEC-2` regressions; production ships `VITE_API_MODE=fake` silently.
- Priority: High

### GAP-5. PermissionsProvider Dead-Code Not Caught

- What's not tested: `PermissionsProvider.tsx` / `AbilityContext.ts` are never imported.
- Files: `apps/web/src/context/PermissionsProvider.tsx`, `apps/web/src/main.tsx:11-18`
- Risk: CI lint/test did not flag unreachable authorization code.
- Priority: High

---

*Concerns audit: 2026-08-03*
