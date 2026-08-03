<!-- refreshed: 2026-08-03 -->
# Architecture

**Analysis Date:** 2026-08-03

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Browser / UI Layer                        │
│  apps/web/src/ (Vite + React 19 + TanStack Router)           │
├──────────────────┬──────────────────┬───────────────────────┤
│   Role Screens   │   Shared         │   Feature Modules     │
│  src/routes/     │   Components     │  src/features/         │
│  src/components/ │  src/lib/        │  src/features/trucks/  │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Packages Layer                           │
│         packages/  (pnpm workspace)                        │
├────────────┬─────────────┬────────────┬────────┬───────────┤
│ api-client │ permissions │ types      │ config │ ui        │
│   @lpg     │   @lpg      │   @lpg     │ @lpg   │  @lpg     │
├────────────┴─────────────┴────────────┴────────┴───────────┤
│                    Mock Backend Layer                       │
│      packages/mock-api  |  packages/mock-data               │
│      (@lpg)   Express :8787  in-memory                    │
└─────────────────────────────────────────────────────────────┘
```

> **Architecture verdict:** This is a **Vite + TanStack Router monorepo with a
> client-side RBAC router and dual data layers (API client vs. local static
> mocks)**. Despite a `graphify` skill entry at root, this is NOT a Next.js
> application — there is no `next.config.*`, no `app/`, no `pages/` in `apps/web`.
> The only framework is React via Vite.

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Role-based Router | URL-param-driven RBAC routing (`/_authenticated/:role/:module`) | `apps/web/src/routes/_authenticated/$role/$module.tsx` |
| Role Layout | Authenticated shell: header + sidebar + content outlet | `apps/web/src/routes/_authenticated/$role/-layout.tsx` |
| App Sidebar | Sidebar built from `activeRole` (zustand, NOT session role) | `apps/web/src/components/layout/app-sidebar.tsx` |
| Role Switcher | Dropdown to switch URL slug role | `apps/web/src/components/layout/role-switcher.tsx` |
| PermissionsProvider (DEAD) | Builds CASL ability from session role | `apps/web/src/context/PermissionsProvider.tsx` |
| ApiClient | Axios-based HTTP adapter + 124 resource services | `packages/api-client/src/api.ts`, `http-adapter.ts` |
| FakeAdapter | In-browser fake backend (no network) | `packages/api-client/src/fake-adapter.ts` |
| Mock API Server | Express in-memory API on localhost:8787 | `packages/mock-api/src/server.ts` |
| RBAC Manifest | `role → screens[]` registry | `apps/web/src/roles/manifest.ts` |
| Module Registry | Module slug → screen component | `apps/web/src/module/` |

## Pattern Overview

**Overall:** Client-side React SPA with role-based URL routing + shared packages.

**Key Characteristics:**
- **Role-as-URL-param:** `:role` URL segment drives which screens/sidebar render
- **Dual data-layer:** API client (`packages/api-client`) vs. local static mocks (`src/features/*/data/*.ts`) — features inconsistently choose between them
- **Package boundaries:** `pnpm` workspace; `@lpg/*` internal packages
- **Mock-first:** Production (`vercel.json`) runs the in-browser fake adapter; the Express mock server is dev-only

## Layers

**Presentation / Routing (`apps/web/src/routes/`):**
- Purpose: Route matching + auth gating via `requireAuth` loader
- Location: `apps/web/src/routes/_authenticated/$role/$module.tsx`, `apps/web/src/routes/_authenticated/$role/-layout.tsx`
- Contains: Route components, layout, guards
- Depends on: `@lpg/types`, `@lpg/permissions`, feature modules
- Used by: The whole app's router

**Layout / Shell (`apps/web/src/components/layout/`):**
- Purpose: App header, sidebar, role switcher
- Location: `apps/web/src/components/layout/`
- Contains: `app-sidebar.tsx`, `role-switcher.tsx`, `app-header.tsx`, `app-topbar.tsx`
- Depends on: `role-store`, `sidebar-by-role` config, `@lpg/ui`
- Used by: Route layout

**Feature Modules (`apps/web/src/features/`):**
- Purpose: Per-domain screens (trucks, tours, checkpoints, anomalies, dashboard, etc.)
- Location: `apps/web/src/features/*/index.tsx`
- Contains: Page components + local `data/*.ts` static mocks
- Depends on: `@lpg/api-client` (selected features), local static data (others)
- Used by: Router

**Data / API Client (`packages/api-client/`):**
- Purpose: Typed REST client with 124 mapped endpoints
- Location: `packages/api-client/src/api.ts`, `http-adapter.ts`, `fake-adapter.ts`
- Contains: Resource services + adapters
- Depends on: `axios`, `@lpg/types`
- Used by: Feature modules (selectively)

**RBAC / Permissions (`packages/permissions/`):**
- Purpose: `Role` enum, `PermissionAction`/`Resource`, `ROLE_PERMISSIONS` matrix
- Location: `packages/permissions/src/index.ts`
- Contains: CASL ability factory, role-permission matrix
- Depends on: `@casl/ability`, `@lpg/types`
- Used by: `apps/web/src/config/rbac/`, layout, (intended) routes guard

**Shared Packages (`packages/ui`, `packages/config`, `packages/types`):**
- Purpose: Reusable primitives, config, shared types
- Location: `packages/{ui,config,types}/src/`
- Used by: All layers

## Data Flow

### Primary Request Path (role-gated screen)

1. User navigates to `/_authenticated/sup-gestion/tour-physique` (`apps/web/src/routes/_authenticated/$role/$module.tsx`)
2. Route `beforeLoad`/`loader` calls `requireAuth` (auth guard) — checks `auth-store` token only
3. `-layout.tsx` renders `AppSidebar` (`apps/web/src/components/layout/app-sidebar.tsx:16`) — sidebar derived from `role-store.activeRole`, not the authenticated user's role
4. `$module.tsx` resolves component via `module-registry` (`apps/web/src/module/module-screen.tsx:19`) → `features/[module]/index.tsx`
5. Feature renders using **local static data** (`features/*/data/*.ts`) for some modules, **API client** for others (inconsistent)
6. If `VITE_API_MODE=fake`: API calls route to `packages/api-client/src/fake-adapter.ts` (in-browser, no network)

### Auth / Mock-API Flow (dev only)

1. Login page (`apps/web/src/routes/login.tsx:27-28`) submits hardcoded demo credentials
2. `@lpg/mock-api/src/handlers.ts` validates credentials, issues `alg:none` JWT
3. JWT stored in `auth-store` (zustand + persistence)
4. Protected routes check `auth-store` token via `requireAuth`

## Key Abstractions

**ApiEnvelope (canonical response wrapper):**
- Purpose: Normalize all API responses to `{ donnees: T, pagination?, meta? }`
- Examples: `packages/types/src/index.ts:434`
- Pattern: Envelope with `donnees` key (NOT `data`)
- Consumers: `packages/api-client/src/http-adapter.ts:84` reads `res.data.donnees`
- WARNING: `CONCERNS.md` § Adapter Envelope Mismatch lists servers that return `data` instead

**Role type:**
- Purpose: Union of all user roles
- Examples: `packages/types/src/index.ts:3-10` (source of truth)
- Enum variants: `SUPER_ADMIN`, `ADMIN`, `SUPERVISOR`, `INTEGRATEUR`, `AGENT`, `MARKETEU`, `R`, `livreur`
- WARNING: Uses `SUPER_ADMIN` (snake_case), violating convention of `SUPERADMIN`/no-underscore roles; see `CONCERNS.md` § Role Naming

## Entry Points

**`apps/web/index.html`** — HTML shell

**`apps/web/src/main.tsx`** — React mount, provider order:
- `apps/web/src/main.tsx:11-18` — `RouterProvider` + `QueryClientProvider` + `ThemeProvider`
- NOTE: `PermissionsProvider` (`context/PermissionsProvider.tsx`) is **defined but never imported** into `main.tsx` → CASL ability is dead code

**`apps/web/src/routes/login.tsx`** — login page (auth entry)

## Architectural Constraints

- **Threading:** Single-threaded browser event loop; no workers
- **Global state:** Two zustand stores (`auth-store.ts`, `role-store.ts`); `role-store.activeRole` initialized to `'SUPER_ADMIN'` (hardcoded default) — `apps/web/src/store/role-store.ts:13`
- **Circular imports:** Not detected during audit
- **Role-as-URL vs. session role:** The `role` URL segment is the UI context switch, but `role-store.activeRole` is NOT derived from the authenticated session — switching role in URL does not re-auth; see `CONCERNS.md` § RBAC Model
- **Build-time mock enforcement:** `vercel.json` forces `VITE_API_MODE=fake` — no production path reaches the Express mock server

## Anti-Patterns

### 1. Dead CASL Provider

**What happens:** `context/PermissionsProvider.tsx` and `context/AbilityContext.ts` build a CASL `Ability` from `@lpg/permissions`, but are never imported in `apps/web/src/main.tsx`.
**Why it's wrong:** Authorization logic is computed but never applied at runtime; the `ROLE_PERMISSIONS` matrix is dead.
**Do this instead:** Import `PermissionsProvider` in `main.tsx:11-18` and inject `useAbility` into layout/routes.

### 2. Static Mock Data in Features

**What happens:** `apps/web/src/features/trucks/index.tsx:31-42` imports a static `trucks[]` array from `features/trucks/data/*.ts` instead of calling `@lpg/api-client`.
**Why it's wrong:** Two divergent data sources; API client stays unexercised; "production" data is frozen fixture data.
**Do this instead:** Route all feature data through `packages/api-client` and deprecate local `data/*.ts` mocks.

### 3. Sidebar Driven by URL Role, Not Session

**What happens:** `app-sidebar.tsx:16-17` reads `role-store.activeRole` (default `'SUPER_ADMIN'`); `role-switcher.tsx` navigates to `/${slug}` without the `/_authenticated/` prefix.
**Why it's wrong:** Sidebar reflects whatever role is in the URL/dropdown, not who the user authenticated as — any logged-in user can view any role's sidebar by editing the URL.
**Do this instead:** Derive `activeRole` from the decoded JWT / `auth-store.role` and fix the switcher to navigate `/_authenticated/${slug}/...`.

## Error Handling

**Strategy:** `handle-server-error` utility + `onError` toast in query client.

**Patterns:**
- `apps/web/src/lib/handle-server-error.ts` — maps API error → toast
- `apps/web/src/main.tsx` `onError`/`onSettled` hooks on `QueryClientProvider`
- Route `loader` throws for unauthenticated access; caught by router boundary

## Cross-Cutting Concerns

**Logging:** Browser `console` (no transport)
**Validation:** Zod (`packages/types`) + `@/lib/utils` helpers
**Authentication:** JWT (`alg:none`) stored in zustand `auth-store`

---

*Architecture analysis: 2026-08-03*
