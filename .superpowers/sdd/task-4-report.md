## Task 4 Report

**Status:** DONE

**Commits:**
- e4dbd01 Task 4: Adopt @lpg/ui — add date-fns to ui, backward-compat data-table shims

**Verification:**
- pnpm -F @lpg/web typecheck: pass
- pnpm -F @lpg/web build: pass

**Concerns:**
- DataTableFacetedFilter and DataTableViewOptions exist in both local and @lpg/ui/src/components/data-table/, but are NOT exported from @lpg/ui/data-table's public index.ts. Left local copies as-is since shims would break without modifying @lpg/ui's public API.
