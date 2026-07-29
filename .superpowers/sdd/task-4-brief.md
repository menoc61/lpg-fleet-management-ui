Task 4: Adopt @lpg/ui — backward-compat shim

Goal: Wire up @lpg/ui workspace package and ensure every existing import path in apps/web/ resolves correctly.

Global Constraints:
- All commits must be atomic
- pnpm -F @lpg/web typecheck must pass (0 errors)
- Existing import paths like @/components/data-table/* must still resolve
- Every @/components/ui/* and @/components/data-table/* import must work

## Context
The packages/ui/ was already copied from source in Task 2. The remaining work is:
1. Verify @lpg/ui typechecks
2. Add @lpg/ui path alias to apps/web/tsconfig.app.json
3. Wire backward-compat shim for target-only components

## Steps:

### Step 1: Verify @lpg/ui typechecks
pnpm -F @lpg/ui typecheck (or cd packages/ui && tsc --noEmit)

### Step 2: Add @lpg/ui alias to apps/web/tsconfig.app.json
Add to paths: "@lpg/ui": ["../../packages/ui/src/index.ts"]

### Step 3: Create backward-compat re-exports
The target has local copies of data-table components at apps/web/src/components/data-table/*.tsx.
The @lpg/ui package also exports data-table at @lpg/ui/data-table.

To avoid breaking existing imports like `@/components/data-table/pagination`, create a re-export shim:
apps/web/src/components/data-table/pagination.tsx:
```
export { DataTablePagination } from '@lpg/ui/data-table'
```
(Similarly for each data-table component that exists both locally and in @lpg/ui)

### Step 4: Run typecheck + build for apps/web/
pnpm -F @lpg/web typecheck
pnpm -F @lpg/web build

### Step 5: Return DONE

## Verification:
- pnpm -F @lpg/web typecheck passes
- pnpm -F @lpg/web build produces dist/