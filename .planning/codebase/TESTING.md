# Testing Patterns

**Analysis Date:** 2026-08-03

## Test Framework

**Runner:**
- Vitest 4.1.10
- Config: `apps/web/vite.config.ts` (`test {}` block), plus `@vitest/browser-playwright`

**Assertion Library:**
- Vitest built-in `expect`/`test`/`describe`/`it`
- React Testing utilities inferred via `@vitest/browser` (Vite 4 uses built-in browser mode)

**Run Commands:**
```bash
pnpm test                 # Run all tests (workspace root)
pnpm --filter lpg-web test              # Web app only
pnpm test -- --ui           # (if UI mode configured)
pnpm test -- --coverage     # Coverage report (vitest --coverage not currently in package.json scripts)
```
Observed test scripts in `apps/web/package.json`:
- `test` → `vitest`
- `test:browser` → `vitest --browser`

## Test File Organization

**Location:**
- Unit tests co-located in source: `apps/web/src/lib/__tests__/*.test.ts`
- Component/feature tests co-located: `apps/web/src/features/routes/routes.test.tsx`, `apps/web/src/features/dashboard/dashboard.test.tsx`
- Store tests: `apps/web/src/store/__tests__/auth-store.test.ts`, `role-store.test.ts`
- Browser-mode tests: `*.test.tsx` (run via `@vitest/browser-playwright` chromium headless)

**Naming:**
- `*.test.ts` — unit logic (no JSX)
- `*.test.tsx` — React component tests (browser mode)
- All under `src/` (not a separate `tests/` directory)
- `vite.config.ts` `test.exclude` excludes `src/routes` (route files are entry points, not imported into tests)

**Structure:**
```
apps/web/src/
├── lib/__tests__/
│   ├── utils.test.ts
│   ├── cookies.test.ts
│   └── handle-server-error.test.ts
├── features/
│   ├── routes/routes.test.tsx
│   └── dashboard/dashboard.test.tsx
├── store/__tests__/
│   ├── auth-store.test.ts
│   └── role-store.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
// apps/web/src/lib/__tests__/utils.test.ts (representative)
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });
});
```

**Patterns:**
- `describe` → `it` blocks
- `expect(x).toBe()` / `.toEqual()` / `.toContain()` strict assertions
- Setup via top-level `vi.hoisted` or inline stubs (no global fixtures file observed)

## Mocking

**Framework:** Vitest native mocks (`vi.fn()`, `vi.mock()`)

**Patterns:**
```typescript
// Inferred from store tests — auth-store.test.ts
vi.mock("@/lib/utils", () => ({
  getToken: vi.fn(() => "mock-token"),
}));

// Inferred pattern for API — module mock
vi.mock("@lpg/api-client", () => ({
  api: { getTour: vi.fn(() => Promise.resolve({ donnees: mockTour })), },
}));
```

**What to Mock:**
- `@lpg/api-client` — to avoid real network
- `@/lib/utils` cookie/storage helpers
- `@/store/*` selectors via `useStore.getState()` mutation

**What NOT to Mock:**
- `@/lib/utils` pure helpers (e.g., `cn`) — tested directly
- `@/lib/handle-server-error` — tested for toast mapping
- React component internals (tests use `@vitest/browser` to render real DOM)

## Fixtures and Factories

**Test Data:**
```typescript
// Inferred from dashboard.test.tsx pattern
const mockDashboardData = {
  donnees: { toursEnCours: [], anomalies: [] },
  pagination: { page: 1, total: 0 },
};
```
- Data defined inline per-test or in a local `const` at the top of the test file
- Some fixtures may import from `packages/mock-data/src/`

**Location:**
- Inline in test file (co-located), no shared `fixtures/` directory observed

## Coverage

**Requirements:** None enforced (no `coverage` script; no `c8`/`istanbul` config, no CI gate)

**View Coverage:**
```bash
pnpm test -- --coverage
npx vitest run --coverage
```

## Test Types

**Unit Tests:**
- Scope: pure utility functions (`cn`), cookie helpers, `handle-server-error`, store state logic
- Runners: Vitest (no browser)

**Integration Tests:**
- Scope: feature screens with mocked API (`routes.test.tsx`, `dashboard.test.tsx`)
- Runners: `@vitest/browser-playwright` chromium headless
- Render real React components with `@vitest/browser` `render()` + queries

**E2E Tests:**
- Not used — no Playwright/TestCafe/Cypress config detected

## Common Patterns

**Async Testing:**
```typescript
// Inferred from store tests
it("updates state after fetch", async () => {
  const result = await store.fetchSomething();
  expect(result).toEqual(expected);
});
```
- `await` on async mocks
- `vi.waitFor` not observed in sampled files (tests rely on synchronous store reads)

**Error Testing:**
```typescript
// Inferred from handle-server-error.test.ts
it("maps 401 to auth error toast", () => {
  const err = { response: { status: 401 } };
  expect(handleServerError(err).variant).toBe("destructive");
});
```
- `handle-server-error` tested as a pure function mapping `{response:{status:N}}` → toast props
- No `try/catch` testing observed in component tests

---

*Testing analysis: 2026-08-03*
