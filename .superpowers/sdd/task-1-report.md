# Task 1 Report — Add `national-map.read` permission code (SUPERADMIN-only)

**Status:** DONE

## Files touched

- `packages/permissions/src/index.ts` — block comment `(20)` → `(21)`; appended
  `{ code: 'national-map.read', category: 'reporting', label: 'Voir la carte nationale (SUPERADMIN)' }`
  to `PERMISSION_CATALOG`.
- `packages/permissions/src/index.test.ts` — bumped catalog-length assertion
  `140` → `141` (test title + `toHaveLength`); bumped category-counts assertion
  `reporting: 20` → `reporting: 21`.

No other files. SUPERADMIN auto-includes the new code via `PERMISSION_CATALOG.map(...)`
— no `*_GRANTS` array was edited. No commit.

## Test command + output

```
npm test                              (from packages/permissions)

 RUN  v4.1.10 …/packages/permissions
 Test Files  1 passed (1)
      Tests  17 passed (17)
   Duration  273ms
```

## Typecheck command + output

```
npm run typecheck                     (from apps/web)

> typecheck
> tsc --noEmit -p tsconfig.app.json

(0 errors)
```

## One-line test summary

`packages/permissions` — 17/17 vitest tests pass after adding
`national-map.read` to `PERMISSION_CATALOG` (category `reporting`) and bumping
the two test assertions.

## Concerns

- None for Task 1 itself. The new code is `^[a-z-]+\.[a-z]+$`-conformant
  (`resource = national-map`, `action = read`), and `read` is a registered
  action in `ACTION_IMPLICATIONS`, so `defineAbilityFor('SUPERADMIN')` does not
  crash (this was the failure mode of the previous `map.national.read` attempt).
- Reminder for downstream tasks: this permission is plumbed into a feature that
  must read it from `@lpg/permissions`, not by hardcoded string.
