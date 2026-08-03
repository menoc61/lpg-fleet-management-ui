# Codebase Structure

**Analysis Date:** 2026-08-03

## Directory Layout

```
lpg-fleet-management-ui/
├── apps/
│   └── web/                     # Vite + React 19 + TanStack Router frontend
│       ├── src/
│       │   ├── routes/          # TanStack Router routes
│       │   │   └── _authenticated/
│       │   │       └── $role/   # Role-param routes ($role/$module.tsx, -layout.tsx)
│       │   ├── components/      # UI + layout
│       │   │   ├── layout/      # app-sidebar, role-switcher, app-header, app-topbar
│       │   │   └── ui/          # shadcn/ui primitives
│       │   ├── features/        # Feature modules (trucks, tours, checkpoints, etc.)
│       │   │   ├── trucks/      #   includes data/*.ts static mocks
│       │   │   ├── dashboard/
│       │   │   ├── checkpoints/
│       │   │   └── .../
│       │   ├── store/           # Zustand stores (auth-store, role-store, sidebar-store)
│       │   ├── context/         # React contexts (PermissionsProvider, AbilityContext, ThemeProvider)
│       │   ├── config/          # RBAC: roles.ts, sidebar-by-role.ts, role-permissions
│       │   ├── module/          # Module registry (module-screen.tsx, custom-screens.tsx)
│       │   ├── roles/           # roles/manifest.ts (custom-screen registry)
│       │   ├── lib/             # api-constants, utils, handle-server-error, cn, etc.
│       │   ├── assets/          # static images
│       │   ├── hooks/           # custom React hooks
│       │   ├── styles/          # global CSS / tailwind
│       │   ├── main.tsx         # React entry (Router + Query + Theme providers)
│       │   └── app.tsx          # Router component
│       ├── vite.config.ts       # Vite + TanStack Router plugin + Vitest browser config
│       ├── tsconfig.app.json    # strict TS, @/ → ./src/*
│       ├── eslint.config.mjs    # flat ESLint config (stale importOrder)
│       ├── .prettierrc          # Prettier (4-space, single quotes)
│       ├── tailwind.config.ts   # Tailwind v4
│       ├── index.html           # HTML shell
│       └── package.json         # web-specific deps
├── packages/                    # pnpm workspace packages
│   ├── api-client/              # @lpg/api-client — REST client (124 endpoints)
│   │   └── src/
│   │       ├── api.ts           # resource services + endpoint catalog
│   │       ├── http-adapter.ts  # axios adapter (reads res.data.donnees)
│   │       ├── fake-adapter.ts  # in-browser fake backend
│   │       └── index.ts
│   ├── types/                   # @lpg/types — shared TS types
│   │   └── src/index.ts         # ApiEnvelope (donnees), Role, ResourceType, etc.
│   ├── permissions/             # @lpg/permissions — RBAC matrix
│   │   └── src/index.ts         # Role, PermissionAction, ResourceType, ROLE_PERMISSIONS
│   ├── config/                  # @lpg/config — shared config
│   ├── ui/                      # @lpg/ui — shared component library
│   ├── mock-api/                # @lpg/mock-api — Express fake backend (:8787)
│   │   └── src/
│   │       ├── server.ts        # Express app
│   │       ├── handlers.ts      # route handlers (envelope: donnees, requireAuth)
│       ├── jwt.ts              # JWT issuance (alg:none)
│   │       └── routes.ts
│   ├── mock-data/               # @lpg/mock-data — seed + fixtures
│   │   └── src/
│   │       ├── index.ts         # seed data
│   │       └── fixtures-auth.ts # demo credentials
│   └── eslint-config/           # shared ESLint config
├── package.json                 # root (pnpm workspace)
├── pnpm-workspace.yaml          # workspace layout
├── pnpm-lock.yaml               # lockfile (v9)
├── turbo.json                   # Turborepo pipelines
├── vercel.json                  # Vercel config (forces VITE_API_MODE=fake)
├── .gitignore
└── README.md
```

