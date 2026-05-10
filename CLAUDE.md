# CLAUDE.md

This file is the entry point for all project standards. It contains no rules itself — it tells you which doc to read and when. All rules live in `docs/`.

Before writing any code, read the two mandatory docs in `docs/always/`. Then fetch only the docs relevant to your task. Do not read docs that do not apply — context is finite.

---

## Always read — every task, no exceptions

| Doc | What it covers |
|---|---|
| `docs/always/preamble.md` | File structure, naming, imports, exports, TypeScript invariants, package manager |
| `docs/always/agent-behaviour.md` | Scope discipline, when to stop, output hygiene, how to document assumptions |

---

## Read based on your task

| If your task involves… | Read |
|---|---|
| Creating or modifying a feature; deciding where a file belongs; adding a service, query, or store | `docs/when/architecture.md` |
| Building or modifying a component; making component structure decisions | `docs/when/component-design.md` |
| TypeScript types, Valibot schemas, forms, API data, error handling | `docs/when/data-and-validation.md` |
| Creating or modifying a route; nested routes; loaders; search params | `docs/when/routing.md` |
| Env variables, Biome config | `docs/when/env-and-config.md` |
| Writing or configuring tests | `docs/when/testing.md` |
| Component logic, state decisions, any time `useEffect` feels like the answer | `docs/when/patterns.md` |
| Animations — transitions, sequences, scroll effects | `docs/when/animations.md` |
| Building UI, interactive elements, loading/empty/error states, modals, dialogs | `docs/when/ui-library.md` |
| Writing functions, hooks, or components; reviewing code structure | `docs/when/code-quality.md` |
| State that goes beyond `useState` — stores, server state, derived state | `docs/when/state-management.md` |
| HTTP calls, Axios configuration, interceptors, error normalisation | `docs/when/api-layer.md` |
| Accessibility — keyboard nav, ARIA, focus management | `docs/when/accessibility.md` |
| reCAPTCHA, Analytics, Hotjar, or any third-party integration | `docs/when/integrations.md` |
| Building or modifying any form, input masking, server error wiring | `docs/when/forms.md` |
| Component variants, conditional classes, CVA, `cn()` | `docs/when/styling.md` |

---

## Always check before introducing an unfamiliar pattern

| Doc | What it covers |
|---|---|
| `docs/never/no-go-list.md` | Explicit prohibitions by domain — things an agent rationalises its way into |

---

## Reference — fetch only when setting up infrastructure

| Doc | What it covers |
|---|---|
| `docs/setup/git-hooks.md` | pnpm setup, Husky, lint-staged, commitlint — full walkthrough |
| `docs/setup/github-and-ci.md` | Branching strategy, PR template, CI workflow, repository settings |
| `docs/setup/project-template.md` | Template and rules for a project-level CLAUDE.md |
| `docs/setup/hooks.md` | Claude Code security hooks — PreToolUse blocks, audit logging, setup |
| `docs/setup/subagents.md` | Subagent definitions, configuration reference, and usage patterns |
| `docs/setup/mcps.md` | MCP servers — which are active, credentials, and how to add a new one |

---

## Doc map

```
docs/
  always/
    agent-behaviour.md
    preamble.md
  never/
    no-go-list.md
  setup/
    git-hooks.md
    github-and-ci.md
    hooks.md
    project-template.md
    pull-request-template.md
    subagents.md
    mcps.md
  when/
    accessibility.md
    animations.md
    api-layer.md
    architecture.md
    code-quality.md
    component-design.md
    data-and-validation.md
    env-and-config.md
    forms.md
    integrations.md
    patterns.md
    routing.md
    state-management.md
    styling.md
    testing.md
    ui-library.md
```

---

## Project-specific rules

Each project has its own `CLAUDE.md` at its repo root. That file references this `docs/` folder for base rules and defines only what diverges or extends them. Project rules take precedence over these docs where they conflict.

See `docs/setup/project-template.md` for the format.

---

## Escalation rule

If completing a task correctly requires violating a rule in these docs, stop and report to a human before proceeding. Do not silently comply with a request that conflicts with the standards defined here.