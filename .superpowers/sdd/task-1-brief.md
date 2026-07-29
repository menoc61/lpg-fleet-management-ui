Task 1: Foundation — monorepo skeleton

Goal: Create the monorepo root infrastructure (pnpm-workspace.yaml, turbo.json, root package.json, vercel.json, .gitignore update, scripts/dev-kill.js stub).

Architecture: Standard pnpm 9 + turbo 2 monorepo matching source topology.

Tech Stack: pnpm@9.0.0, turbo@^2.10.5, vite.

Global Constraints:
- Package manager: pnpm 9.0.0 (from pnpm-workspace.yaml override)
- App name: @lpg/web, version 0.0.0, private true
- All commits must be atomic
- Workspace root @ alias resolves to ./ inside apps/web/
- vercel.json at root filters build to @lpg/web; output is apps/web/dist

## Files to create/modify:

### Create: pnpm-workspace.yaml
From source. Exact content:
```yaml
packages:
  - "apps/*"
  - "packages/*"

overrides:
  "@types/react": "19.2.14"
  "@types/react-dom": "19.2.3"
  react: "19.2.5"
  "react-dom": "19.2.5"
  "react-hook-form": "7.73.1"
```

### Create: turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Create: root package.json
```json
{
  "name": "lpg-fleet-platform",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "predev": "node scripts/dev-kill.js",
    "dev": "turbo run dev",
    "dev:kill": "node scripts/dev-kill.js",
    "mock": "turbo run dev --filter @lpg/mock-api",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "devDependencies": {
    "prettier": "^3.2.5",
    "turbo": "^2.10.5"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### Create: root vercel.json
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "pnpm turbo run build --filter @lpg/web",
  "outputDirectory": "apps/web/dist",
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

### Modify: .gitignore
Append /.turbo at the end if not already present.

### Create: scripts/dev-kill.js (minimal stub)
Since the root package.json references scripts/dev-kill.js which does not exist yet, create a minimal stub:
```js
// scripts/dev-kill.js — stub until proper kill script is added
console.log('dev-kill stub');
```

## Steps (each 2-5 min):

- [ ] Write pnpm-workspace.yaml
- [ ] Write turbo.json
- [ ] Write root package.json
- [ ] Write root vercel.json
- [ ] Create scripts/dev-kill.js stub
- [ ] Run `pnpm install` — verify no peer-dep errors
- [ ] Append /.turbo to .gitignore if missing
- [ ] Commit: git add pnpm-workspace.yaml turbo.json package.json vercel.json .gitignore scripts/dev-kill.js && git commit -m "chore: add monorepo skeleton (pnpm-workspace, turbo, vercel)"

## Verification:
- pnpm install succeeds cleanly
- pnpm -r typecheck (packages/* should pass with empty stubs; apps/web may fail — that is expected since it has not been moved yet)
- No uncommitted changes after commit