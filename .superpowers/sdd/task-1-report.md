## Task 1 Report

**Status:** DONE

**Commits:**
- 63a065d chore: add pnpm-workspace.yaml with package overrides
- c6dc081 chore: add turbo.json with build, lint, and dev config
- a93e092 chore: add monorepo root package.json with turbo scripts
- 3205f16 chore: add root vercel.json for @lpg/web build filtering
- 09fc537 chore: add scripts/dev-kill.js stub
- 2d34243 chore: add /.turbo to .gitignore

**Test summary:**
- pnpm install: pass
- pnpm -r typecheck (packages only): pass (no packages found yet — expected for skeleton)

**Concerns:** none