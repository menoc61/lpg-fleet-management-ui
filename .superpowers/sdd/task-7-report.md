## Task 7 Report

**Status:** DONE

**Commits:**
- cec8ddd feat(web): adopt CASL permissions system

**Verification:**
- typecheck: pass
- lint: fail — 2 pre-existing errors (sidebar.tsx:613 `Math.random` purity, trip-route-map.tsx:113 ref modification) not related to this task; all 11 warnings are pre-existing react-refresh/only-export-components and @typescript-eslint/no-explicit-any
- build: pass

**Concerns:**
None. Lint failures are pre-existing in files not modified by this task.
