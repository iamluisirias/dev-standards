# CLAUDE.md

## Core standards

All base rules live in the shared notebook:
https://github.com/iamluisirias/dev-standards

Entry point with full doc map:
https://raw.githubusercontent.com/iamluisirias/dev-standards/main/CLAUDE.md

Read `docs/always/preamble.md` and `docs/always/agent-behaviour.md` before every task.
Use the doc map in the notebook's `CLAUDE.md` to find task-specific docs.
Project rules in this file take precedence over the notebook where they conflict.

---

## Stack

| Tool            | Version | Notes |
|-----------------|---------|-------|
| Node.js         |         |       |
| pnpm            |         |       |
| React           |         |       |
| TypeScript      |         |       |
| Vite            |         |       |
| TanStack Router |         |       |
| TanStack Query  |         |       |
| TanStack Form   |         |       |
| TanStack Store  |         |       |
| Biome           |         |       |
| Tailwind        |         |       |
| shadcn/ui       |         |       |

---

## Project-specific conventions

<!-- Only document things that differ from or extend the notebook. -->
<!-- If nothing differs, write "None — all rules inherit from the notebook." -->

### Naming exceptions

### Additional forbidden patterns

### Feature structure notes

---

## Environment

| Variable            | Purpose |
|---------------------|---------|
| `VITE_API_BASE_URL` |         |
| `VITE_APP_ENV`      |         |

---

## Commands

| Task             | Command                              |
|------------------|--------------------------------------|
| Dev server       | `pnpm dev`                           |
| Build            | `pnpm build`                         |
| Typecheck        | `pnpm exec tsc --noEmit`             |
| Lint + format    | `pnpm exec biome check --write src/` |
| Tests            | `pnpm test`                          |
| Tests + coverage | `pnpm test --coverage`               |

---

## Escalation

If completing a task requires violating a rule in this file or in the notebook, stop and report to a human before proceeding.