# Phase 1: Fixtures Infrastructure - Context

**Gathered:** 2026-08-03
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase installs the curated CSPH GPL fixture set as the frontend's single, active data source. It replaces the discarded `seed-extended.ts` and the old `packages/mock-data/src/seed/*.json` files, wires the 9 validated JSON fixtures into the mock-data barrel, fixes placeholder image/PDF URLs, and preserves the cross-referenced ID validity (0-error profile from `00_INDEX.md`). It does NOT build any page UI — pages consume the fixtures in later phases.

</domain>

<decisions>
## Implementation Decisions

### Fixture Placement
- **D-01:** Curated fixture JSON files live in `packages/mock-data/src/seed/` — the existing barrel aggregator in `packages/mock-data/src/index.ts` is retained as the single export point.
- **D-02:** Old seed data is deleted once the curated fixtures are wired: `packages/mock-data/src/seed-extended.ts` and the previous `packages/mock-data/src/seed/*.json` files are removed. Nothing stays as an unreferenced duplicate.
- **D-03:** Fixture files are named by domain slug (e.g. `organizations.json`, `users-roles.json`, `sites-client-sites.json`, `vehicles-drivers.json`, `devices.json`, `delivery-tours.json`, `compliance.json`, `anomalies.json`, `notifications.json`) — NOT the numbered source names (`01_…`).
- **D-04:** The repo copy is the single source of truth. Fixtures are copied from `C:/Users/DTA_WorkStation/Downloads/json_fixture/` into the repo and adjusted to match the app's data shapes/types. The app never reads the external Downloads path at runtime — no absolute-path dependency.

### Folded Todos
- **Use curated JSON fixtures for frontend data** — folded from `.planning/todos/pending/2026-08-03-use-curated-json-fixtures-for-frontend-data.md` (resolves_phase: 1). Scope: replace `seed-extended.ts` with the curated set; this phase is where the swap happens.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Fixture Data Contract
- `C:/Users/DTA_WorkStation/Downloads/json_fixture/00_INDEX.md` — authoritative schema + counts + cross-reference validation for the 9 fixture files (0 errors). Source of truth for what each file contains and how IDs link across files.
- `C:/Users/DTA_WorkStation/Downloads/json_fixture/01_organizations.json` — organizations + regions (15 orgs, 10 regions).
- `C:/Users/DTA_WorkStation/Downloads/json_fixture/02_users_and_roles.json` — system roles, permissions, users, MFA, integration auth.
- `C:/Users/DTA_WorkStation/Downloads/json_fixture/03_sites_and_client_sites.json` — sites, clients, client sites.
- `C:/Users/DTA_WorkStation/Downloads/json_fixture/04_vehicles_and_drivers.json` — vehicles + drivers.
- `C:/Users/DTA_WorkStation/Downloads/json_fixture/05_devices.json` — devices (GPS, PDA, RFID).
- `C:/Users/DTA_WorkStation/Downloads/json_fixture/06_delivery_tours.json` — transporter contracts, pickup requests, delivery tours, checkpoints, scan events.
- `C:/Users/DTA_WorkStation/Downloads/json_fixture/07_compliance.json` — declarations, reconciliations, redressements, risk scores.
- `C:/Users/DTA_WorkStation/Downloads/json_fixture/08_anomalies.json` — anomalies + assignments (25: 15 INVESTIGATION / 10 TECHNICAL).
- `C:/Users/DTA_WorkStation/Downloads/json_fixture/09_notifications.json` — notification groups, members, rules, notifications.

### Codebase References
- `packages/mock-data/src/index.ts` — existing seed barrel aggregator that exports `seeds: Record<SeedName, unknown[]>` and `AUTH_FIXTURES`; this is the wiring point that must be re-pointed at the curated fixtures.
- `packages/mock-data/src/fixtures-auth.ts` — demo credentials per role (7 users incl. TRANSPORTEUR); kept as the auth fixture.
- `packages/api-client/src/fake-adapter.ts` — in-browser fake backend used in production (`VITE_API_MODE=fake`); consumes the seed data.
- `packages/mock-api/src/server.ts` + `handlers.ts` + `db.ts` — Express fake backend on :8787; consumes the seed data via `db.ts`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/mock-data/src/index.ts` — the `seeds: Record<SeedName, unknown[]>` barrel that all consumers (fake-adapter, mock-api) already read from; re-pointing this map is the primary integration move.
- `packages/mock-data/src/fixtures-auth.ts` — role-keyed demo credentials, already includes TRANSPORTEUR; unchanged.
- `packages/api-client/src/fake-adapter.ts` — in-browser adapter that serves seed collections to the UI; will pick up the new fixture data automatically once the barrel is re-pointed.

### Established Patterns
- **Barrel aggregator:** `packages/*/src/index.ts` is the canonical export point for every package (mock-data, types, permissions, api-client). New fixture exports must flow through `index.ts`.
- **Envelope pattern:** API responses wrap data under `donnees` (`ApiEnvelope` in `packages/types`); fixture data served through fake-adapter/mock-api must respect the envelope shape.
- **UPPERCASE enum values:** FR business labels; state-machine status values must stay exact (see ROADMAP Phase 6+). Fixture data already uses the real enums.

### Integration Points
- `packages/mock-data/src/index.ts` — swap the seed collection to curated fixtures; old files deleted.
- `packages/mock-api/src/db.ts` — the fake backend's in-memory DB; if it imports specific seed names, update to the new names.
- `packages/api-client/src/fake-adapter.ts` — consumes the barrel; verify it needs no shape changes for the curated data.

</code_context>

<specifics>
## Specific Ideas

- "We got a lot of nonsense data" — the old seed (randomized RFID via `Math.random()`, mojibake accents, short IDs) must be fully gone, not just shadowed.
- "Work only with fix comprehensive json" — the curated, validated fixture set is the exclusive data source for the frontend; page-by-page interface work happens in later phases, not here.
- Placeholder URLs: fixture image/PDF links should render via `https://placehold.net/default.png` (per `00_INDEX.md` note).

</specifics>

<deferred>
## Deferred Ideas

- **ID scheme normalization (UUID vs short IDs)** — raised as a potential gray area; the curated fixtures use UUID-style IDs (`a1b2c3d4-…`) while old seed used short IDs (`org-1`). Not decided here; resolved during planning/implementation for cross-phase consistency (FX-03).
- **Consumption path depth** — whether pages consume via fake-adapter (in-browser) vs Express mock-api; not decided here — the established barrel pattern serves both, so it's a later-phase concern.

### Reviewed Todos (not folded)
- None — the single pending todo was folded into Phase 1 scope.

</deferred>

---

*Phase: 1-Fixtures Infrastructure*
*Context gathered: 2026-08-03*
