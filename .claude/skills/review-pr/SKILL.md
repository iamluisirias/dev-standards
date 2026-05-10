---
name: review-pr
description: Review staged changes or a branch diff against project standards. Use before opening a PR or after finishing a feature. Reports critical issues, warnings, and suggestions organized by file. Never modifies files.
disable-model-invocation: false
allowed-tools: Read Grep Glob Bash(git *)
---

## Before starting

Read `docs/never/no-go-list.md` — applies to every file reviewed regardless of domain.
Read `docs/always/preamble.md` — for TypeScript invariants and import rules.
Do not apply rules from memory.

## Steps

1. Determine what to review:
   - If arguments are provided (`$ARGUMENTS`), treat as a branch name and run `git diff main...$ARGUMENTS`.
   - If nothing is provided, run `git diff --staged` first. If nothing is staged, fall back to `git diff HEAD~1`.
2. Read each changed file in full.
3. For each file, identify which `docs/when/` doc applies based on its location and read it:

   | File location | Read |
   |---|---|
   | `components/` | `docs/when/component-design.md`, `docs/when/ui-library.md`, `docs/when/accessibility.md` |
   | `hooks/` | `docs/when/patterns.md`, `docs/when/code-quality.md` |
   | `services/` | `docs/when/api-layer.md` |
   | `queries/` | `docs/when/api-layer.md`, `docs/when/state-management.md` |
   | `stores/` | `docs/when/state-management.md` |
   | `schemas/` | `docs/when/data-and-validation.md` |
   | `routes/` | `docs/when/routing.md` |
   | Form files | `docs/when/forms.md` |
   | Animation files | `docs/when/animations.md` |

4. Review each file against what you read. Do not apply rules from memory.
5. Produce the report.

## Report format

Group findings by file. For each finding:

```
**[CRITICAL | WARNING | SUGGESTION]** `path/to/file.ts` line N
> current code
Fix: corrected version or explanation
```

**Critical** — violates a rule from `docs/`, must be fixed before merging
**Warning** — should be fixed, degrades quality or consistency
**Suggestion** — optional improvement worth considering

End with a summary line:
`✅ No issues found` or `❌ N critical · N warnings · N suggestions`

## What NOT to do

- Never modify any file
- Never stage or commit anything
- Never apply rules from memory — always read the relevant doc first