# No-Go List

> Check this before introducing a pattern not seen elsewhere in the codebase. If something you are about to do appears here, stop and escalate to a human.

---

## Architecture

| Do not | Why |
|---|---|
| Create `index.ts` barrel files | Breaks tree-shaking, risks circular deps, adds maintenance overhead with no benefit |
| Create a root-level `src/stores/` folder | Cross-feature state lives in the owning feature's `stores/` |
| Write TanStack Router route definitions by hand | The file tree generates them — hand-written definitions drift and conflict |
| Edit `src/routeTree.gen.ts` | Auto-generated — any manual edit will be overwritten on next dev server start |
| Use dot-notation for route files (`cotizar.$slug.tsx`) | Obscures hierarchy — always use folders |

---

## TypeScript

| Do not | Why |
|---|---|
| Use `any` as a variable, prop, or return type | Defeats type safety; escalate to a human instead |
| Use `as` casting outside of broken external library types | Masks real type errors — fix the type, don't cast around it |
| Use `interface` for non-prop types | `interface` is reserved for component props only |
| Use default exports | Breaks named import consistency and refactoring tooling |
| Add redundant type annotations where TypeScript can infer | Noise that makes code harder to read |

---

## Validation

| Do not | Why |
|---|---|
| Use Zod or Yup | Valibot is the only validation library |
| Use `.refine()` in Valibot schemas | Bypasses type inference and creates runtime overhead; use `.check()` |
| Write validation error messages as freeform prose | Must be namespaced keys for future i18next migration |
| Write a `type` for an API response without a Valibot schema | Schema-first is required — type is derived, never written manually |

---

## Components

| Do not | Why |
|---|---|
| Use `React.FC` | Obscures return type, complicates generics; declare props directly in the function signature |
| Use inline `style` attributes for layout | Use Tailwind utilities |
| Use arbitrary Tailwind values (`w-[372px]`) without a documented reason | Breaks design scale consistency |
| Use a `<div>` where a semantic element is appropriate | Harms accessibility and SEO |
| Put business logic or data-fetching in a page component | Page components are composition roots only |
| Export React Context from a component file | Context is an implementation detail — scoped to the file, never exported |

---

## Data fetching

| Do not | Why |
|---|---|
| Fetch directly inside a `queries/` file | Queries wrap services — services own the fetch |
| Import from TanStack Query inside a `services/` file | Services are plain async functions with no query awareness |
| Fetch directly inside a route loader | Loaders use `queryClient.ensureQueryData()` with query options |
| Swallow or transform errors inside TanStack Query | Let errors propagate naturally to the component layer |
| Copy query data into `useState` | Creates two sources of truth that drift immediately |

---

## Forms

| Do not | Why |
|---|---|
| Use React Hook Form for new features | TanStack Form is the current standard |
| Migrate existing React Hook Form forms without an explicit task scope | Unscoped migrations create unfinished work |

---

## State

| Do not | Why |
|---|---|
| Use Zustand in new features | TanStack Store is the current standard |
| Migrate existing Zustand stores without an explicit task scope | Unscoped migrations create unfinished work |
| Store server state in `useState` | TanStack Query is the single source of truth for all async data |

---

## Tooling

| Do not | Why |
|---|---|
| Install or configure ESLint or Prettier | Biome replaces both |
| Suppress Biome rules with `// biome-ignore` without an inline reason | Rules exist for a reason; document the exception |
| Read `import.meta.env` directly outside `src/config/env.ts` | All env access goes through the typed config object |
| Commit `.env` files | Secrets must never be committed; commit `.env.example` instead |

---

## Commits and Git

| Do not | Why |
|---|---|
| Mix more than one concern in a single commit | One concern per commit — keeps history bisectable |
| Write commit messages in past tense (`added`, `fixed`) | Conventional Commits requires imperative mood (`add`, `fix`) |
| Omit the scope | Scope is required — `feat: add thing` is rejected by commitlint |
| Bypass Husky with `--no-verify` in normal workflow | Hooks exist to enforce standards; bypass only in documented emergencies |
| Commit directly to `main` or `develop` | All changes arrive via PR |
