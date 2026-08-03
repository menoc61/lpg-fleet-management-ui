# Technology Stack

**Analysis Date:** 2026-08-03

## Languages

**Primary:**
- TypeScript 5.9.3 — source files across `apps/web/src/**` and `packages/**/src/**`
- TypeScript 6.0.3 — direct dependency pinned in `apps/web/package.json` / `pnpm-lock.yaml` (note: 6.x is newer than the canonical 5.9.3 line; lock resolved to 6.0.3)

**Secondary:**
- JavaScript (mjs) — config files (`vite.config.ts` is TS, `eslint.config.mjs`, `tailwind.config.ts`)

## Runtime

**Environment:**
- Node.js (project requires Node; no `.nvmrc` or `.node-version` present)
- Browser — Vite dev server (in-browser) and Playwright `chromium` for tests

**Package Manager:**
- pnpm 9.0.0
- Lockfile: `pnpm-lock.yaml` present (workspace)

## Frameworks

**Core:**
- React 19.2.8 — UI library (`react`, `react-dom`)
- TanStack Router 1.170.18 — client router (`@tanstack/react-router`); routes live in `apps/web/src/routes/_authenticated/$role/$module.tsx`

**Testing:**
- Vitest 4.1.10 — test runner (`vite.config.ts` `test` block)
- Vitest Browser 4.1.10 — `@vitest/browser-playwright` (chromium headless)

**Build/Dev:**
- Vite 8.1.5 — bundler/dev server (`apps/web/vite.config.ts`)
- Turborepo 2.10.5 — monorepo task runner (`turbo` in root)

## State Management

- Zustand 5.0.14 — stores: `apps/web/src/store/auth-store.ts`, `apps/web/src/store/role-store.ts`
- TanStack Query 5.101.4 — `@tanstack/react-query` (cache for API data)

## Map/GIS

- @arcgis/core 5.1.14 — Esri GIS rendering (`apps/web/src/components/map/`)

## UI

- Tailwind CSS 4.3.3 — utility classes
- shadcn/ui components via `@/components/ui` (Radix primitives)
- Lucide React 1.27.0 — icons (`lucide-react`)
- React Hook Form 7.x + Zod 4.4.3 — form validation

## Tables

- TanStack Table 8.21.3 — `@tanstack/react-table` (data tables)

## Authorization

- CASL 6.8.1 — `@casl/ability` (ability definition)
- CASL React 7.0.1 — `@casl/react` (ability context/provider)

## Mock / Fake Backends

- Faker 10.5.0 — `@faker-js/faker` (data generation)
- Express 4.x (`packages/mock-api`) — local API server on `localhost:8787`

## HTTP / Data Fetching

- Axios 1.x — `packages/api-client/src/http-adapter.ts`, resource services in `packages/api-client/src/api.ts`

## Key Dependencies

**Critical:**
- `@lpg/permissions` (`packages/permissions/src/index.ts`) — `ROLE_PERMISSIONS` matrix, `Role`/`Permission` types
- `@lpg/api-client` (`packages/api-client/src/api.ts`) — 124 mapped REST endpoints
- `@lpg/types` (`packages/types/src/index.ts`) — `ApiEnvelope`, `Role`, `ResourceType`
- `@lpg/mock-data` (`packages/mock-data/src/index.ts`) — seed data + `fixtures-auth.ts`

**Infrastructure:**
- `@lpg/mock-api` (`packages/mock-api/src/server.ts`) — Express fake backend
- `@lpg/ui` — shared UI component library
- `@lpg/config` — shared configuration

## Configuration

**Environment:**
- Vite native env: `VITE_API_MODE=fake` (forced by `vercel.json` → production runs the in-browser fake backend)
- `apps/web/src/lib/api-constants.ts` — `API_BASE_URL` (read from `VITE_API_BASE_URL`)
- Env vars: `.env`, `.env.production`, `.env.development`, `.env.docker` (existence only — contents not read)
- `vercel.json` at root — defines `VITE_API_MODE=fake` build env override

**Build:**
- `apps/web/vite.config.ts` — Vite + `@tanstack/react-router-vite-plugin` + Vitest browser config
- `apps/web/tsconfig.app.json` — strict TS, `@/` → `./src/*`
- `apps/web/tsconfig.json` + `tsconfig.node.json` (extends app)
- `apps/web/eslint.config.mjs` — flat config ESLint
- `apps/web/.prettierrc` — Prettier (4-space indent, single quotes, 80 width)
- `apps/web/tailwind.config.ts` — Tailwind v4 config
- `root turbo.json` — Turborepo pipeline definitions
- `pnpm-workspace.yaml` — workspace layout

## Platform Requirements

**Development:**
- pnpm 9.0.0
- Node.js (unspecified minimum; modern LTS expected, Node 20+)
- Vite dev server serves `localhost:5173` (default)
- Mock API server on `localhost:8787` (`packages/mock-api/src/server.ts`)

**Production:**
- Target: Vercel (root `vercel.json` present)
- NOTE: `vercel.json` forces `VITE_API_MODE=fake` → production build uses in-browser fake adapter
  (`packages/api-client/src/fake-adapter.ts`), bypassing the Express mock-API server entirely

---

*Stack analysis: 2026-08-03*
