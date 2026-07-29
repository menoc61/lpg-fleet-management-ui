Task 2: Shared packages skeleton

Goal: Create the 7 shared workspace packages (types, config, permissions, api-client, mock-data, mock-api, ui) with exact content from the source repo.

Architecture: Each package is a self-contained workspace with package.json, tsconfig.json, and src/index.ts matching source.

Tech Stack: pnpm 9, workspace protocol.

Global Constraints:
- Package manager: pnpm 9.0.0
- All commits must be atomic
- Each package must have package.json + tsconfig.json + src/index.ts
- Versions must match source exactly (no ^ or ~ unless source uses them)
- After all packages are scaffolded, pnpm -r typecheck must pass for all packages

## Each of the 7 packages needs:
- package.json (from source)
- tsconfig.json (from source)
- src/index.ts (from source)

## Source paths (use these exact paths to copy from):
- types: C:\Users\DTA_WorkStation\Documents\lpg-fleet-management-ui\packages\types\
- config: C:\Users\DTA_WorkStation\Documents\lpg-fleet-management-ui\packages\config\
- permissions: C:\Users\DTA_WorkStation\Documents\lpg-fleet-management-ui\packages\permissions\
- api-client: C:\Users\DTA_WorkStation\Documents\lpg-fleet-management-ui\packages\api-client\
- mock-data: C:\Users\DTA_WorkStation\Documents\lpg-fleet-management-ui\packages\mock-data\
- mock-api: C:\Users\DTA_WorkStation\Documents\lpg-fleet-management-ui\packages\mock-api\
- ui: C:\Users\DTA_WorkStation\Documents\lpg-fleet-management-ui\packages\ui\

## Steps:
1. Copy each package's files from source to local packages/<pkg>/ (overwrite stubs from Task 2 init)
2. pnpm install to regenerate lockfile
3. pnpm -r typecheck — verify all packages pass
4. Commit all 7 packages together (one atomic commit since they are scaffolded in one logical unit)

## Verification:
- pnpm -r typecheck passes for all packages
- No peer-dep errors
- Each package's package.json has correct name and private: true