# dev-standards

Personal development standards: conventions, Claude Code configuration, and project templates.

Serves two audiences simultaneously — **you as a developer** (conventions to follow) and **AI agents** (rules to enforce). The docs are the single source of truth; the `.claude/` configuration is a thin layer that points agents to those docs.

---

## Repo structure

```
dev-standards/
├── CLAUDE.md                   # Entry point — index of all docs, read before every task
├── docs/
│   ├── always/                 # Mandatory reads for every task (preamble, agent behaviour)
│   ├── never/                  # Explicit prohibitions
│   ├── setup/                  # Infrastructure guides (hooks, CI, MCPs, subagents)
│   └── when/                   # Task-specific docs (architecture, forms, testing, etc.)
├── template/
│   └── CLAUDE.md               # Copy this to a new project and fill in the placeholders
├── .claude/
│   ├── agents/                 # Subagent definitions (committer, reviewer, scaffolder, tester)
│   │   └── memory/             # reviewer-context.md — project-specific anti-patterns
│   ├── hooks/                  # Security hooks (pre-bash, pre-write, audit-log)
│   ├── scripts/
│   │   ├── setup-claude.ts     # Copies this config to a target project
│   │   └── validate-config.ts  # Validates the config is complete and coherent
│   ├── skills/                 # Reusable task procedures (commit, review-pr, scaffold-feature)
│   └── settings.json           # Hook wiring and MCP declarations
└── marketplace.json            # Plugin manifest for Claude Code marketplace distribution
```

---

## Adopting the standard in a project

### New project

```bash
mkdir my-project && cd my-project
git init
pnpm dlx tsx /path/to/dev-standards/.claude/scripts/setup-claude.ts --target .
cp /path/to/dev-standards/template/CLAUDE.md ./CLAUDE.md
```

Fill in the placeholders in `CLAUDE.md`, then follow the manual steps printed by the script.

### Existing project

```bash
pnpm dlx tsx /path/to/dev-standards/.claude/scripts/setup-claude.ts --target /path/to/project
```

Use `--force` to overwrite files that already exist. The script never overwrites `.gitignore` — it appends to it.

### After setup

Run the config validator to confirm everything is wired correctly:

```bash
pnpm dlx tsx .claude/scripts/validate-config.ts
```

---

## How to evolve the standard

**Adding a new convention** — add or edit a file in `docs/when/` or `docs/never/`. Update the doc map table in `CLAUDE.md` if you add a new file. No other changes needed.

**Changing an always-read rule** — edit `docs/always/preamble.md` or `docs/always/agent-behaviour.md`. These are read on every task, so changes take effect immediately on next use.

**Adding a new subagent or skill** — create the file in `.claude/agents/` or `.claude/skills/`. Add it to `validate-config.ts` so the validator catches drift. Update `setup-claude.ts` if it should be distributed to projects.

**Removing a subagent, hook, or skill** — this is a breaking change. Bump the major version in `marketplace.json` and note what was removed.

**Rule belongs in the linter, not a doc** — if a rule can be enforced mechanically (a lint rule, a type error), move it there. Docs are for rules that require judgment.

---

## Versioning

Follows semver in `marketplace.json`.

| Change | Version bump |
|---|---|
| Remove or rename an agent, hook, or skill | Major |
| Add a new doc, agent, skill, or hook | Minor |
| Edit wording in a doc, fix a hook bug | Patch |

---

## What not to do

- **Do not add rules to agent prompts.** Rules live in `docs/` — agents read them, they don't embed them.
- **Do not add stack-specific rules to `docs/always/` or `docs/when/`.** Those belong in a project's own `docs/local/`.
- **Do not grow `CLAUDE.md` past ~100 lines.** It is an index, not a rulebook.
- **Do not duplicate rules across projects.** If three projects share the same override, it belongs in the standard.
