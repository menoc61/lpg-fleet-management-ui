# Task 3 Report: Move existing app into apps/web/

## Summary

Successfully relocated all app files from root to `apps/web/` and configured the monorepo app shell.

## Steps Completed

### Step 1: Create apps/web/ directory
Already existed with all files moved in.

### Step 2: Move app files from root to apps/web/
All files moved: `src/`, `public/`, `index.html`, `.env`, `.env.example`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `components.json`, `eslint.config.mjs` (already `.mjs`)

### Step 3: Update vite.config.ts alias
Changed `@` alias from `'.'` to `'./src'` (files are under `src/`, not flattened)

### Step 4: Update tsconfig.app.json paths
Changed `@/*` from `./*` to `./src/*` (corrected per file layout)
Kept `@lpg/*` workspace aliases

### Step 5: Update index.html
Script src is `/src/main.tsx` (absolute path from web root) — no change needed

### Step 6: Replace eslint config with source
Copied source `eslint.config.mjs` from `C:\Users\DTA_WorkStation\Documents\lpg-fleet-management-ui\apps\web\eslint.config.mjs`

### Step 7: Create apps/web/vercel.json
Created with `pnpm turbo run build --filter @lpg/web` build command

### Step 8: Update apps/web/package.json
Added missing dependencies: `@radix-ui/react-*` (13 packages), `@tanstack/react-table`, `react-top-loading-bar`, `@tailwindcss/vite`

## Verification Results

| Check | Status | Details |
|-------|--------|---------|
| **typecheck** | ✅ PASS | `tsc --noEmit -p tsconfig.app.json` — 0 errors |
| **lint** | ⚠️ 2 errors, 9 warnings | 2 errors: `sidebar.tsx` (Math.random purity), `trip-route-map.tsx` (mutation in effect) |
| **build** | ✅ PASS | Produced `apps/web/dist/` with `index.html` |
| **test** | ❌ ENV | Found 9 test files but Playwright chromium_headless_shell-1217 not installed (download timeout) |

## Notes

- **Alias change**: Brief specified `./*` but files remain under `apps/web/src/`. Changed to `./src/*` to resolve correctly.
- **Lint variance**: Brief expected 4 errors + 1 warning (baseline from original eslint config). After replacing with source config (per Step 6), actual is 2 errors + 9 warnings.
- **Missing deps**: Several packages (`@tanstack/react-table`, `@radix-ui/react-*`, `react-top-loading-bar`, `@tailwindcss/vite`) were missing from `apps/web/package.json` and added to resolve typecheck/build.
- **Test env**: Tests require Playwright headless shell download which timed out — environment limitation, not code issue.

## File Changes

- Created: `apps/web/vercel.json`
- Modified: `apps/web/vite.config.ts`, `apps/web/tsconfig.app.json`, `apps/web/eslint.config.mjs`, `apps/web/package.json`
