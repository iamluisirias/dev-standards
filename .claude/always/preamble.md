# Preamble

> Read this before every task. This is the minimum context required to not break the codebase. For deeper rules on any topic, fetch the relevant doc from `.claude/when/`.

---

## Project structure

Every feature lives at `src/features/[feature-name]/`. Create subfolders only when the feature needs them:

```
src/features/[feature-name]/
  components/    → UI pieces owned by this feature
  constants/     → enums, static configs, fixed data
  hooks/         → feature-specific logic and state
  lib/           → configured third-party adapters
  queries/       → TanStack Query queryOptions definitions
  schemas/       → Valibot validation schemas
  services/      → raw API call functions
  stores/        → feature-scoped TanStack Store state
  types/         → TypeScript types shared across the feature
  tests/         → test files for this feature
```

Route files live at `src/routes/` and mirror the URL structure exactly. Do not write route definitions by hand — TanStack Router generates them from the file tree.

---

## File naming

kebab-case only. Pattern: `[descriptive-name].[type].ext`

| Type suffix | Extension | Example |
|---|---|---|
| `.component` | `.tsx` | `user-profile-card.component.tsx` |
| `.hook` | `.ts` | `use-auth-user.hook.ts` |
| `.service` | `.ts` | `vehicle.service.ts` |
| `.query` | `.ts` | `vehicle.query.ts` |
| `.schema` | `.ts` | `user-auth.schema.ts` |
| `.store` | `.ts` | `quote.store.ts` |
| `.lib` | `.ts` | `axios.lib.ts` |
| `.type` | `.ts` | `vehicle.type.ts` |
| `.constant` | `.ts` | `steps.constant.ts` |
| `.test` | `.ts` / `.tsx` | `vehicle.service.test.ts` |

Route files follow TanStack Router conventions — no type suffix: `index.tsx`, `$slugProductCategory.tsx`.

---

## Naming conventions

| Entity | Convention | Example |
|---|---|---|
| Component function | `PascalCase` | `UserProfileCard` |
| Hook function | `camelCase`, `use` prefix mandatory | `useAuthUser` |
| TypeScript type / interface | `PascalCase` | `VehicleResponse` |
| Constant variable | `SCREAMING_SNAKE_CASE` | `STEP_CODES` |
| All other variables and functions | `camelCase` | `getVehicleData` |
| Feature folder | `kebab-case` | `seguro-vehiculo` |
| Route file / folder | `kebab-case`, mirrors URL | `$slug-product-category/` |

---

## Imports

- **No barrel files.** `index.ts` re-exports are forbidden everywhere.
- Import directly from the exact file using the `@/` alias (resolves to `src/`):

```ts
import { useQuoteStore } from "@/features/quotes/stores/quote.store";
import { STEP_CODES } from "@/features/steps/constants/steps.constant";
import { UserProfileCard } from "@/features/users/components/user-profile-card.component";
```

The file path is the contract. If a file moves, the import breaks loudly — that is correct behaviour.

---

## Exports

- **Named exports only.** Default exports are forbidden everywhere — components, hooks, utilities, constants, types, everything.
- Import only what is needed — never import an entire module.

---

## TypeScript invariants

| Rule | Detail |
|---|---|
| `any` | Forbidden as a variable, prop, or return type. Only permitted as a bound in a generic: `<T extends Record<string, any>>`. If you need it elsewhere, escalate to a human. |
| `as` casting | Forbidden except for broken external library types where the library's types are provably wrong. |
| `interface` | Reserved for component prop definitions only. |
| `type` | Used for everything else: object shapes, API responses, store state, unions, intersections. |
| Inference | Let TypeScript infer where the type is obvious. No redundant annotations. |

---

## Package manager

**pnpm is the only allowed package manager.** Never run `npm install`, `yarn add`, or any equivalent. Every install, add, remove, and script command uses `pnpm`.

```bash
# ✅ Correct
pnpm install
pnpm add valibot
pnpm add -D only-allow
pnpm run build
pnpm dlx tsx script.ts   # equivalent of npx

# ❌ Wrong — blocked by preinstall hook
npm install
yarn add valibot
npx tsx script.ts
```

---

## When in doubt

- Can't express validation logic with `.check()`? → escalate to a human.
- Need `any` outside a generic bound? → escalate to a human.
- Not sure which doc applies? → check the index in `CLAUDE.md`.
- About to introduce a pattern you haven't seen in this codebase? → read `.claude/never/no-go-list.md` first.
