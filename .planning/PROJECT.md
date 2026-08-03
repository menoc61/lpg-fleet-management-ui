# CSPH GPL Traceability — Frontend Audit & Implementation

## What This Is

A GSD-managed, source-grounded audit and rebuild of the **frontend** for the CSPH (Cameroon) GPL Hors Réseau Tracking & Tracing System. The platform is a country-scale LPG traceability system: PostgreSQL 15 + PostGIS + TimescaleDB, Fastify backend, Next.js frontend, MinIO object storage, Kafka, Prometheus/Grafana, ArcGIS maps. The driving contract is `CSPH_GPL_Master_Prompt.md` — an audit + implementation guide covering DB, API, frontend routes, state machines, workflows, monitoring, security, and a completion checklist (Section 8).

## Current Milestone: v1.0 Frontend Rebuild on Curated Fixtures

**Goal:** Rebuild and verify the frontend page-by-page, driven by the validated JSON fixtures in `C:\Users\DTA_WorkStation\Downloads\json_fixture`, replacing the nonsense `seed-extended.ts` data.

**Target features:**
- Replace `packages/mock-data/src/seed-extended.ts` with the curated fixture set (9 files, 0 validation errors, cross-referenced IDs) as the frontend data source
- Page-by-page interface work — inspect the relevant fixture JSON, design the proper interface, then build (discuss each page before implementing)
- Frontend-only scope (unchanged; backend/DB/MFA/infra remain out of scope)

## Core Value

A correct, role-gated frontend in which every LPG stakeholder executes the legal state-machine flows (pickup → delivery tour → scans → réconciliation → redressement) with full lifecycle traceability evidence.

## Business Context

- **Customer**: CSPH (Cameroon state regulator) + its ecosystem (marketeurs, transporters, livreurs, agents).
- **Revenue model**: Public subsidy control — the frontend must prevent subsidy leakage via fraud/anomalies.
- **Success metric**: Routes & sidebar match master-prompt spec exactly; all 8 roles functional; state-machine transitions UI reflects exact enums (`PENDINGTRANSPORTERACK`, `ACKNOWLEDGED`…).
- **Strategy notes**: This milestone is **frontend-only** (RBAC wiring + routes + UI + design); DB/API/Monitoring/Security audited separately.

## Requirements

### Validated

- ✓ 7 of 8 system roles implemented (SUPER_ADMIN, ADMIN, SUPERVISOR, INTEGRATEUR, AGENT, MARKETEUR, LIVREUR) with `Record<Role, …>` maps across RBAC, sidebar, role-dashboard, role-switcher, manifest — `apps/web/src/**`, `packages/**`.
- ✓ Role-based dynamic routing via `/_authenticated/$role/$module` resolving generic `ModuleScreen` or a registry-backed custom screen — `apps/web/src/routes/_authenticated/$role/[$module].tsx`.
- ✓ Sidebar nav generated from `getSidebarData(role)`; role-switcher + role-dashboard derive KPIs/icon/color from `Record<Role, …>` — `sidebar-by-role.ts`, `role-switcher.tsx`, `role-dashboard.tsx`.
- ✓ RBAC dual-layer: `packages/permissions` (CASL) `ROLE_PERMISSIONS` matrix + `@lpg/permissions` re-export; `isRole()` validates against `ROLES` — `packages/permissions/src/index.ts`, `store/role-store.ts`.
- ✓ Shared canonical types in `packages/types` (`Role`, `TourneeStatus`, `AnomalyType`, `CheckpointStatus`, `ScanDirection`, etc.).
- ✓ TypeScript strict build passes clean (`noUnusedLocals`, `strict`, exhaustive `Record<Role, …>`).

### Active

