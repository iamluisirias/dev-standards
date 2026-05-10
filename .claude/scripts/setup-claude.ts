/**
 * Copies Claude Code configuration from this project to a target project.
 *
 * Usage:
 *   pnpm setup:claude --target /path/to/new-project
 *   pnpm setup:claude --target /path/to/new-project --force
 *
 * What gets copied:
 *   .claude/hooks/         → security hooks (pre-bash, pre-write, audit-log)
 *   .claude/agents/        → subagent definitions (reviewer-context reset to blank)
 *   .claude/skills/        → reusable task procedures referenced by agents
 *   .claude/scripts/       → validate-config.ts + tsconfig.json (setup-claude.ts excluded)
 *   .claude/settings.json  → hooks + MCP config
 *   docs/                  → all project standards documentation
 *   .mcp.json              → MCP server definitions
 *   .npmrc                 → npm registry auth template
 *   CLAUDE.md              → documentation gateway
 *
 * What is NOT copied:
 *   src/                   → project source code
 *   .env / .env.*          → environment variable values
 *   .env.example           → project-specific variable names
 *   package.json           → project config (see manual steps below)
 *   .claude/audit.log      → local only
 */

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { parseArgs } from "util";

// ── Args ──────────────────────────────────────────────────────────────────────

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    target: { type: "string" },
    force: { type: "boolean", default: false },
  },
});

if (!values.target) {
  console.error("Error: --target <path> is required\n");
  console.error("  pnpm setup:claude --target /path/to/new-project");
  process.exit(1);
}

const src = resolve(import.meta.dirname, "../..");
const dest = resolve(values.target);
const force = values.force ?? false;

// ── Helpers ───────────────────────────────────────────────────────────────────

type Status = "copied" | "skipped" | "reset";

const log: { status: Status; path: string }[] = [];

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyItem(srcRel: string, destRel: string, status: Status = "copied") {
  const srcPath = resolve(src, srcRel);
  const destPath = resolve(dest, destRel);

  if (!existsSync(srcPath)) {
    console.warn(`  ! Source not found, skipping: ${srcRel}`);
    return;
  }

  if (existsSync(destPath) && !force) {
    log.push({ status: "skipped", path: destRel });
    return;
  }

  ensureDir(dirname(destPath));
  cpSync(srcPath, destPath, { recursive: true, force: true });
  log.push({ status, path: destRel });
}

function writeItem(destRel: string, content: string) {
  const destPath = resolve(dest, destRel);

  if (existsSync(destPath) && !force) {
    log.push({ status: "skipped", path: destRel });
    return;
  }

  ensureDir(dirname(destPath));
  writeFileSync(destPath, content, "utf-8");
  log.push({ status: "reset", path: destRel });
}

function mergeGitignore() {
  const destPath = resolve(dest, ".gitignore");
  const additions = ["", "# Claude Code", ".claude/audit.log", ""].join("\n");

  if (!existsSync(destPath)) {
    writeFileSync(destPath, additions.trimStart(), "utf-8");
    log.push({ status: "copied", path: ".gitignore" });
    return;
  }

  const existing = readFileSync(destPath, "utf-8");
  if (existing.includes(".claude/audit.log")) {
    log.push({ status: "skipped", path: ".gitignore (already has Claude entries)" });
    return;
  }

  writeFileSync(destPath, existing + additions, "utf-8");
  log.push({ status: "copied", path: ".gitignore (Claude entries appended)" });
}

// ── Reviewer context template (blank — project-specific content stays here) ──

const REVIEWER_CONTEXT_TEMPLATE = `# Reviewer context — <project name>

Known patterns, past findings, and project-specific decisions for the code reviewer.
Append new entries when a pattern is worth remembering across sessions.

---

## Anti-patterns found in this project

_Add entries here as the reviewer discovers recurring issues._

---

## Architecture decisions not documented in \`docs/\`

_Add entries here for project-specific decisions that are not in the docs._

---

## Instructions for the reviewer

- Read this section before starting any review
- If you detect a new recurring pattern not covered in \`docs/\`, add it here with date and status
- Do not duplicate rules already in \`docs/\` — only record what is specific to this codebase
`;

// ── Copy items ────────────────────────────────────────────────────────────────

console.log(`\nSetting up Claude Code configuration`);
console.log(`  Source: ${src}`);
console.log(`  Target: ${dest}`);
console.log(`  Force:  ${force ? "yes (overwrite existing)" : "no (skip existing)"}\n`);

ensureDir(dest);

// Hooks
copyItem(".claude/hooks/pre-bash.hook.ts", ".claude/hooks/pre-bash.hook.ts");
copyItem(".claude/hooks/pre-write.hook.ts", ".claude/hooks/pre-write.hook.ts");
copyItem(".claude/hooks/audit-log.hook.ts", ".claude/hooks/audit-log.hook.ts");

// Settings
copyItem(".claude/settings.json", ".claude/settings.json");

// Validation script + TS config for Node types
copyItem(".claude/scripts/validate-config.ts", ".claude/scripts/validate-config.ts");
copyItem(".claude/scripts/tsconfig.json", ".claude/scripts/tsconfig.json");

// Agents — copy definitions, reset memory to blank template
copyItem(".claude/agents/reviewer.md", ".claude/agents/reviewer.md");
copyItem(".claude/agents/committer.md", ".claude/agents/committer.md");
copyItem(".claude/agents/scaffolder.md", ".claude/agents/scaffolder.md");
copyItem(".claude/agents/tester.md", ".claude/agents/tester.md");
writeItem(".claude/agents/memory/reviewer-context.md", REVIEWER_CONTEXT_TEMPLATE);

// Skills — required by agents (reviewer, scaffolder, committer)
copyItem(".claude/skills/", ".claude/skills/");

// Docs (full standards library)
copyItem("docs/", "docs/");

// Root config files
copyItem(".mcp.json", ".mcp.json");
copyItem(".npmrc", ".npmrc");
copyItem("CLAUDE.md", "CLAUDE.md");

// Gitignore — merge, don't overwrite
mergeGitignore();

// ── Report ────────────────────────────────────────────────────────────────────

const icons: Record<Status, string> = { copied: "✓", skipped: "~", reset: "↺" };
const labels: Record<Status, string> = {
  copied: "copied",
  skipped: "skipped (use --force to overwrite)",
  reset: "reset to blank template",
};

const grouped = {
  copied: log.filter((l) => l.status === "copied"),
  reset: log.filter((l) => l.status === "reset"),
  skipped: log.filter((l) => l.status === "skipped"),
};

for (const [status, items] of Object.entries(grouped) as [Status, typeof log][]) {
  if (!items.length) continue;
  console.log(`\n${labels[status]}`);
  for (const { path } of items) {
    console.log(`  ${icons[status]} ${path}`);
  }
}

// ── Manual steps ──────────────────────────────────────────────────────────────

console.log(`
────────────────────────────────────────────
Manual steps required in the target project:
────────────────────────────────────────────

1. package.json — add these scripts:
   "check:claude": "pnpm dlx tsx .claude/scripts/validate-config.ts"

2. .env.example — create with the variables your project needs.
   See docs/when/env-and-config.md for the pattern.

3. src/config/env.ts — create the typed env config.
   See docs/when/env-and-config.md for the Valibot schema pattern.

4. NPM_TOKEN — set as system env var or in ~/.npmrc:
   //registry.npmjs.org/:_authToken=<your-token>

5. CLAUDE.md — update the doc map if you add project-specific docs.

6. reviewer-context.md — update the project name placeholder.

Run pnpm check:claude after setup to verify the configuration is valid.
`);
