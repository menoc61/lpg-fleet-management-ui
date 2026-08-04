# Phase 1: Fixtures Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-03
**Phase:** 1-Fixtures Infrastructure
**Areas discussed:** Fixture Placement

---

## Fixture Placement

| Option | Description | Selected |
|--------|-------------|----------|
| In mock-data | Copy the 9 files into the existing `packages/mock-data/src/seed/` dir, replacing current seed JSON + seed-extended.ts. Keeps the barrel aggregator pattern. | ✓ |
| Top-level dir | New top-level `fixtures/` folder kept outside compiled packages; read directly from Downloads/json_fixture or a repo copy. | |
| Dedicated pkg | New `packages/fixtures` package that mock-data and mock-api both import, isolating fixtures from app code. | |

**User's choice:** In mock-data

---

| Option | Description | Selected |
|--------|-------------|----------|
| Delete old seed | Delete seed-extended.ts and old seed/*.json outright once the curated fixtures are wired. | ✓ |
| Keep unref'd | Keep seed files unreferenced during transition. | |
| Same exports | Replace seed-extended.ts content with the curated export shape keeping identical export names. | |

**User's choice:** Delete old seed

---

| Option | Description | Selected |
|--------|-------------|----------|
| Use source name | Name copies exactly as source (01_organizations.json, …) preserving numbered cross-reference scheme. | |
| Use slug name | Rename to domain slugs (organizations.json, users-roles.json, …) matching existing seed/*.json naming. | ✓ |

**User's choice:** Use slug name

---

| Option | Description | Selected |
|--------|-------------|----------|
| Copy into repo | Copy the JSON into the repo; fixtures versioned in git alongside the app. | ✓ |
| Read external | Symlink/import directly from Downloads/json_fixture (absolute external path). | |

**User's choice:** match and ajuste for us to have a single version
**Notes:** Copy into the repo, adjusted to match app shapes, as the single versioned source of truth. No runtime dependency on the Downloads path.

---

## the agent's Discretion

- ID scheme normalization (UUID vs short IDs) — deferred to planning.
- Consumption path depth (fake-adapter vs Express mock-api) — deferred to later phases.

## Deferred Ideas

- ID scheme normalization for cross-phase consistency (FX-03).
- Consumption path depth — established barrel pattern serves both consumers.