- [ ] **Curated fixtures as data source** — swap `packages/mock-data/src/seed-extended.ts` for the validated set in `Downloads/json_fixture` (orgs, users/roles, sites, vehicles/drivers, devices, delivery tours, compliance, anomalies, notifications); inspect per page before building.
- [ ] **Page-by-page interface review** — walk each frontend page against its fixture JSON, discuss + design the proper interface, then implement.
- [ ] **TRANSPORTEUR role (§4.7, §3.7)** — 8th system role: add to `Role` union, `ROLE_PERMISSIONS`, `ROLES`, `ROLE_LABELS`, `ROLE_DESCRIPTIONS`, `ROLE_SLUGS`, `GROUPS` sidebar, dashboard KPIs/icon/color, role-switcher icon/avatar, manifest entry.
- [ ] **Full route surface (§4)** — verify/expedite every route listed in Section 4 exists in the router (many modules referenced in sidebar have no route + screen yet).
- [ ] **EXTERNAL tour flow & TRANSPORTEUR acknowledgment** — `/transporteur/tours-pending`, `PENDINGTRANSPORTERACK → ACKNOWLEDGED` transition, 4h ack-timeout anomaly.
- [ ] **Dual-track anomaly UI (§4.1/4.3/4.5)** — split INVESTIGATION vs TECHNICAL views in sidebar + screens.
- [ ] **State-machine fidelity** — UI reflect exact status enums/values from §3 (tour, pickup, device, RFID, recon, redressement).
- [ ] **PDA offline-first (§4.8 / §5.8)** — LIVREUR local-storage batching, bulk sync, conflict_status display.
- [ ] **Design contract + visual polish** — UI-SPEC per phase, impeccable-grade treatment, responsive, accessible.

### Out of Scope

- **Backend API/DB schema** — audited separately; frontend consumes `@lpg/api-client` (not re-implemented here).
- **Infrastructure** — Prometheus/Grafana/MinIO buckets/Kafka topics/TLS provisioning (frontend only references pre-signed URLs + Grafana embeds).
- **MFA/auth internals** — login flow exists; MFA setup UI is out of this milestone.
- **Data at rest / TLS** — infra concerns, not frontend.

## Context

Existing monorepo: `apps/web` (Next.js + TanStack Router/Query + Tailwind + lucide + CASL) and `packages/` (`types`, `permissions`, `ui`, `api-client`, `config`). Routing is dynamic per role — adding a new role does **not** require new route files, only updates to the `Record<Role, …>` maps. The master prompt (1046 lines) is the authoritative target; its Section 8 audit checklist is the source of truth for "done."

## Constraints

- **Tech stack**: Next.js (Vite), TanStack Router, Tailwind v4, lucide-react, CASL, zustand, React 19. (versions from package.json)
- **TypeScript**: `strict`, `noUnusedLocals`/`noUnusedParameters` — every `Record<Role, …>` is exhaustive; adding `TRANSPORTEUR` breaks 5 files until all maps updated.
- **Conventions**: UPPERCASE enum values (no snake_case enums), FR UI labels, `/_authenticated/<role-slug>/<module>` URL scheme, settings-driven thresholds (no hardcoded magic numbers).
- **Process**: GSD YOLO/sequential, fine-grained phases, plan-check + verifier + nyquist + drift-guard on; phase commits tracked in git.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Frontend-only milestone scope | User: "use all our frontend skills"; backend audited separately | RBAC type wiring, routes, components, UI design |
| TRANSPORTEUR = 8th system role in `packages/types` | Master-prompt §4.7 + §1.1 `users.system_role` enum | Add to `Role` union + all 5 web RBAC maps |
| Preserve dynamic `/$role/$module` routing | Existing architecture is clean and extensible | New modules route generically; bespoke screens via manifest only |
| Fine-grained phases + UI-SPEC per phase | Complex state machines need design contracts | Use `gsd-ui-phase` + `impeccable` per milestone |
| Design skills applied progressively | Visual quality matters for regulator-facing UI | `frontend-design` → `gsd-ui-phase` → `impeccable` review |

---

*Last updated: 2026-08-03 after milestone v1.0 started*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Business Context check (if present) — customer, revenue model, success metric still accurate?
4. Audit Out of Scope — reasons still valid?
5. Update Context with current state (users, feedback, metrics)
