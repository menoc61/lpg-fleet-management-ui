# Subagent-Driven Development Progress Ledger

Branch: working tree on `eaf0a10ad2ca3df1da1b213ebc47eb102caaad6a` (no commit yet for the feature).
Plan: `docs/superpowers/plans/2026-08-10-national-map-superadmin.md`
Spec: `docs/superpowers/specs/2026-08-10-national-map-superadmin-design.md`

## Tasks

- [x] Task 1: complete (PERMISSION_CATALOG `national-map.read` added, tests 17/17, typecheck clean)
- [x] Task 2: complete (shared map utils created; trucks-map refactored to use them; new tests pass)
- [ ] Task 3: utils/popup.tsx
- [x] Task 4: complete (`data/client-sites.ts` view-builder created; markerTypeFor heuristic flagged, harmless)
- [x] Task 5: complete (TDD red→green `data/geo-anomalies.ts`; env-wide vitest browser port-bind EACCES noted)
- [ ] Task 6: lib/regions.ts
- [ ] Task 7: lib/vrac-volume.ts (+test) TDD
- [ ] Task 8: data/national-map.ts (+test)
- [ ] Task 9: lib/layers.ts (+test) TDD
- [ ] Task 10: wire map nav item to `national-map.read`
- [ ] Task 11: filter panel, summary strip, legend, layer toggles
- [ ] Task 12: national-map.tsx + index.tsx + route
- [ ] Task 13: final verification (typecheck, lint, test)

## Environment notes

- vitest browser mode fails with `EACCES: permission denied ::1:<port>` in this sandbox (reproduced in Tasks 2 and 5). Workaround: run tests via a temporary Node-only config (`--config vitest.local.config.ts`, browser disabled), then delete the temp config. Permanent fix: fold `environment: node` / `browser.enabled: false` into the canonical vitest config or use `npm run test:unit -- --browser=false` if supported. Not a code defect.

## Minor findings (carried forward)

- `features/sites/utils/site-graphics.ts` still has its own duplicate `getLpgMarkerIcon`/`getSiteIconUrl`/`getSiteOutlineColor`/`svgToDataUri` alongside the canonical `siteMarkerTokens`. Out of Task 2 scope; flagged for later dedup pass.
- Task 4 `markerTypeFor` matches `client_org_id` against `'marketeur'`/`'client'`, but fixture org ids (e.g. `org-0012-shc------0000000000001`) contain neither substring. All sites resolve to `'client-other'`, which is harmless (field unused by popup/layer logic today) but indicates the fixture-naming convention doesn't match the heuristic — flag for follow-up review of the type-detection heuristic.
