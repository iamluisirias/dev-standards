// ? Receives the Claude Code tool call as JSON on stdin.
// ? process.exit(1) blocks the action. process.exit(0) allows it.

import { readFileSync } from "fs";

type ToolCall = {
  tool_name: string;
  tool_input: {
    command?: string;
  };
};

function block(reason: string): never {
  process.stderr.write(`BLOCKED: ${reason}\n`);
  process.exit(1);
}

const raw = readFileSync(0, "utf-8");
const input: ToolCall = JSON.parse(raw);
const command = input.tool_input.command ?? "";

// ── Destructive filesystem operations ────────────────────────────────────────
if (/rm\s+-rf|rm\s+--no-preserve-root/.test(command)) {
  block("Recursive or forced deletions are not permitted.");
}

if (/truncate\s+--size\s*0/.test(command)) {
  block("Destructive truncation is not permitted.");
}

// ── Git — protected branches ──────────────────────────────────────────────────
if (/git\s+push/.test(command)) {
  if (/\bmain\b|\bstaging\b|\bdev\b/.test(command)) {
    block("Direct push to main, staging or dev is not permitted. Open a PR.");
  }
}

if (/git\s+push\s+.*--force|git\s+push\s+.*-f\b/.test(command)) {
  block("Force push is not permitted.");
}

// ── Git — bypass Husky ────────────────────────────────────────────────────────
if (/git\s+commit\s+.*--no-verify|git\s+commit\s+.*-n\b/.test(command)) {
  block("Bypassing Husky hooks with --no-verify is not permitted.");
}

// ── Package management — unauthorised package managers ───────────────────────
if (/^\s*(npm\s+install|npm\s+i\b|yarn\s+add|yarn\s+install)/.test(command)) {
  block("Only pnpm is permitted as a package manager. Use: pnpm install.");
}

// ── Package management — runtime dependencies ─────────────────────────────────
if (/pnpm\s+add\b/.test(command) && !/pnpm\s+add\s+(-D|--save-dev)/.test(command)) {
  block(
    "Adding a runtime dependency requires explicit confirmation that the package is part of the approved stack. " +
    "Use pnpm add -D for dev dependencies."
  );
}

// ── Secrets ───────────────────────────────────────────────────────────────────
if (/(AUTH_TOKEN|API_KEY|SECRET|PASSWORD|PRIVATE_KEY)\s*=\s*["'][^"']{8,}/i.test(command)) {
  block("Potential secret detected in command. Never hardcode credentials.");
}

// ── Critical config files — shell edits ──────────────────────────────────────
if (/(tsconfig\.json|biome\.json|vite\.config\.(ts|js)|package\.json)/.test(command)) {
  if (/\bsed\s+-i|\bawk\b/.test(command)) {
    block("Modifying critical config files via shell commands requires manual approval.");
  }
}

process.exit(0);