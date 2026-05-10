# Subagents

> Reference doc — fetch when setting up a new repository, creating a new subagent, or reviewing agent configuration.

---

## What subagents are

Subagents are specialized Claude instances that handle specific types of tasks in their own isolated context window. Each one has a focused system prompt, restricted tool access, and independent permissions.

The key benefit over the main conversation: verbose output (test logs, lint results, git diffs) stays inside the subagent's context. Only the summary returns to your main conversation, preserving context for the work that matters.

They are defined as Markdown files with YAML frontmatter stored in `.claude/agents/`.

---

## Subagents in this project

### `reviewer` — code review
Read-only. Reviews staged or recent changes against project standards in `docs/`. Reports critical issues, warnings, and suggestions. Never modifies files.

**Use:** After writing or modifying any code. `@reviewer look at the auth changes`

**Tools:** Read, Grep, Glob, Bash(git diff *), Bash(git log *), Bash(git status *), Bash(git show *)
**Model:** Sonnet

---

### `scaffolder` — feature scaffolding
Write-only to `src/features/`. Creates the correct folder structure and placeholder files for new features. Never modifies existing files. Faster and cheaper than using the main conversation for this.

**Use:** When starting a new feature. `Use the scaffolder to create the payments feature with components, hooks, queries, and schemas`

**Tools:** Read, Glob, Write, Bash (pnpm scaffold, ls, test)
**Model:** Haiku (fast, low cost)

---

### `tester` — test runner
Runs quality checks (`typecheck`, `lint`, `test`, `build`) and returns only failures. Keeps test output out of your main conversation context.

**Use:** Before committing or when debugging failures. `Use the tester to run the full suite and report only failures`

**Tools:** Read, Bash (restricted to permitted commands), Glob, Grep
**Model:** Haiku

---

### `committer` — git commits
Validates staged changes are coherent, runs typecheck and lint, writes a Conventional Commits message with scope, and commits. Never pushes. Blocked from committing to `main`, `staging`, or `dev` by the `pre-bash` hook.

**Use:** When ready to commit. `Use the committer to commit the current staged changes`

**Tools:** Bash(git *), Bash(pnpm typecheck), Bash(pnpm lint), Bash(pnpm format:check)
**Model:** Haiku

---

## File structure

```
.claude/
  agents/
    reviewer.md
    scaffolder.md
    tester.md
    committer.md
    memory/
      reviewer-context.md
  hooks/
    pre-bash.hook.ts
    pre-write.hook.ts
    audit-log.hook.ts
  skills/
    commit/
      SKILL.md
    review-pr/
      SKILL.md
    scaffold-feature/
      SKILL.md
    add-backend-step/
      SKILL.md
    add-product-category/
      SKILL.md
  settings.json
```

---

## Invoking subagents

Three ways, from least to most explicit:

```
# Natural language — Claude decides whether to delegate
Use the reviewer to check my recent changes

# @-mention — guarantees the subagent runs
@reviewer look at the auth module changes

# Session-wide — whole session uses that subagent
claude --agent reviewer
```

---

## Adding a new subagent

1. Create `.claude/agents/[name].md` with YAML frontmatter and a system prompt.
2. Required frontmatter fields: `name`, `description`.
3. Write a clear `description` — Claude uses it to decide when to delegate automatically.
4. Restrict `tools` to only what the subagent needs — principle of least privilege.
5. Choose `model: haiku` for fast, focused tasks; `model: sonnet` for reasoning-heavy tasks.
6. If the subagent needs to enforce constraints beyond tool restrictions, add `hooks` in the frontmatter.
7. Document it in this file.

### Frontmatter reference

```yaml
---
name: my-agent                  # required — kebab-case
description: When to use it     # required — Claude reads this to decide when to delegate
tools: Read, Glob, Bash         # omit to inherit all tools
disallowedTools: Write, Edit    # alternative: inherit all except these
model: haiku                    # haiku | sonnet | opus | inherit
permissionMode: default         # default | acceptEdits | auto | bypassPermissions | plan
memory: project                 # project | user | local — enables cross-session learning
maxTurns: 10                    # max agentic turns before stopping
hooks:                          # lifecycle hooks scoped to this subagent
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "..."
---
```

### Memory scopes

| Scope | Location | Use when |
|---|---|---|
| `project` | `.claude/agents/memory/` | Knowledge is project-specific — check into git |
| `user` | `~/.claude/agent-memory/[name]/` | Knowledge applies across all projects |
| `local` | `.claude/agent-memory-local/[name]/` | Project-specific but not committed |

---

## Subagent scope and priority

When multiple subagents share the same name, higher-priority location wins:

| Location | Scope | Priority |
|---|---|---|
| Managed settings | Organisation-wide | 1 (highest) |
| `.claude/agents/` | Current project | 2 |
| `~/.claude/agents/` | All your projects | 3 |
| Plugin `agents/` directory | Where plugin is enabled | 4 (lowest) |

Project subagents in `.claude/agents/` are committed to version control — the whole team gets them automatically.

---

## What subagents cannot do

- Spawn other subagents (nesting is not supported)
- Access the parent conversation's context (they start fresh, except forks)
- Override the project's `pre-bash` and `pre-write` hooks unless explicitly configured with their own

---

## Built-in subagents (Claude Code defaults)

Claude Code includes built-in subagents that activate automatically:

| Agent | Model | Purpose |
|---|---|---|
| `Explore` | Haiku | Read-only codebase search and analysis |
| `Plan` | Inherits | Research for plan mode |
| `General-purpose` | Inherits | Complex multi-step tasks |

To disable a built-in: add `Agent(Explore)` to `permissions.deny` in `settings.json`.