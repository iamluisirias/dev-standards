# Preamble

> Read this before every task, no exceptions. Contains the minimum rules that apply to every file you touch, plus the routing table for task-specific docs.

---

## Before starting — fetch the relevant doc

After reading this file, fetch every doc that applies to your task. Multiple docs may apply.

| You are about to… | Fetch |
|---|---|
| Create or modify a feature, add a service, query, store, or decide where a file belongs | `docs/when/architecture.md` |
| Build or modify a component, make component structure decisions | `docs/when/component-design.md` |
| Work with TypeScript types, Valibot schemas, forms, API data, or error handling | `docs/when/data-and-validation.md` |
| Create or modify a route, nested routes, loaders, or search params | `docs/when/routing.md` |
| Add or modify env variables, configure Biome | `docs/when/env-and-config.md` |
| Write or modify tests | `docs/when/testing.md` |
| Implement component logic, make state decisions, or reach for `useEffect` | `docs/when/patterns.md` |
| Add animations, transitions, or scroll-driven effects | `docs/when/animations.md` |
| Build UI, add interactive elements, implement loading/empty/error states | `docs/when/ui-library.md` |
| Write functions, hooks, or components; define API types; review code structure | `docs/when/code-quality.md` |
| Manage client state beyond `useState`, or work with Zustand stores | `docs/when/state-management.md` |
| Make HTTP calls, configure Axios, handle interceptors or API errors | `docs/when/api-layer.md` |
| Work with keyboard navigation, ARIA, or focus | `docs/when/accessibility.md` |
| Work with reCAPTCHA, Analytics, Hotjar, or any third-party integration | `docs/when/integrations.md` |
| Build or modify any form; integrate Maskito; handle server errors in forms | `docs/when/forms.md` |
| Define component variants with CVA, compose classes with `cn()` | `docs/when/styling.md` |
| Introduce a pattern not seen elsewhere in the codebase | `docs/never/no-go-list.md` |
| Set up pnpm, Husky, lint-staged, or commitlint | `docs/setup/git-hooks.md` |
| Create or configure a GitHub repo, CI workflow, or PR template | `docs/setup/github-and-ci.md` |

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
  stores/        → feature-scoped Zustand state
  types/         → TypeScript types shared across the feature
  utils/         → pure stateless helper functions
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
| `.util` | `.ts` | `maskito.util.ts` |
| `.test` | `.ts` / `.tsx` | `vehicle.service.test.ts` |

Route files follow TanStack Router conventions — no type suffix: `index.tsx`, `$slugProductCategory.tsx`.

---

## Naming conventions

| Entity | Convention | Example |
|---|---|---|
| Component function | `PascalCase` | `UserProfileCard` |
| Hook function | `camelCase`, `use` prefix mandatory | `useAuthUser` |
| TypeScript type | `PascalCase` | `VehicleResponse` |
| Constant variable | `SCREAMING_SNAKE_CASE` | `STEP_CODES` |
| All other variables and functions | `camelCase` | `getVehicleData` |
| Feature folder | `kebab-case` | `seguro-vehiculo` |
| Route file / folder | `camelCase`, mirrors URL | `$slugProductCategory/` |

---

## Imports

- **No barrel files.** `index.ts` re-exports are forbidden everywhere.
- **`@/` alias is mandatory for all imports.** It resolves to `src/`. Relative paths (`../`, `./`) are forbidden everywhere — no exceptions.
- **`@strategies` alias** resolves to `src/strategies/`. Use it only inside registry files when importing strategy files. Strategy files themselves use `@/`.
- Import directly from the exact file:

```ts
// Correct — always use @/ alias
import { useQuoteStore } from "@/features/quotes/stores/quote.store";
import { STEP_CODES } from "@/features/steps/constants/steps.constant";
import { UserProfileCard } from "@/features/users/components/user-profile-card.component";
import { cn } from "@/lib/cn.lib";
import { env } from "@/config/env";

// Correct — @strategies alias in registry files only
import { seguroVehiculoProductCategoryStrategy } from "@strategies/product-categories/seguro-vehiculo.product-category.strategy";

// Wrong — relative paths are forbidden
import { useQuoteStore } from "../stores/quote.store";
import { STEP_CODES } from "../../steps/constants/steps.constant";
```

The file path is the contract. If a file moves, the import breaks loudly — that is correct behaviour. The `@/` alias ensures this happens regardless of how deeply nested the importing file is.

---

## Exports

- **Named exports only.** Default exports are forbidden everywhere — components, hooks, utilities, constants, types, everything.
- Import only what is needed — never import an entire module.

---

## TypeScript invariants

| Rule | Detail |
|---|---|
| `any` | Forbidden as a variable, prop, or return type. Only permitted as a bound in a generic: `<T extends Record<string, any>>`. Escalate to a human if needed elsewhere. |
| `as` casting | Forbidden except for broken external library types where the library's types are provably wrong. |
| `interface` | Forbidden. Use `type` for everything — props, object shapes, API responses, store state, unions, intersections. |
| Inference | Let TypeScript infer where the type is obvious. No redundant annotations. |

---

## Stack at a glance

| Layer | Tool |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite |
| Package manager | pnpm — only allowed package manager |
| Router | TanStack Router (file-based) |
| Server state | TanStack Query |
| Client state | Zustand |
| Forms | React Hook Form + @hookform/resolvers |
| Validation | Valibot |
| HTTP | Axios |
| UI base | shadcn/ui (Radix Nova) |
| Icons | Lucide React |
| Styling | Tailwind CSS v4 + CVA + tailwind-merge + clsx |
| Animations | Motion (simple) / GSAP (complex) |
| Input masking | Maskito |
| Date utilities | date-fns |
| Lint + format | Biome |
| Carousel | Embla Carousel |
| Scaffolding | Internal CLI |

Full stack rules and decisions in `docs/when/` docs. The table above is orientation only.

---

## Package manager

**pnpm is the only allowed package manager.** Never run `npm install`, `yarn add`, or any equivalent.

```bash
# Correct
pnpm install
pnpm add valibot
pnpm add -D only-allow
pnpm run build
pnpm dlx tsx script.ts

# Wrong — blocked by preinstall hook
npm install
yarn add valibot
npx tsx script.ts
```

---

## Escalation

- Can't express validation logic with `.check()`? → escalate to a human.
- Need `any` outside a generic bound? → escalate to a human.
- About to introduce a pattern not seen in this codebase? → fetch `docs/never/no-go-list.md` first.
