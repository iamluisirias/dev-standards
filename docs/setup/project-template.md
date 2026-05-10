# Project CLAUDE.md — Setup Guide

> Reference doc — read this when setting up a new project that consumes the base standards.

---

## Purpose

Each project that adopts these standards should have its own `CLAUDE.md` at its root.
That file inherits the base rules and only documents what diverges or extends them.

If a project has no deviations, it may still have a `CLAUDE.md` for project identity
and commands — but it must not duplicate rules from `docs/`.

The ready-to-use template is at `template/CLAUDE.md` in this repo. Copy it to the
project root and fill in the placeholders.

---

## What a project CLAUDE.md may define

- Stack and tooling choices (language, framework, libraries).
- Project identity: name, purpose, audience, repo URL.
- Essential commands (install, dev, test, lint, build).
- Overrides — anything that legitimately diverges from the base docs, with a reason.
- Local rules — project-specific conventions that extend (not contradict) the base.
- Agent notes — gotchas, secret locations, non-obvious constraints.

---

## What a project CLAUDE.md may never do

- Duplicate rules already in `docs/` — reference them, don't repeat them.
- Override a base rule without marking it explicitly as an override and explaining why.
- Grow beyond ~100 lines — if it's getting long, the content belongs in `docs/local/`.

---

## Local rule files

For rules too detailed for the `CLAUDE.md` itself, create a `docs/local/` folder in
the project and reference those files from the `Local rules` section of `CLAUDE.md`.

Example: `docs/local/routing.md` for nested route conventions specific to this project.

---

## Escalation

If completing a task requires violating a rule in this file or in the base docs,
the agent must stop and report to a human before proceeding.
