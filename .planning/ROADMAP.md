# Roadmap: CSPH GPL Traceability — Frontend Rebuild on Curated Fixtures

## Overview

This milestone rebuilds and verifies the CSPH LPG traceability frontend page-by-page, grounded in the validated JSON fixtures in `Downloads/json_fixture` (9 curated files replacing the discarded `seed-extended.ts`). Each phase swaps one fixture domain into the live data source, designs the correct interface for it, and ships it under the shared RBAC/dynamic-routing architecture. A dedicated foundation phase installs the fixtures source and the design system up front so every later page phase inherits a consistent, responsive, role-gated visual system.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (X.Y): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Fixtures Infrastructure** - Install curated fixtures as the active data source (FX-01..03)
- [ ] **Phase 2: Design System & Layout Foundation** - Design contract + responsive/accessible visual foundation (DSGN-01, DSGN-02)
- [ ] **Phase 3: Organizations & Sites** - Organization hierarchy, sites, and map coordinates (ORG-01..03)
- [ ] **Phase 4: Users & Roles** - Users, MFA, permission matrix, RBAC assignments (USR-01..03)
- [ ] **Phase 5: Fleet & Devices** - Vehicles, drivers, devices, and health states (FLT-01, FLT-02)
- [ ] **Phase 6: Tours & Scans** - Tours, checkpoints, scan events, status enums (TOUR-01..03)
- [ ] **Phase 7: Compliance & Reconciliations** - Declarations, reconciliations, risk scores, subsidy math (COMP-01, COMP-02)
- [ ] **Phase 8: Anomalies** - Dual-track anomaly views + lifecycle + exact enums (ANOM-01..03)
- [ ] **Phase 9: Notifications** - Notification center, groups, rules, filtering (NOTIF-01, NOTIF-02)
- [ ] **Phase 10: TRANSPORTEUR Role** - 8th role end-to-end + tours/vehicles views (TSP-01, TSP-02)
- [ ] **Phase 11: Global Search** - Ctrl+K palette across entities with deep links (SRCH-01, SRCH-02)

## Phase Details

### Phase 1: Fixtures Infrastructure
**Goal**: The frontend's active data source is the validated curated fixture set, replacing `seed-extended.ts`; foreign keys resolve with zero errors.
**Depends on**: Nothing (first phase)
**Requirements**: FX-01, FX-02, FX-03
**Success Criteria** (what must be TRUE):
  1. All nine fixture files in `Downloads/json_fixture` are wired as the frontend data source and `seed-extended.ts` is no longer referenced.
  2. Every fixture image/PDF URL renders through the placeholder service `https://placehold.net/default.png`; no user sees a broken asset link anywhere.
  3. Cross-referenced IDs resolve to real entities across files (orgs ↔ sites ↔ users ↔ tours ↔ anomalies) with the `00_INDEX.md` 0-error profile maintained.
  4. Any page consuming fixture data reflects the curated values, not the old seed data.
**Plans**: TBD

### Phase 2: Design System & Layout Foundation
**Goal**: Every page inherits an agreed, token-based visual system that is responsive down to PDA-class viewports and accessible, per a per-page design contract.
**Depends on**: Phase 1
**Requirements**: DSGN-01, DSGN-02
**Success Criteria** (what must be TRUE):
  1. A documented design contract (UI-SPEC + design tokens: color, type, spacing) exists and is applied consistently across app shell, sidebar, and shared components.
  2. Layout reflows correctly between desktop and PDA-class viewports (navigation + main content remain usable).
  3. Shared components meet basic accessibility checks (keyboard navigable, contrast-correct, labeled controls).
  4. The established design contract holds across all subsequent phases, which each ship their own UI-SPEC referencing this foundation.
  5. Every later page phase ships a design contract (UI-SPEC) as part of "done."
**Plans**: TBD
**UI hint**: yes

### Phase 3: Organizations & Sites
**Goal**: Users can explore the full CSPH/LPG organization hierarchy, operational/client sites, and their map coordinates sourced from the curated fixtures.
**Depends on**: Phase 2
**Requirements**: ORG-01, ORG-02, ORG-03
**Success Criteria** (what must be TRUE):
  1. User can view the organization hierarchy (régulateur CSPH → depots → marketers → transporters → clients) from `01_organizations.json`.
  2. User can view operational sites and client sites (33 operational + 5 client) from `03_sites_and_client_sites.json`.
  3. Site detail surfaces lat/lon coordinates that render at correct Cameroon bounds (lon 8.5–16.5, lat 1.7–13.5).
  4. Organization and site pages render exclusively from curated fixtures (no seed-extended values).