## Directory Purposes

**`apps/web/src/`:** All frontend source. Compiled by Vite. Only `./src/` is in `tsconfig.app.json` `include`; everything outside `src/` at `apps/web` is NOT compiled.

**`apps/web/src/routes/_authenticated/$role/`:** Role-based router. `$role` URL segment selects which sidebar/screens render. `$module.tsx` dynamically renders a feature.

**`apps/web/src/components/layout/`:** Authenticated shell UI — sidebar, header, topbar, role-switcher.

**`apps/web/src/features/`:** Vertical feature slices. Each has `index.tsx` (page) and may have `data/*.ts` (static mocks). This is a **divergent data source** from `packages/api-client`.

**`apps/web/src/store/`:** Zustand stores — `auth-store.ts` (token + role), `role-store.ts` (activeRole default `SUPER_ADMIN`), `sidebar-store.ts`.

**`apps/web/src/context/`:** React contexts — `PermissionsProvider.tsx` (CASL, **DEAD — never imported**), `AbilityContext.ts`, `ThemeProvider.tsx`.

**`apps/web/src/config/rbac/`:** RBAC config — `roles.ts`, `sidebar-by-role.ts` (ROLE_SLUGS, roleFromSlug, getSidebarData), `role-permissions.ts`.

**`apps/web/src/module/`:** Module → screen registry — `module-screen.tsx` (renders module page), `custom-screens.tsx`, `module-registry.ts`.

**`apps/web/src/roles/`:** `manifest.ts` — custom-screen registry keyed by role.

**`packages/api-client/src/`:** Typed REST client. `api.ts` exports resource services; `http-adapter.ts` (axios) and `fake-adapter.ts` (in-browser) implement the transport.

**`packages/types/src/index.ts`:** Canonical types — `ApiEnvelope` (with `donnees` key), `Role`, `ResourceType`, pagination types.

**`packages/permissions/src/index.ts`:** `Role` type + `ROLE_PERMISSIONS` matrix + CASL `defineAbility`.

**`packages/mock-api/src/`:** Express server (`server.ts`) exposing `/api/v1/*` on `localhost:8787`; in-memory data; JWT via `alg:none` (`jwt.ts`); handlers (`handlers.ts`).

**`packages/mock-data/src/`:** Static seed data (`index.ts`) + auth fixtures (`fixtures-auth.ts`).

## Key File Locations

**Entry Points:**
- `apps/web/src/main.tsx`: React mount, provider wiring (Router, QueryClient, Theme — NOT PermissionsProvider)
- `apps/web/src/app.tsx`: Root router component

