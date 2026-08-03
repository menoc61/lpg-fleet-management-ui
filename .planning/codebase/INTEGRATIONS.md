# External Integrations

**Analysis Date:** 2026-08-03

> All external/integration surfaces in this repository are **mocked**. No live third-party
> services are configured or called in the current codebase. The "production" build
> (`vercel.json`) runs the in-browser fake backend (`packages/api-client/src/fake-adapter.ts`).

## APIs & External Services

**Map / GIS:**
- Esri ArcGIS — referenced conceptually, **mocked at runtime**
  - SDK/Client: `@arcgis/core` 5.14 (installed, but only used for local mock rendering of map assets in `apps/web/src/components/map/`)
  - No live Esri account, token, or `ARCGIS_API_KEY` env var configured

**Geocoding / Routing (Transport):**
- None — route geometry generated locally by `@faker-js/faker`; no OSRM / Google / Mapbox integrations

## Data Storage

**Databases:**
- None (no persisted database)
- The Express "mock API" (`packages/mock-api/src/server.ts`) keeps data in-memory (in-process arrays); state resets on every server restart

**File Storage:**
- Local filesystem only
- `apps/web/src/assets/` — static image assets (no upload/download flow implemented)

**Caching:**
- None — Zustand stores are the only in-memory cache; no Redis or browser cache layer configured

## Authentication & Identity

**Auth Provider:**
- Custom (no external IdP)
- Implementation: `@lpg/mock-api/src/jwt.ts`
  - Issues JWT with `alg: "none"` (no signature verification)
  - Hardcoded demo credentials in `packages/mock-data/src/fixtures-auth.ts:16-22`
    - `superadmin@lpg.cm` / `password` (SUPER_ADMIN)
    - `admin@lpg.cm` / `password` (ADMIN)
    - `supervisor@lpg.cm` / `password` (SUPERVISOR)
  - Token stored in browser via `apps/web/src/store/auth-store.ts` (zustand + persistence)

**NOTE on security (not a recommendation to replicate):** `alg:none` JWTs with no expiration validation represent a critical security finding — see `CONCERNS.md` § Authentication & Security.

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, LogRocket, or equivalent

**Logs:**
- Browser `console` only (no structured logging transport configured)

## CI/CD & Deployment

**Hosting:**
- Vercel (root `vercel.json` present)
  - **Critical:** `vercel.json` forces `VITE_API_MODE=fake`, so the Vercel production deploy runs the in-browser fake backend — no real backend integration

**CI Pipeline:**
- None configured — no GitHub Actions workflows, no `.github/workflows`, no `.gitlab-ci.yml` detected

## Environment Configuration

**Required env vars:**
- `VITE_API_BASE_URL` — consumed by `apps/web/src/lib/api-constants.ts` (defaults to `http://localhost:8787/api/v1`)
- `VITE_API_MODE` — `fake` (in-browser) vs `server` (Express on :8787); **forced to `fake` in production** by `vercel.json`

**Secrets location:**
- None — all credentials are hardcoded demo values in `packages/mock-data/src/fixtures-auth.ts`

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-08-03*
