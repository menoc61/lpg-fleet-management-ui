# Task 1 Brief — Add `national-map.read` permission code (SUPERADMIN-only)

**Files:**
- Modify: `packages/permissions/src/index.ts:175-200`
- Modify: `packages/permissions/src/index.test.ts:22-25` and `packages/permissions/src/index.test.ts:50-60` (category-counts assertion)

**Interfaces:**
- Consumes: existing `PERMISSION_CATALOG` shape — every code MUST match `^[a-z-]+\.[a-z]+$` (one dot, `resource.action`).
- Produces: new permission code `national-map.read` (category `'reporting'`). Resource = `national-map`, action = `read`.

**Why this code name:** `map.national.read` was the original idea but it has two dots and violates the catalog's enforced regex (one dot, `resource.action`). `national-map.read` keeps the intent (SUPERADMIN-only national map) and satisfies the schema.

## Step 1: Add the entry to `PERMISSION_CATALOG`

In `packages/permissions/src/index.ts`, inside the `// ---- reporting & system (20) ----` block, append after line 195:

```ts
  { code: 'national-map.read', category: 'reporting', label: 'Voir la carte nationale (SUPERADMIN)' },
```

Update the section comment from `(20)` to `(21)`.

## Step 2: Update the catalog count test

In `packages/permissions/src/index.test.ts`, find the assertion:

```ts
  it('defines exactly 140 codes across 9 categories', () => {
    expect(PERMISSION_CATALOG).toHaveLength(140)
```

and change to:

```ts
  it('defines exactly 141 codes across 9 categories', () => {
    expect(PERMISSION_CATALOG).toHaveLength(141)
```

Then find the category-counts assertion (currently asserts `reporting: 20`) and bump `reporting` to `21`. The exact line varies — look for the literal `reporting: 20` and change it to `reporting: 21`. (The implementer report at `task-1-report.md` notes line 50.)

## Step 3: Run tests

```bash
cd packages/permissions
npm test
```

Expected: PASS — 17/17 (or whatever the current count is).

## Step 4: Run typecheck

```bash
cd apps/web
npm run typecheck
```

Expected: PASS.

## Step 5: No commit yet (per global constraint). Continue to Task 2.
