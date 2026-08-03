# Milestone v1.0 Requirements — Frontend Rebuild on Curated Fixtures

## v1 Requirements

### Fixtures Infrastructure (FX)

- [ ] **FX-01**: Frontend data is sourced from the curated fixture set in `Downloads/json_fixture` (9 files: orgs, users/roles, sites, vehicles/drivers, devices, delivery tours, compliance, anomalies, notifications), replacing `packages/mock-data/src/seed-extended.ts` as the active data source.
- [ ] **FX-02**: All fixture image/PDF URLs render via a single placeholder service (`https://placehold.net/default.png`) rather than broken or nonsensical asset links.
- [ ] **FX-03**: Fixture data is cross-referenced correctly (foreign keys resolve to real IDs across files, matching `00_INDEX.md` 0-error validation).

### Organizations & Sites (ORG)

- [ ] **ORG-01**: User can view the full organization hierarchy (régulateur CSPH, SCDP depots, marketers, transporters, clients) from `01_organizations.json`.
- [ ] **ORG-02**: User can view operational sites, client organizations, and client sites from `03_sites_and_client_sites.json` (33 operational sites, 5 client sites).
- [ ] **ORG-03**: Site details surface geographic coordinates for map display (Cameroon lon 8.5–16.5, lat 1.7–13.5).

### Users & Roles (USR)

- [ ] **USR-01**: User can view system users, their roles, MFA status, and integration auth from `02_users_and_roles.json` (32 users, 8 roles, 30+ MFA).
- [ ] **USR-02**: User can view the permission matrix (40 permissions) per role from `02_users_and_roles.json`.
- [ ] **USR-03**: User can manage role assignments consistent with the RBAC matrix (`packages/permissions` CASL).

### Fleet & Devices (FLT)

- [ ] **FLT-01**: User can view vehicles and drivers from `04_vehicles_and_drivers.json` (33 vehicles, 12 drivers, Cameroon plate format AB1234V).
- [ ] **FLT-02**: User can view devices and device health from `05_devices.json` (20 devices: GPS, PDA, RFID) including offline/battery-critical states.

### Tours & Scans (TOUR)

- [ ] **TOUR-01**: User can view delivery tours, checkpoints, and scan events from `06_delivery_tours.json` (10 tours, 13 checkpoints, 12 scans).
- [ ] **TOUR-02**: TRANSPORTEUR can view pending tours and acknowledge them (`PENDINGTRANSPORTERACK → ACKNOWLEDGED` transition).
- [ ] **TOUR-03**: Tour status reflects exact state-machine enums from the master prompt §3 (PLANNED, IN_PROGRESS, COMPLETED, etc.).

### Compliance (COMP)

- [ ] **COMP-01**: User can view declarations, reconciliations, redressements, and risk scores from `07_compliance.json` (8 declarations, 5 reconciliations, 2 redressements, 8 risk scores).
- [ ] **COMP-02**: Reconciliation views surface volume gaps (ml vs reconciled) and subsidy-at-risk math (1,524 FCFA/bottle, 6,500 FCFA retail).

### Anomalies (ANOM)

- [ ] **ANOM-01**: User can view anomalies from `08_anomalies.json` (25 anomalies) with dual-track separation: INVESTIGATION vs TECHNICAL.
- [ ] **ANOM-02**: Anomaly detail shows status lifecycle (NOUVEAU → ENCOURS → RESOLU → FERME) and assignment.
- [ ] **ANOM-03**: Anomaly category labels are exact enums (SIPHONNAGE, SUBSTITUTIONBOUTEILLES, FALSIFICATIONPREUVES, DIVERSIONSUBSIDIES, DEVIATIONROUTE, FILLINGILLEGAL, CHECKPOINTMISSED, VOLUMEGAP, GPSREMOVED, SCANOUTOFSEQUENCE, BATTERYCRITICAL, GPSFAILURE, PDAUNSYNCED, DEVICEOFFLINE, TOURNEEUNASSIGNEDTOOLONG, TRANSPORTERNOACK, KAFKATIMEOUT, IOTDEGRADATION, SERVERUNAVAILABLE).

### Notifications (NOTIF)

- [ ] **NOTIF-01**: User can view notification groups, members, rules, and notifications from `09_notifications.json` (9 groups, 21 members, 19 rules, 33 notifications).
- [ ] **NOTIF-02**: Notification center filters by group type (TECHNICAL, INVESTIGATION, ADMIN, MARKETING, TRANSPORT).

### TRANSPORTEUR Role (TSP)

- [ ] **TSP-01**: TRANSPORTEUR is added as the 8th role across `Role` union, `ROLE_PERMISSIONS`, `ROLES`, `ROLE_LABELS`, `ROLE_DESCRIPTIONS`, `ROLE_SLUGS`, `GROUPS` sidebar, dashboard, role-switcher, and manifest.
- [ ] **TSP-02**: TRANSPORTEUR can access tours-pending, tour acknowledgment, and vehicle/driver assignment views.

### Global Search (SRCH)

- [ ] **SRCH-01**: Global search palette (Ctrl+K) searches organizations, sites, vehicles, tours, and anomalies from the curated fixtures.
- [ ] **SRCH-02**: Search results link to the correct page/route for the matched entity.

### Design Contract (DSGN)

- [ ] **DSGN-01**: Each page ships with a design contract (UI-SPEC) — impeccable-grade treatment, consistent with an agreed visual system.
- [ ] **DSGN-02**: Pages are responsive (desktop + PDA-class viewports) and accessible.

## Future Requirements

- **PDA offline-first** (LIVREUR local-storage batching, bulk sync, conflict_status display) — deferred from v1.0.

## Out of Scope

- **Backend API/DB schema** — frontend consumes `@lpg/api-client`; not re-implemented here.
- **Infrastructure** — Prometheus/Grafana/MinIO buckets/Kafka topics/TLS provisioning.
- **MFA/auth internals** — login flow exists; MFA setup UI out of this milestone.
- **Data at rest / TLS** — infra concerns.

## Traceability

| Phase | Requirements |
|-------|--------------|
|       |              |
