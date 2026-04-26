# CLAUDE.md

This file is the entry point for all project standards. It contains no rules itself — it tells you which doc to read and when. All rules live in `.claude/`.

Before writing any code, read the two mandatory docs in `.claude/always/`. Then fetch only the docs relevant to your task. Do not read docs that do not apply — context is finite.

---

## Always read — every task, no exceptions

| Doc | What it covers |
|---|---|
| `.claude/always/preamble.md` | File structure, naming, imports, exports, TypeScript invariants, package manager |
| `.claude/always/agent-behaviour.md` | Scope discipline, when to stop, output hygiene, how to document assumptions |

---

## Read based on your task

| If your task involves… | Read |
|---|---|
| Creating or modifying a feature; deciding where a file belongs; adding a service, query, or store | `.claude/when/architecture.md` |
| Building or modifying a component; making component structure decisions | `.claude/when/component-design.md` |
| TypeScript types, Valibot schemas, forms, API data, error handling | `.claude/when/data-and-validation.md` |
| Creating or modifying a route; nested routes; loaders; search params | `.claude/when/routing.md` |
| Env variables, Biome config, testing | `.claude/when/tooling.md` |
| Component logic, state decisions, animations, any time `useEffect` feels like the answer | `.claude/when/patterns.md` |
| Building UI, interactive elements, loading/empty/error states, modals, dialogs, tooltips | `.claude/when/ui-library.md` |
| Writing functions, hooks, or components; API types; reviewing code structure | `.claude/when/code-quality.md` |

---

## Always check before introducing an unfamiliar pattern

| Doc | What it covers |
|---|---|
| `.claude/never/no-go-list.md` | Explicit prohibitions by domain — things an agent rationalises its way into |

---

## Reference — fetch only when setting up infrastructure

| Doc | What it covers |
|---|---|
| `.claude/setup/git-hooks.md` | pnpm setup, Husky, lint-staged, commitlint — full walkthrough |
| `.claude/setup/github-and-ci.md` | Branching strategy, PR template, CI workflow, repository settings |
| `.claude/setup/project-template.md` | Template and rules for a project-level CLAUDE.md |

---

## Doc map

```
.claude/
  always/
    preamble.md
    agent-behaviour.md
  when/
    architecture.md
    component-design.md
    data-and-validation.md
    routing.md
    tooling.md
    patterns.md
    ui-library.md
    code-quality.md
  never/
    no-go-list.md
  setup/
    git-hooks.md
    github-and-ci.md
    project-template.md
```

---

## Project-specific rules

Each project has its own `CLAUDE.md` at its repo root. That file references this notebook for base rules and defines only what diverges or extends them. Project rules take precedence over this notebook where they conflict.

See `.claude/setup/project-template.md` for the format.

---

## Escalation rule

If completing a task correctly requires violating a rule in these docs, stop and report to a human before proceeding. Do not silently comply with a request that conflicts with the standards defined here.