**Configuration:**
- `apps/web/vite.config.ts`: Vite + `@tanstack/react-router-vite-plugin` + Vitest browser settings (`test.exclude` of `src/routes`)
- `apps/web/tsconfig.app.json:29`: strict, `@/` → `./src/*`
- `apps/web/eslint.config.mjs`: flat ESLint config — NOTE stale `importOrder` refs `@/stores`, `@/api`, `@/constants`, `@/utils`, `@/components/layouts` (these alias groups don't all exist)
- `apps/web/.prettierrc`: Prettier config
- `apps/web/tailwind.config.ts`: Tailwind v4
- `turbo.json` (root): Turborepo pipeline
- `vercel.json` (root): forces `VITE_API_MODE=fake`
- `pnpm-workspace.yaml` (root): workspace `packages/*` + `apps/*`

**Core Logic:**
- `packages/api-client/src/api.ts`: 124 endpoint catalog (tourStart/Close/Replay, checkpointReach/Skip, recordScan, anomalyResolve/Assign, etc.)
- `packages/api-client/src/http-adapter.ts:84`: reads `res.data.donnees`
- `packages/api-client/src/fake-adapter.ts`: in-browser fake backend (used in production build)
- `apps/web/src/config/rbac/sidebar-by-role.ts:39-57`: ROLE_SLUGS, roleFromSlug, getSidebarData
- `apps/web/src/roles/manifest.ts`: custom-screen registry
- `apps/web/src/module/module-screen.tsx:19`: `generateMockRows(def)` — mock data for tables

**RBAC / Auth:**
- `packages/permissions/src/index.ts:9,45`: Action/Resource types, ROLE_PERMISSIONS
- `apps/web/src/store/auth-store.ts`: token + role storage
- `apps/web/src/store/role-store.ts:13`: `activeRole:'SUPER_ADMIN'` (hardcoded default)
- `apps/web/src/routes/login.tsx:27-28`: hardcoded demo credentials
- `apps/web/src/components/layout/app-sidebar.tsx:16-17`: sidebar from `activeRole`
- `apps/web/src/components/layout/role-switcher.tsx`: navigates `/${slug}` (BUG: missing `/_authenticated/` prefix)

**Mock Backend:**
- `packages/mock-api/src/server.ts`: Express, port 8787, `/api/v1`
- `packages/mock-api/src/handlers.ts:36,43`: envelope `donnees`, `requireAuth` (token-only check)
- `packages/mock-api/src/jwt.ts:24,27`: `alg:none`, `.mock` signature
- `packages/mock-data/src/fixtures-auth.ts:16-22`: demo credentials

**Testing:**
- `apps/web/src/lib/__tests__/utils.test.ts`, `cookies.test.ts`, `handle-server-error.test.ts`
- `apps/web/src/features/routes/routes.test.tsx`, `dashboard.test.tsx`
- `apps/web/src/store/__tests__/auth-store.test.ts`, `role-store.test.ts`

## Naming Conventions

**Files:** kebab-case for routes (`$module.tsx` → module slugs), lowercase for pages; `*.test.ts`/`*.test.tsx` for tests.

**Directories:** kebab-case (`features/trucks`, `components/layout`, `_authenticated`).

**Functions:** camelCase (React components PascalCase: `AppSidebar`, `RoleSwitcher`).

## Where to Add New Code

**New Feature:**
- Primary code: `apps/web/src/features/<feature>/index.tsx`
- Tests: co-located `apps/web/src/features/<feature>/__tests__/*.test.tsx` (matches existing `routes.test.tsx`, `dashboard.test.tsx`)
- Local mocks (if any): `apps/web/src/features/<feature>/data/*.ts` (NOTE: prefer wiring through `@lpg/api-client` instead — see CONCERNS.md)

**New Component:**
- UI primitives: `apps/web/src/components/ui/`
- Layout/feature components: `apps/web/src/components/<area>/`

**New API Endpoint:**
- Add service to `packages/api-client/src/api.ts` (keep the 124-endpoint catalog)
- Add handler to `packages/mock-api/src/handlers.ts`

**New Shared Type:**
- `packages/types/src/index.ts` (canonical — keep single source of truth)

**New Role / Permission:**
- `packages/permissions/src/index.ts` (`ROLE_PERMISSIONS` matrix)
- `apps/web/src/config/rbac/sidebar-by-role.ts` (ROLE_SLUGS, sidebar visibility)

## Special Directories

**`apps/web/src/components/layout/` (top-level at `apps/web/`):**
- Purpose: DEAD mirror tree — 109 git-tracked files at `apps/web/{components,config,context,module,roles,routes,store}/` duplicate `src/`
- Vite and `tsconfig.app.json` only compile `./src/`; the top-level mirror is NOT compiled
- Not generated; committed; stale

**`.planning/`:**
- Purpose: GSD planning artifacts (this codebase audit lives in `.planning/codebase/`)
- Generated: No (written by `gsd-map-codebase` skill)
- Committed: Yes (tracked by git)

**`.claude/skills/graphify/`:**
- Purpose: `graphify` skill (per CLAUDE.md root instructions)
- Note: unrelated to codebase architecture; a process skill for knowledge-graph ingestion

---

*Structure analysis: 2026-08-03*