**Plans**: TBD

**UI hint**: yes

### Phase 4: Users & Roles
**Goal**: Users can inspect system users, roles, MFA, integration auth, the permission matrix, and manage assignments consistently with the CASL RBAC matrix.
**Depends on**: Phase 3
**Requirements**: USR-01, USR-02, USR-03
**Success Criteria** (what must be TRUE):
  1. User can view the system users list (32 users, 8 roles, 30+ MFA) with role, MFA status, and integration auth from `02_users_and_roles.json`.
  2. User can view the permission matrix (40 permissions) mapped per role from the fixture and consistent with `packages/permissions` CASL definitions.
  3. Role assignments the user edits are validated against the RBAC matrix (no assignment outside permitted permissions is accepted).
  4. Users are gated by their role such that only permitted roles reach this screen per the dynamic routing map.
**Plans**: TBD

**UI hint**: yes

### Phase 5: Fleet & Devices
**Goal**: Users can inspect vehicles/drivers and devices/health across the fleet, including offline/battery-critical states.
**Depends on**: Phase 4
**Requirements**: FLT-01, FLT-02
**Success Criteria** (what must be TRUE):
  1. User can view the vehicle + driver list (33 vehicles, 12 drivers) with Cameroon plate format (AB1234V) validated from `04_vehicles_and_drivers.json`.
  2. User can view devices (20: GPS, PDA, RFID) with health state from `05_devices.json`.
  3. Device health surfaces offline / battery-critical / GPS-failure states as distinct, clearly labeled states.
  4. Fleet data renders only from curated fixtures.
**Plans**: TBD

**UI hint**: yes

### Phase 6: Tours & Scans
**Goal**: Users can follow the pickup → tour → scan lifecycle with exact state-machine enums, and TRANSPORTEUR can acknowledge pending tours.
**Depends on**: Phase 5
**Requirements**: TOUR-01, TOUR-02, TOUR-03
**Success Criteria** (what must be TRUE):
  1. User can view delivery tours, their checkpoints, and scan events (10 tours, 13 checkpoints, 12 scans) from `06_delivery_tours.json`.
  2. Tour status displays exact state-machine enums (PLANNED, IN_PROGRESS, COMPLETED, etc.) from master prompt §3 — no paraphrased labels.
  3. TRANSPORTEUR can view pending tours and perform the `PENDINGTRANSPORTERACK → ACKNOWLEDGED` acknowledgment transition.
  4. A tour cannot be advanced to a state the §3 state machine disallows given its current state and role.
**Plans**: TBD

**UI hint**: yes

### Phase 7: Compliance & Reconciliations
**Goal**: Users can view declarations, reconciliations, redressements, risk scores, and the subsidy-at-risk math transparently.
**Depends on**: Phase 6
**Requirements**: COMP-01, COMP-02
**Success Criteria** (what must be TRUE):
  1. User can view declarations, reconciliations, redressements, and risk scores (8 declarations, 5 reconciliations, 2 redressements) from `07_compliance.json`.
  2. Reconciliation views surface the volume gap literally (ml vs. reconciled) and label which reconciliations are unresolved.
  3. Subsidy-at-risk math is shown using the fixed rates (1,524 FCFA/bottle, 6,500 FCFA retail) without hardcoded magic numbers (settings-driven).
  4. Compliance data renders from curated fixtures, with risk score rankings ordered and color-coded per the design system.
**Plans**: TBD

**UI hint**: yes

### Phase 8: Anomalies
**Goal**: Users can triage anomalies split into INVESTIGATION vs. TECHNICAL tracks, follow the lifecycle, and recognize exact category enums.
**Depends on**: Phase 7
**Requirements**: ANOM-01, ANOM-02, ANOM-03
**Success Criteria** (what must be TRUE):
  1. User can view the anomalies list (25 anomalies) from `08_anomalies.json` separated into INVESTIGATION vs. TECHNICAL tracks.
  2. Anomaly detail shows the status lifecycle (NOUVEAU → ENCOURS → RESOLU → FERME) and current assignment.
  3. Anomaly category labels are exact enums (SIPHONNAGE, GPSREMOVED, TRANSPORTERNOACK, …) with no paraphrasing or mistyped variants.
  4. Dual-track navigation (sidebar + list) cleanly separates INVESTIGATION from TECHNICAL anomalies.
  5. Anomaly counts/values match the curated fixture (inspected per page before building).
