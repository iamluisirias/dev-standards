# Project CLAUDE.md Template

> Reference doc — use this as the starting point when creating a `CLAUDE.md` for a new project repo.

---

## Purpose

Every project repo has its own `CLAUDE.md` at its root. That file does two things:
1. Points to this notebook for all base rules.
2. Defines only what diverges from or extends those base rules for this specific project.

Project rules take precedence over the notebook where they conflict. Everything not mentioned in the project file inherits from the notebook unchanged.

---

## What a project file may override

- Stack versions (e.g. a project on a different React or TanStack Router version).
- Feature-specific naming exceptions with a documented reason.
- Additional forbidden patterns specific to the project domain.
- Extra lint rules activated in `biome.json` for this project.
- Test coverage thresholds.
- CI environment variables and deployment targets.

## What a project file may never override

These are invariants. No project exception is valid for these:

- No barrel files (`index.ts` re-exports).
- No `any` as variable, prop, or return type.
- No default exports.
- No `as` casting outside broken external library types.
- pnpm is the only package manager.
- Named exports only.
- Conventional Commits with scope required.
- Biome is the only linter and formatter.

---

## Template

Copy this into the root `CLAUDE.md` of a new project and fill in the sections:

```markdown
# CLAUDE.md

## Core standards

All base rules live in the shared notebook at [link to notebook repo].
Read `.claude/always/preamble.md` and `.claude/always/agent-behaviour.md` before every task.
Use the doc map in the notebook's `CLAUDE.md` to find task-specific docs.

---

## Stack

| Tool            | Version | Notes                        |
|-----------------|---------|------------------------------|
| Node.js         |         |                              |
| pnpm            |         |                              |
| React           |         |                              |
| TypeScript      |         |                              |
| Vite            |         |                              |
| TanStack Router |         |                              |
| TanStack Query  |         |                              |
| TanStack Form   |         |                              |
| TanStack Store  |         |                              |
| Biome           |         |                              |
| Tailwind        |         |                              |
| shadcn/ui       |         |                              |

---

## Project-specific conventions

<!-- Only document things that differ from or extend the notebook. -->
<!-- If nothing differs, write "None — all rules inherit from the notebook." -->

### Naming exceptions

### Additional forbidden patterns

### Feature structure notes

---

## Environment

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | |
| `VITE_APP_ENV` | |

---

## Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Typecheck | `pnpm exec tsc --noEmit` |
| Lint + format | `pnpm exec biome check --write src/` |
| Tests | `pnpm test` |
| Tests with coverage | `pnpm test --coverage` |

---

## Escalation

If completing a task requires violating a rule in this file or in the notebook, stop and report to a human before proceeding.
```
