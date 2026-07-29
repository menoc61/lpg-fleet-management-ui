Task 3: Move existing app into apps/web/

Goal: Relocate all current target repo files (src/, configs, index.html, vercel.json, etc.) into apps/web/ so the existing SPA becomes the monorepo's web app.

Architecture: The target repo currently has src/ at root level. Source convention (per AGENTS.md and tsconfig.app.json) is that apps/web/* contains the app root, with @/* resolving to ./* inside apps/web/.

Tech Stack: Same as current target.

Global Constraints:
- All commits must be atomic
- After moving, pnpm -F @lpg/web typecheck must still pass
- After moving, pnpm -F @lpg/web lint must show same 4 errors + 1 warning as baseline
- After moving, pnpm -F @lpg/web build must produce apps/web/dist/
- After moving, pnpm -F @lpg/web test must pass with same count
- Backward-compat shim: target-only files (components/data-table/*, components/select-dropdown.tsx, etc.) must still resolve

## Steps:

### Step 1: Create apps/web/ directory
```
mkdir apps/web
```

### Step 2: Move all app files from root into apps/web/
Move these from root to apps/web/:
- src/ (entire directory)
- public/ (entire directory, if exists)
- index.html
- .env
- .env.example
- eslint.config.js → will be replaced with eslint.config.mjs from source later
- vite.config.ts
- tsconfig.json
- tsconfig.app.json
- tsconfig.node.json
- vercel.json → will be updated later
- components.json
- tanstack-table.d.ts → already at src/ level? check and move accordingly
- All other config files at root level that are part of the app

DO NOT move:
- .gitignore (root level)
- package.json (root level - this is the monorepo root)
- pnpm-workspace.yaml (created in Task 1)
- turbo.json (created in Task 1)
- vercel.json (root level - different from apps/web/vercel.json)
- docs/ (kept at root)
- .superpowers/ (kept at root)
- Any scripts/ directory created in Task 1

### Step 3: Update vite.config.ts in apps/web/
Change the resolve.alias path from `./src` to `.`:
Find: `path.resolve(__dirname, './src')`
Replace: `path.resolve(__dirname, '.')`

### Step 4: Update tsconfig.app.json in apps/web/
Change paths so that @/* resolves to ./* (not ./src/*):
```json
"paths": {
  "@/*": ["./*"]
}
```
Also add @lpg/* aliases for the workspace packages:
```json
"paths": {
  "@/*": ["./*"],
  "@lpg/types": ["../../packages/types/src/index.ts"],
  "@lpg/config": ["../../packages/config/src/index.ts"],
  "@lpg/permissions": ["../../packages/permissions/src/index.ts"],
  "@lpg/api-client": ["../../packages/api-client/src/index.ts"],
  "@lpg/ui": ["../../packages/ui/src/index.ts"]
}
```

### Step 5: Update index.html in apps/web/
Check if <script> src path needs updating (from "./src/main.tsx" or similar to "./main.tsx").

### Step 6: Replace apps/web/eslint.config.js with source's eslint.config.mjs
Copy the source eslint.config.mjs. This changes the config format.

### Step 7: Run typecheck from apps/web/
```
cd apps/web && node_modules/.bin/tsc.cmd --noEmit -p tsconfig.app.json
```
Expected: same result as baseline (should pass since the only change is file location).

### Step 8: Run lint from apps/web/
```
cd apps/web && node_modules/.bin/eslint.cmd .
```
Expected: same 4 errors + 1 warning as baseline.

### Step 9: Run build from apps/web/
```
cd apps/web && node_modules/.bin/vite.cmd build
```
Expected: bundle produced in apps/web/dist/.

### Step 10: Run tests from apps/web/
```
cd apps/web && node_modules/.bin/vitest.cmd run --browser.headless
```
Expected: same test count as baseline.

### Step 11: Create apps/web/vercel.json (mirror of root vercel.json for standalone deploys)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "pnpm turbo run build --filter @lpg/web",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "env": {
    "VITE_API_MODE": "fake"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 12: Commit all changes
```
git add -A
git commit -m "feat: move app into apps/web/ (monorepo app shell)"
```

## Verification:
- pnpm -F @lpg/web typecheck passes
- pnpm -F @lpg/web lint shows same baseline issues
- pnpm -F @lpg/web build produces apps/web/dist/
- pnpm -F @lpg/web test passes with same count