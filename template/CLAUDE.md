# CLAUDE.md — [Project name]

## Base standards

All base rules live in `docs/`. Read `docs/always/preamble.md` and
`docs/always/agent-behaviour.md` before every task. Use the doc map
in the root `CLAUDE.md` to find task-specific docs.

---

## Project identity

- **App:** [name]
- **Purpose:** [one sentence]
- **Audience:** [who uses it]
- **Repo:** [url]

---

## Commands

| Task | Command |
|---|---|
| Install | |
| Dev server | |
| Test | |
| Lint / format | |
| Build | |

---

## Stack

<!-- List the language, runtime, frameworks, and key libraries for this project. -->
<!-- Only what's needed for the agent to understand context — not every dependency. -->

| Layer | Choice |
|---|---|
| Language | |
| Runtime | |
| Framework | |
| Styling | |
| Testing | |

---

## Overrides

<!-- Document anything that diverges from the base standards. -->
<!-- If nothing diverges, write: "None — follows the base standard." -->
<!-- Example: "Uses fetch directly instead of an HTTP client — no interceptor layer." -->

---

## Local rules

<!-- Rules specific to this project that extend (not contradict) the base docs. -->
<!-- Keep rule files under docs/local/ and reference them here. -->
<!-- Example: "See docs/local/routing.md for nested route conventions." -->

---

## Agent notes

<!-- Operational context the agent needs to work effectively: -->
<!-- - Where secrets live and how to reference them -->
<!-- - Known gotchas or non-obvious constraints -->
<!-- - Anything that would surprise a developer on their first day -->

---

## Escalation

If completing a task requires violating a rule in this file or in the
base docs, stop and report to a human before proceeding.
