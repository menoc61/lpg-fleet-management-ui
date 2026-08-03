# Coding Conventions

**Analysis Date:** 2026-08-03

## Naming Patterns

**Files:**
- kebab-case for routes/screens: `apps/web/src/components/layout/app-sidebar.tsx`, `role-switcher.tsx`, `app-header.tsx`, `app-topbar.tsx`
- lowercase route files: `login.tsx`, `index.tsx`, `$module.tsx`, `$role` directories
- `__tests__/` for test directories (e.g., `apps/web/src/lib/__tests__/`)
- `*.test.ts` (unit) / `*.test.tsx` (component/browser)

**Functions:**
- camelCase: `getSidebarData`, `handleLogin`, `roleFromSlug`, `roleSlug`, `requireAuth`, `cn`
- React components PascalCase: `AppSidebar`, `RoleSwitcher`, `PermissionsProvider`, `ThemeProvider`, `generateMockRows`

**Variables:**
- camelCase: `activeRole`, `ROLE_PERMISSIONS`, `sidebarData`
- Constants screaming snake: `ROLE_SLUGS`, `API_BASE_URL`, `VITE_API_MODE`

**Types:**
- PascalCase for types/interfaces: `ApiEnvelope`, `Role`, `ResourceType`, `Pagination`
- `packages/types/src/index.ts:434` defines `ApiEnvelope`
- `packages/permissions/src/index.ts` defines `Role`, `PermissionAction`, `Permission`

## Code Style

**Formatting:**
- Tool: Prettier 4-space indent, single quotes, 80 char width, trailing commas
- `apps/web/.prettierrc` (config exists — NOT read for secrets; it contains only style keys)
- Consistent 2-level indentation in JSX/TSX

**Linting:**
- Tool: ESLint (flat config `apps/web/eslint.config.mjs`)
- Key rules inferred: import ordering via `import/order` (stale refs — see CONCERNS.md)
- `eslint-config` shared package: `packages/eslint-config/`

**TypeScript:**
- Strict mode (`apps/web/tsconfig.app.json:29`)
- Path alias: `@/` → `./src/*`
- No `any` in public packages (enforced in `@lpg/types`, `@lpg/api-client`)

## Import Organization

**Order:**
1. External packages (react, @tanstack/*, axios)
2. Internal packages (`@lpg/api-client`, `@lpg/types`, `@lpg/permissions`)
3. `@/` aliased imports (lib, components, store, features)
4. Relative imports (`./`, `../`)

**Path Aliases:**
- `@/` — `apps/web/src/`
- `@lpg/api-client` — `packages/api-client/src/index.ts`
- `@lpg/types` — `packages/types/src/index.ts`
- `@lpg/permissions` — `packages/permissions/src/index.ts`
- `@lpg/config` — `packages/config/src/`
- `@lpg/ui` — `packages/ui/src/`

**Known issue:** `apps/web/eslint.config.mjs` `importOrder` references stale groups (`@/stores`, `@/api`, `@/constants`, `@/utils`, `@/components/layouts`) — some don't exist (store is `@/store`, not `@/stores`). See CONCERNS.md.

## Error Handling

**Patterns:**
- `handle-server-error` utility (`apps/web/src/lib/handle-server-error.ts`) — maps API error → toast notification
- `QueryClient` `onError`/`onSettled` hooks wired in `apps/web/src/main.tsx`
- Route `loader` throws for unauthenticated access; caught by router boundary
- `requireAuth` guard in `packages/mock-api/src/handlers.ts` — validates token presence (token-only, no role check)

## Logging

**Framework:** Browser `console` (no structured logging transport)

**Patterns:**
- `console.error` for route load failures
- Error boundary renders toast via `handle-server-error`
- No centralized logger

## Comments

**When to Comment:**
- JSDoc on public package exports (`@lpg/api-client`, `@lpg/types`, `@lpg/permissions`)
- Inline `//` for non-obvious RBAC logic
- Minimal commenting observed — most code is self-documenting

**JSDoc/TSDoc:**
- Present on `packages/api-client/src/api.ts` resource service methods
- Sparse in feature components

## Function Design

**Size:**
- Feature pages: 100–300 lines (`features/trucks/index.tsx`, `features/dashboard/index.tsx`)
- Large files: `packages/api-client/src/api.ts` (124 endpoints, ~1000+ lines)

**Parameters:**
- Destructured object params for complex inputs
- `roleFromSlug(roleSlug: string)`, `getSidebarData(role: Role)` — single typed param

**Return Values:**
- Promise-wrapped API calls return `Promise<ApiEnvelope<T>>` (donnees-wrapped)
- React hooks return `{ data, error, isLoading }` (TanStack Query)

## Module Design

**Exports:**
- Barrel pattern in packages: `packages/*/src/index.ts` exports everything
- `@lpg/types/index.ts` — single canonical type source

**Barrel Files:**
- Used in `packages/api-client/src/index.ts`, `packages/types/src/index.ts`, `packages/permissions/src/index.ts`
- Used in `apps/web/src/` for lib re-exports (`src/lib/index.ts`)

**Component Exports:**
- Default export for route pages (`index.tsx`)
- Named exports for reusable components (`AppSidebar`, `RoleSwitcher`)

---

*Convention analysis: 2026-08-03*
