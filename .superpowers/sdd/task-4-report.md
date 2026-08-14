# Task 4 Report — Create `features/map/data/client-sites.ts`

**Status:** DONE

## Files created
- `apps/web/src/features/map/data/client-sites.ts`

## Verification
- Field contracts confirmed against JSON fixtures before writing:
  - `client_sites` (`03_sites_and_client_sites.json`, line 814): `id`, `client_org_id`, `region`, `name`, `address`, `geo_point` ([lng, lat]), `is_active`, `current_marketeur_org_id`.
  - `organizations` (`01_organizations.json`, line 83): exported as `organizations` with `id`, `name`, `type`.
- File read back verbatim (68 lines) — matches the brief code exactly.
- Transform style mirrors `features/sites/data/sites.ts` (REGION_LABELS + cityFromAddress).

## Typecheck command + output
Command:
```bash
cd apps/web && npm run typecheck
```
Output (full, exit 0):
```
> typecheck
> tsc --noEmit -p tsconfig.app.json
```
No diagnostics emitted. Exit code: 0.

## Summary (one line)
Typecheck PASS, 0 errors; `client-sites.ts` view-builder created and matches brief spec.

## Concerns
1. **`markerTypeFor` logic may never match real fixture data.** The brief defines marker typing by string-matching `clientSite.client_org_id` against `'marketeur'` / `'client'`. The actual fixture `client_org_id` values are opaque org ids (e.g. `org-0012-shc------0000000000001`) and do **not** contain `marketeur` or `client`; the marketeur relationship is carried on `current_marketeur_org_id` (e.g. `org-0002-sctm-0000-000000000001`, which contains neither substring either since it is `...-sctm-...`). So every client site currently resolves to `markerType: 'client-other'`. This is faithful to the brief's exact code, but the intended classification appears unmet by the seed. Flagged for Task 5 / follow-up review of the type-detection heuristic.

## Next
Continue to Task 5 (geo-anomalies). No commit performed.