**Plans**: TBD

**UI hint**: yes

### Phase 9: Notifications
**Goal**: Users can expose notification groups, users, rules, and a filterable notification center.
**Depends on**: Phase 8
**Requirements**: NOTIF-01, NOTIF-02
**Success Criteria** (what must be TRUE):
  1. User can view notification groups, members, and rules (9 groups, 21 members, 19 rules) from `09_notifications.json`.
  2. Notification center lists notifications (33) with group, channel, and timestamps from the fixture.
  3. Notification center filters by group type (TECHNICAL, INVESTIGATION, ADMIN, MARKETING, TRANSPORT) and the filter visibly narrows the list.
  4. Unread/read state is visible inline and consistent with fixture channel delivery state.
**Plans**: TBD

**UI hint**: yes

### Phase 10: TRANSPORTEUR Role
**Goal**: TRANSPORTEUR becomes the 8th system role wired across RBAC, sidebar, dashboard, switcher, and manifest, with tours-pending/acknowledgment/assignment views.
**Depends on**: Phase 9
**Requirements**: TSP-01, TSP-02
**Success Criteria** (what must be TRUE):
  1. TRANSPORTEUR appears in the `Role` union and every `Record<Role, …>` map (LABELS, DESCRIPTIONS, SLUGS, GROUPS sidebar, dashboard KPIs/icon/color, role-switcher) without breaking the exhaustive-typing build.
  2. A user with TRANSPORTEUR role sees a TRANSPORTEUR-specific sidebar, dashboard, and role-switcher entry.
  3. TRANSPORTEUR can access tours-pending, tour acknowledgment, and vehicle/driver assignment views under the `/transporteur/…` route group.
  4. Selecting TRANSPORTEUR in the role-switcher routes to the correct dashboards and allowed modules.
  5. The TypeScript strict build passes clean with the new exhaustive role registered.
**Plans**: TBD

**UI hint**: yes

### Phase 11: Global Search
**Goal**: A Ctrl+K palette searches organizations, sites, vehicles, tours, anomalies, and notifications across all curated fixtures and deep-links to the correct route.
**Depends on**: Phase 10 (all entities exist and are routed)
**Requirements**: SRCH-01, SRCH-02
**Success Criteria** (what must be TRUE):
  1. Ctrl+K / ⌘K opens a global search palette.
  2. Typing searches organizations, sites, vehicles, tours, anomalies, and notifications from the curated fixtures and ranks relevant matches.
  3. Choosing a result navigates to the correct route/screen for the matched entity.
  4. Search does not surface entities the user's role cannot access (RBAC-aware results).
**Plans**: TBD

**UI hint**: yes

## Phase 0 / Foundation Notes

- Phase 1 is the sole foundation phase; all later phases depend on it transitively.
- Phase 2 (design) is cross-cutting: DSGN-01/DSGN-02 map to Phase 2, and each later phase carries the "ships with a UI-SPEC for the design system" success criterion as a reinforce of DSGN-01.

## Backlog

Deliberate scope-drop deferred out of v1.0 (kept visible for a future milestone):

- **PDA offline-first** (LIVREUR local-storage batching, bulk sync, conflict_status display) — deferred from v1.0 per REQUIREMENTS.md Future Requirements.
- **Full route surface & routing / `record` completeness** — verify/expedite every Section 4 route; many sidebar-modules lack a route+screen (tracked in PROJECT.md Active).
- **State-machine fidelity beyond tours** (pickup, device, RFID, recon, redressement enums) — surfaced per-page within Phases 6–8 as parts of the tracked entities above.
- **MFA/auth internals** — MFA setup UI out of milestone.
- **Backend API/DB schema** — frontend consumes `@lpg/api-client`, not re-implemented.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fixtures Infrastructure | TBD | Not started | - |
| 2. Design System & Layout Foundation | TBD | Not started | - |
| 3. Organizations & Sites | TBD | Not started | - |
| 4. Users & Roles | TBD | Not started | - |
| 5. Fleet & Devices | TBD | Not started | - |
| 6. Tours & Scans | TBD | Not started | - |
| 7. Compliance & Reconciliations | TBD | Not started | - |
| 8. Anomalies | TBD | Not started | - |
| 9. Notifications | TBD | Not started | - |
| 10. TRANSPORTEUR Role | TBD | Not started | - |
| 11. Global Search | TBD | Not started | - |